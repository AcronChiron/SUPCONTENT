# SUPCONTENT

**L'Instagram de la Musique** — réseau social centré sur la découverte, la notation et le partage musical.

Projet académique 3PROJ (2024-2025).

## Stack

| Brique    | Technologies                                                  |
| --------- | ------------------------------------------------------------- |
| Backend   | Node.js 20, TypeScript, Express, Prisma, PostgreSQL 15, Redis 7, Socket.io |
| Frontend  | React 18 + Vite, React Router, Socket.io client, Lucide       |
| Mobile    | React Native / Expo                                            |
| APIs      | Last.fm (métadonnées), YouTube Data v3 (videoId)              |

Les clients ne contactent **jamais** les APIs tierces directement : tout passe par le backend.

## Démarrage rapide (Docker)

```bash
cp .env.example .env
# Éditer .env pour fournir LASTFM_API_KEY, YOUTUBE_API_KEY et les secrets JWT
docker compose up --build
```

- Backend : http://localhost:3000
- Frontend : http://localhost:5173
- Postgres : localhost:5432 · Redis : localhost:6379

Les migrations Prisma s'exécutent automatiquement au démarrage du conteneur backend
(`prisma migrate deploy` dans le `CMD` du Dockerfile).

## Développement local (hors Docker)

### Backend

```bash
cd app/backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev        # http://localhost:3000
npm test           # vitest
```

### Frontend Web

```bash
cd app/frontend
cp .env.example .env
npm install
npm run dev        # http://localhost:5173
npm test
```

### Mobile

```bash
cd app/mobile
cp .env.example .env
npm install
npx expo start
```

## Structure

```
SUPCONTENT/
├── app/
│   ├── backend/     # API REST + WebSocket + proxy Last.fm/YouTube
│   ├── frontend/    # Client web React
│   └── mobile/      # Client mobile Expo
├── docs/            # Documentation technique + manuel utilisateur
├── docker-compose.yml
├── .env.example
└── README.md
```

## Documentation

- [`docs/DOCUMENTATION_TECHNIQUE.md`](docs/DOCUMENTATION_TECHNIQUE.md) — architecture détaillée
- [`docs/MANUEL_UTILISATEUR.md`](docs/MANUEL_UTILISATEUR.md) — guide utilisateur
- Swagger UI : http://localhost:3000/api-docs (dev uniquement)

## Tests

- **Backend** : `cd app/backend && npm test` — vitest (utils, middlewares, services)
- **Frontend** : `cd app/frontend && npm test` — vitest + React Testing Library

## Variables d'environnement requises

Voir `.env.example` pour la liste complète. Les secrets obligatoires :

- `DATABASE_URL`, `REDIS_URL`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `LASTFM_API_KEY`, `YOUTUBE_API_KEY`
- `OAUTH_GOOGLE_*`, `OAUTH_GITHUB_*`
- `CLIENT_WEB_URL`

## Licence

Projet académique — tous droits réservés.
