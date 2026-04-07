# Documentation technique — SUPCONTENT

> L'Instagram de la Musique — réseau social centré musique.
> Projet académique 3PROJ (2024-2025).

---

## 1. Vue d'ensemble

SUPCONTENT est composé de **trois briques** communiquant exclusivement via HTTP/WebSocket :

```
┌────────────────┐     ┌────────────────┐
│  Frontend Web  │     │  Mobile Expo   │
│  (React/Vite)  │     │ (React Native) │
└───────┬────────┘     └────────┬───────┘
        │                       │
        │    REST + Socket.io   │
        └───────────┬───────────┘
                    ▼
        ┌──────────────────────┐
        │  Backend (Node/TS)   │
        │  Express + Prisma    │
        │  Socket.io + Proxy   │
        └──┬───────────────┬───┘
           │               │
     ┌─────▼─────┐   ┌─────▼─────┐
     │ Postgres  │   │  Redis 7  │
     │    15     │   │  (cache)  │
     └───────────┘   └───────────┘
                │
     ┌──────────▼───────────┐
     │  Last.fm + YouTube   │
     │   (proxy uniquement) │
     └──────────────────────┘
```

Les clients n'accèdent **jamais** directement aux APIs tierces ni aux secrets.
Toute la logique métier vit dans le backend.

---

## 2. Arborescence

```
SUPCONTENT/
├── app/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/       # env, database, redis, constants
│   │   │   ├── controllers/  # handlers Express (validation + réponse)
│   │   │   ├── services/     # logique métier, accès BDD, proxy API
│   │   │   ├── routes/       # déclaration des routes /api/v1/*
│   │   │   ├── middlewares/  # auth JWT, rate limit, error handler, zod
│   │   │   ├── utils/        # ApiError, pagination, asyncHandler
│   │   │   ├── websocket/    # handlers Socket.io
│   │   │   └── index.ts      # bootstrap Express + Socket.io
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/   # migrations SQL versionnées
│   │   ├── tests/            # vitest (utils, middlewares, services)
│   │   └── Dockerfile
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/   # Layout, ReviewCard, YouTubePlayer
│   │   │   ├── pages/        # 22 pages (Auth, Feed, Search, Profile, ...)
│   │   │   ├── services/     # api.ts (fetch + refresh auto)
│   │   │   ├── context/      # AuthContext, SocketContext
│   │   │   └── styles/       # variables design tokens
│   │   ├── tests/
│   │   └── Dockerfile (nginx)
│   └── mobile/
│       └── src/
│           ├── screens/      # 10 écrans (Login, Home, Library, Chat, ...)
│           ├── services/     # api.ts
│           └── context/      # AuthContext
├── docs/
├── docker-compose.yml
└── .env.example
```

---

## 3. Backend

### 3.1 Stack

- **Node.js 20**, **TypeScript strict**
- **Express 4** comme framework HTTP
- **Prisma 5** ORM, PostgreSQL 15
- **ioredis** client Redis 7
- **Socket.io 4** pour le temps réel
- **zod** pour la validation de toutes les entrées
- **bcrypt**, **jsonwebtoken**, **helmet**, **express-rate-limit**, **cors**, **cookie-parser**

### 3.2 Authentification

- **JWT** : `accessToken` 15 min (Bearer) + `refreshToken` 30 jours (httpOnly cookie, path `/api/v1/auth`)
- Refresh automatique côté client : sur `401`, le client tente un refresh puis rejoue la requête.
- **OAuth 2.0** : Google et GitHub, callback serveur qui redirige vers `/auth/callback?token=...` avec set-cookie.

### 3.3 Rate limiting

- Global : `100 req/min` par IP
- `/auth/*` : `10 req/min` par IP
- Export RGPD : `1 export / 24h` par utilisateur

### 3.4 Proxy Last.fm + YouTube

Seul le backend détient les clés API. Les réponses Last.fm sont enrichies avec les stats
SUPCONTENT (`avgRating`, `reviewCount`, `inLibraryCount`, et si JWT : `myRating`, `myStatus`)
avant d'être renvoyées au client.

Cache Redis appliqué avec TTL variables :

| Clé                                       | TTL    |
| ----------------------------------------- | ------ |
| `search:{query}`                          | 1 h    |
| `artist:{id}`, `album:{id}`, `track:{id}` | 6 h    |
| `youtube:{trackId}`                       | 7 j    |
| `chart:artists`, `chart:tracks`           | 30 min |
| `similar:{artistId}`                      | 6 h    |

### 3.5 WebSocket (Socket.io)

Authentification au handshake via `auth.token` (JWT access).

**Events serveur → client**

| Event              | Déclencheur                    |
| ------------------ | ------------------------------ |
| `message:new`      | Nouveau message privé          |
| `notification:new` | Like, commentaire, nouveau follower |
| `feed:activity`    | Nouvelle activité dans le feed |

**Events client → serveur**

| Event                        | Effet                           |
| ---------------------------- | ------------------------------- |
| `message:read`               | Marque un message comme lu      |
| `typing:start` / `typing:stop` | Indicateur de saisie            |

### 3.6 Gestion d'erreurs

Un `errorHandler` global convertit les `ApiError` en réponses JSON standardisées `{ error: string }`
avec le bon code HTTP (`400`, `401`, `403`, `404`, `409`, `429`, `500`).

---

## 4. Base de données

Entités principales : `User`, `Follow`, `LibraryItem`, `CustomList`, `CustomListItem`,
`Review`, `Comment`, `Like`, `Message`, `Report`, `Notification`, `MediaCache`.

Contraintes clés :

- `Review` : UNIQUE `(userId, externalId)` — une critique par œuvre par user
- `Like` : UNIQUE `(userId, reviewId)`
- `Follow` : UNIQUE `(followerId, followedId)` + CHECK `followerId ≠ followedId`
- Toutes les FK utilisateur : `ON DELETE CASCADE` (conformité RGPD)

Voir `app/backend/prisma/schema.prisma` pour le schéma complet.

La migration initiale est versionnée dans
`app/backend/prisma/migrations/20260101000000_init/migration.sql`.

---

## 5. Frontend Web

### 5.1 Design system

- **Dark mode** par défaut (palette `#0D0F1A` / `#1A1F3C` / `#E8325A` / `#6B3FA0` / `#F0F2FF`)
- **Police** : Inter (sans), JetBrains Mono (mono)
- **Icônes** : Lucide React
- **Border radius** : 12 px
- **Grille pochettes** ratio 1:1 (inspiration Instagram)

### 5.2 Routing

Pages principales : Login, Register, Feed, Discover, Search, Charts, ArtistDetail,
AlbumDetail, TrackDetail, Profile, MyLibrary, ListDetail, ReviewDetail, Conversations,
Chat, Notifications, EditProfile, AdminDashboard, AuthCallback.

### 5.3 Couche API

`src/services/api.ts` expose une fonction `api<T>(path, options)` qui :

- injecte automatiquement le `Bearer` token
- inclut `credentials: include` (pour le cookie refresh)
- tente un refresh puis rejoue la requête sur un `401`
- retourne le JSON parsé ou lève une `Error` avec le message serveur

---

## 6. Mobile

React Native via **Expo**. Écrans livrés :
Login, Register, Home (feed), Search, Profile, Library, Notifications,
Conversations, Chat, MediaDetail.

Navigation : `@react-navigation/native-stack`.
Le service `api.ts` et le `AuthContext` partagent le même contrat que le web.

---

## 7. Docker

`docker-compose.yml` orchestre 4 services :

| Service  | Image                | Port   | Healthcheck |
| -------- | -------------------- | ------ | ----------- |
| db       | postgres:15-alpine   | 5432   | `pg_isready` |
| redis    | redis:7-alpine       | 6379   | `redis-cli ping` |
| backend  | build `app/backend`  | 3000   | *dépend de db+redis healthy* |
| frontend | build `app/frontend` → nginx | 5173 → 80 | — |

Le Dockerfile backend applique automatiquement `prisma migrate deploy` avant de
démarrer le serveur.

---

## 8. Tests

**Backend** (`cd app/backend && npm test`) — vitest :

- `ApiError.test.ts` — factories et codes HTTP
- `pagination.test.ts` — parsing + bornes + meta
- `errorHandler.test.ts` — middleware d'erreur
- `auth.middleware.test.ts` — `authenticate`, `optionalAuth`, `requireAdmin`
- `auth.service.test.ts` — `generateTokens`

**Frontend** (`cd app/frontend && npm test`) — vitest + RTL :

- `api.test.ts` — token storage, retry auto sur 401, gestion d'erreur
- `ReviewCard.test.tsx` — rendu + liens

---

## 9. Sécurité & conformité

- Secrets **uniquement** via `process.env`, validés au démarrage par `zod` (`config/env.ts`)
- Mots de passe : bcrypt 12 rounds
- Helmet, CORS restreint à `CLIENT_WEB_URL`
- Rate limiting global et sur `/auth/*`
- Cookies refresh : `httpOnly`, `sameSite=lax`, `secure` en production
- **RGPD** : export JSON/CSV via `/export/my-data` (cooldown 24 h) + suppression
  en cascade de toutes les données liées à un utilisateur supprimé

---

## 10. Conventions

- Commits : `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Simplicité > complexité — le code doit être explicable à l'oral
- Claude Code est utilisé comme assistant de développement, **pas comme contributeur**
  (aucun commit signé Claude, aucune opération git automatisée)
