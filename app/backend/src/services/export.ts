import { prisma } from '../config/database';
import { redis } from '../config/redis';
import { ApiError } from '../utils/ApiError';

export async function exportUserData(userId: string, format: 'json' | 'csv') {
  // Rate limit: 1 export per 24h
  const key = `export:${userId}`;
  const last = await redis.get(key);
  if (last) throw ApiError.tooMany('Export available once per 24 hours');

  const [user, library, reviews, messages, lists] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, username: true, bio: true, createdAt: true } }),
    prisma.libraryItem.findMany({ where: { userId } }),
    prisma.review.findMany({ where: { userId } }),
    prisma.message.findMany({ where: { OR: [{ senderId: userId }, { receiverId: userId }] } }),
    prisma.customList.findMany({ where: { userId }, include: { items: true } }),
  ]);

  await redis.setex(key, 86400, '1');

  const data = { user, library, reviews, messages, lists, exportedAt: new Date().toISOString() };

  if (format === 'csv') {
    return { format: 'csv', content: jsonToCsv(data) };
  }
  return { format: 'json', content: data };
}

function jsonToCsv(data: any): string {
  const sections: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length > 0) {
      const headers = Object.keys(value[0]);
      const rows = value.map((item: any) => headers.map(h => JSON.stringify(item[h] ?? '')).join(','));
      sections.push(`--- ${key} ---\n${headers.join(',')}\n${rows.join('\n')}`);
    }
  }
  return sections.join('\n\n');
}
