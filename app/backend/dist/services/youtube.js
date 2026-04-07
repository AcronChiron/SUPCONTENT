"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveVideoId = resolveVideoId;
const env_1 = require("../config/env");
const redis_1 = require("../config/redis");
const constants_1 = require("../config/constants");
async function resolveVideoId(trackName, artistName) {
    const cacheKey = `youtube:${artistName}:${trackName}`;
    const cached = await redis_1.redis.get(cacheKey);
    if (cached)
        return cached === 'null' ? null : cached;
    // Graceful degradation: no API key → no video (player hidden client-side)
    if (!env_1.env.YOUTUBE_API_KEY) {
        await redis_1.redis.setex(cacheKey, constants_1.REDIS_TTL.YOUTUBE, 'null');
        return null;
    }
    try {
        const query = `${artistName} ${trackName} official`;
        const url = new URL('https://www.googleapis.com/youtube/v3/search');
        url.searchParams.set('part', 'snippet');
        url.searchParams.set('q', query);
        url.searchParams.set('type', 'video');
        url.searchParams.set('maxResults', '1');
        url.searchParams.set('key', env_1.env.YOUTUBE_API_KEY);
        const res = await fetch(url.toString());
        if (!res.ok)
            return null;
        const data = await res.json();
        const videoId = data.items?.[0]?.id?.videoId || null;
        await redis_1.redis.setex(cacheKey, constants_1.REDIS_TTL.YOUTUBE, videoId || 'null');
        return videoId;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=youtube.js.map