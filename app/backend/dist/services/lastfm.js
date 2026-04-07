"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.getArtist = getArtist;
exports.getArtistAlbums = getArtistAlbums;
exports.getSimilarArtists = getSimilarArtists;
exports.getAlbum = getAlbum;
exports.getTrack = getTrack;
exports.getChartArtists = getChartArtists;
exports.getChartTracks = getChartTracks;
const env_1 = require("../config/env");
const redis_1 = require("../config/redis");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';
async function lastfmRequest(params) {
    if (!env_1.env.LASTFM_API_KEY) {
        throw new ApiError_1.ApiError(503, 'Last.fm API key not configured on server');
    }
    const url = new URL(BASE_URL);
    url.searchParams.set('api_key', env_1.env.LASTFM_API_KEY);
    url.searchParams.set('format', 'json');
    for (const [k, v] of Object.entries(params))
        url.searchParams.set(k, v);
    const res = await fetch(url.toString());
    if (!res.ok)
        throw new Error(`Last.fm API error: ${res.status}`);
    return res.json();
}
async function cached(key, ttl, fetcher) {
    const cached = await redis_1.redis.get(key);
    if (cached)
        return JSON.parse(cached);
    const data = await fetcher();
    await redis_1.redis.setex(key, ttl, JSON.stringify(data));
    return data;
}
async function search(query, type = 'artist', limit = 20) {
    return cached(`search:${type}:${query}:${limit}`, constants_1.REDIS_TTL.SEARCH, async () => {
        const methodMap = {
            artist: 'artist.search',
            album: 'album.search',
            track: 'track.search',
        };
        const data = await lastfmRequest({ method: methodMap[type] || 'artist.search', [type]: query, limit: String(limit) });
        if (type === 'artist')
            return data.results?.artistmatches?.artist || [];
        if (type === 'album')
            return data.results?.albummatches?.album || [];
        if (type === 'track')
            return data.results?.trackmatches?.track || [];
        return [];
    });
}
async function getArtist(artistId) {
    return cached(`artist:${artistId}`, constants_1.REDIS_TTL.ENTITY, () => lastfmRequest({ method: 'artist.getinfo', mbid: artistId }).then(d => d.artist));
}
async function getArtistAlbums(artistId) {
    return cached(`artist:${artistId}:albums`, constants_1.REDIS_TTL.ENTITY, () => lastfmRequest({ method: 'artist.gettopalbums', mbid: artistId, limit: '50' }).then(d => d.topalbums?.album || []));
}
async function getSimilarArtists(artistId) {
    return cached(`similar:${artistId}`, constants_1.REDIS_TTL.SIMILAR, () => lastfmRequest({ method: 'artist.getsimilar', mbid: artistId, limit: '20' }).then(d => d.similarartists?.artist || []));
}
async function getAlbum(albumId) {
    return cached(`album:${albumId}`, constants_1.REDIS_TTL.ENTITY, () => lastfmRequest({ method: 'album.getinfo', mbid: albumId }).then(d => d.album));
}
async function getTrack(trackId) {
    return cached(`track:${trackId}`, constants_1.REDIS_TTL.ENTITY, () => lastfmRequest({ method: 'track.getinfo', mbid: trackId }).then(d => d.track));
}
async function getChartArtists() {
    return cached('chart:artists', constants_1.REDIS_TTL.CHART, () => lastfmRequest({ method: 'chart.gettopartists', limit: '50' }).then(d => d.artists?.artist || []));
}
async function getChartTracks() {
    return cached('chart:tracks', constants_1.REDIS_TTL.CHART, () => lastfmRequest({ method: 'chart.gettoptracks', limit: '50' }).then(d => d.tracks?.track || []));
}
//# sourceMappingURL=lastfm.js.map