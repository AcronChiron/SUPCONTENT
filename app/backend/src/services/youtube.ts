import ytsr from 'ytsr';
import { redis } from '../config/redis';
import { REDIS_TTL } from '../config/constants';

export async function resolveVideoId(trackName: string, artistName: string): Promise<string | null> {
  const cacheKey = `youtube:${artistName}:${trackName}`;
  const cached = await redis.get(cacheKey);
  if (cached) return cached === 'null' ? null : cached;

  try {
    const query = `${artistName} ${trackName} official`;
    const results = await ytsr(query, { limit: 5 });
    const video = results.items.find((item: any) => item.type === 'video') as any;
    const videoId = video?.id || null;

    await redis.setex(cacheKey, REDIS_TTL.YOUTUBE, videoId || 'null');
    return videoId;
  } catch (err) {
    console.warn(`[youtube] ytsr error for "${artistName} - ${trackName}":`, err);
    await redis.setex(cacheKey, REDIS_TTL.YOUTUBE, 'null').catch(() => {});
    return null;
  }
}
