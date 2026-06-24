import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { getIo } from '../config/socket';

async function checkMutualFollow(userId1: string, userId2: string) {
  const [a, b] = await Promise.all([
    prisma.follow.findUnique({ where: { followerId_followedId: { followerId: userId1, followedId: userId2 } } }),
    prisma.follow.findUnique({ where: { followerId_followedId: { followerId: userId2, followedId: userId1 } } }),
  ]);
  if (!a || !b) throw ApiError.forbidden('Mutual follow required to send messages');
}

export async function getConversations(userId: string) {
  // Get unique conversation partners
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: 'desc' },
    include: {
      sender: { select: { id: true, username: true, avatarUrl: true } },
      receiver: { select: { id: true, username: true, avatarUrl: true } },
    },
  });

  const seen = new Set<string>();
  const conversations: any[] = [];
  for (const msg of messages) {
    const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
    if (seen.has(partnerId)) continue;
    seen.add(partnerId);
    const partner = msg.senderId === userId ? msg.receiver : msg.sender;
    const unread = await prisma.message.count({ where: { senderId: partnerId, receiverId: userId, readAt: null } });
    conversations.push({ partner, lastMessage: msg, unreadCount: unread });
  }
  return conversations;
}

export async function getMessages(userId: string, partnerUsername: string, skip: number, take: number) {
  const partner = await prisma.user.findUnique({ where: { username: partnerUsername }, select: { id: true } });
  if (!partner) throw ApiError.notFound('User not found');

  const where = {
    OR: [
      { senderId: userId, receiverId: partner.id },
      { senderId: partner.id, receiverId: userId },
    ],
  };

  const [data, total] = await Promise.all([
    prisma.message.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.message.count({ where }),
  ]);

  // Mark unread messages as read
  await prisma.message.updateMany({
    where: { senderId: partner.id, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  });

  return { data: data.reverse(), total };
}

export async function sendMessage(senderId: string, partnerUsername: string, content: string) {
  const partner = await prisma.user.findUnique({ where: { username: partnerUsername }, select: { id: true } });
  if (!partner) throw ApiError.notFound('User not found');

  await checkMutualFollow(senderId, partner.id);

  const message = await prisma.message.create({
    data: { senderId, receiverId: partner.id, content },
  });

  const io = getIo();
  if (io) {
    try {
      io.to(`user:${partner.id}`).emit('message:new', message);
    } catch (err) {
      console.error('[WebSocket] Failed to emit message:new', err);
    }
  }

  return message;
}
