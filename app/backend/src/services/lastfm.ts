import { env } from '../config/env';
import { redis } from '../config/redis';
import { REDIS_TTL } from '../config/constants';
import { ApiError } from '../utils/ApiError';

const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
const MBID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isMbid = (s: string) => MBID_RE.test(s);

/** SUPCONTENT compound id pattern: "Artist::Album" or "Artist::Track". */
function decodeCompound(id: string): { artist?: string; name: string } {
  const idx = id.indexOf('::');
  if (idx === -1) return { name: id };
  return { artist: id.slice(0, idx), name: id.slice(idx + 2) };
}

async function lastfmRequest(params: Record<string, string>): Promise<any> {
  if (!env.LASTFM_API_KEY) {
    throw new ApiError(503, 'Clé API Last.fm non configurée sur le serveur');
  }
  const url = new URL(BASE_URL);
  url.searchParams.set('api_key', env.LASTFM_API_KEY);
  url.searchParams.set('format', 'json');
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url.toString());
  if (!res.ok) {
    if (res.status === 404) throw new ApiError(404, 'Ressource musicale introuvable');
    throw new ApiError(502, `Erreur Last.fm (${res.status})`);
  }
  const data: any = await res.json();
  // Last.fm returns 200 with an `error` field on logical failures (e.g. unknown artist)
  if (data?.error) {
    if (data.error === 6) throw new ApiError(404, 'Ressource musicale introuvable');
    throw new ApiError(502, `Erreur Last.fm: ${data.message || 'inconnue'}`);
  }
  return data;
}

async function cached<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
}

export async function search(query: string, type: string = 'artist', limit: number = 20) {
  return cached(`search:${type}:${query}:${limit}`, REDIS_TTL.SEARCH, async () => {
    const methodMap: Record<string, string> = {
      artist: 'artist.search',
      album: 'album.search',
      track: 'track.search',
    };
    const data = await lastfmRequest({ method: methodMap[type] || 'artist.search', [type]: query, limit: String(limit) });

    if (type === 'artist') return data.results?.artistmatches?.artist || [];
    if (type === 'album') return data.results?.albummatches?.album || [];
    if (type === 'track') return data.results?.trackmatches?.track || [];
    return [];
  });
}

function artistParams(id: string): Record<string, string> {
  return isMbid(id) ? { mbid: id } : { artist: id, autocorrect: '1' };
}

export async function getArtist(artistId: string) {
  return cached(`artist:${artistId}`, REDIS_TTL.ENTITY, () =>
    lastfmRequest({ method: 'artist.getinfo', ...artistParams(artistId) }).then(d => d.artist)
  );
}

export async function getArtistAlbums(artistId: string) {
  return cached(`artist:${artistId}:albums`, REDIS_TTL.ENTITY, () =>
    lastfmRequest({ method: 'artist.gettopalbums', ...artistParams(artistId), limit: '50' }).then(d => d.topalbums?.album || [])
  );
}

export async function getSimilarArtists(artistId: string) {
  return cached(`similar:${artistId}`, REDIS_TTL.SIMILAR, () =>
    lastfmRequest({ method: 'artist.getsimilar', ...artistParams(artistId), limit: '20' }).then(d => d.similarartists?.artist || [])
  );
}

export async function getAlbum(albumId: string) {
  return cached(`album:${albumId}`, REDIS_TTL.ENTITY, () => {
    const params: Record<string, string> = { method: 'album.getinfo', autocorrect: '1' };
    if (isMbid(albumId)) {
      params.mbid = albumId;
    } else {
      const { artist, name } = decodeCompound(albumId);
      if (!artist) throw new ApiError(400, "Identifiant d'album invalide (format attendu: Artiste::Album)");
      params.artist = artist;
      params.album = name;
    }
    return lastfmRequest(params).then(d => d.album);
  });
}

function stripFeatures(name: string): string {
  return name
    .replace(/\s*[\(\[]?\s*(feat\.?|ft\.?|with)\s+[^)\]]+[\)\]]?/gi, '')
    .replace(/\s*[-–]\s*(feat\.?|ft\.?|with)\s+.+$/gi, '')
    .replace(/\s*\+\s+.+$/, '')
    .trim();
}

export async function getTrack(trackId: string) {
  return cached(`track:${trackId}`, REDIS_TTL.ENTITY, async () => {
    const baseParams: Record<string, string> = { method: 'track.getinfo', autocorrect: '1' };
    if (isMbid(trackId)) {
      try {
        const data = await lastfmRequest({ ...baseParams, mbid: trackId });
        return data.track;
      } catch (err) {
        if (!(err instanceof ApiError) || err.statusCode !== 404) throw err;
        throw err;
      }
    }
    const { artist, name } = decodeCompound(trackId);
    if (!artist) throw new ApiError(400, "Identifiant de titre invalide (format attendu: Artiste::Titre)");
    try {
      const data = await lastfmRequest({ ...baseParams, artist, track: name });
      return data.track;
    } catch (err) {
      if (!(err instanceof ApiError) || err.statusCode !== 404) throw err;
      const stripped = stripFeatures(name);
      if (stripped && stripped !== name) {
        const data = await lastfmRequest({ ...baseParams, artist, track: stripped });
        return data.track;
      }
      throw err;
    }
  });
}

export async function getChartArtists() {
  return cached('chart:artists', REDIS_TTL.CHART, () =>
    lastfmRequest({ method: 'chart.gettopartists', limit: '50' }).then(d => d.artists?.artist || [])
  );
}

export async function getChartTracks() {
  return cached('chart:tracks', REDIS_TTL.CHART, () =>
    lastfmRequest({ method: 'chart.gettoptracks', limit: '50' }).then(d => d.tracks?.track || [])
  );
}
