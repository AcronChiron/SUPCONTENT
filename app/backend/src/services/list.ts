import { prisma } from '../config/database';
import { ApiError } from '../utils/ApiError';
import { PaginationParams } from '../utils/pagination';
import { MediaType } from '@prisma/client';

export async function getLists(userId: string, pagination: PaginationParams) {
  const [data, total] = await Promise.all([
    prisma.customList.findMany({ where: { userId }, skip: pagination.skip, take: pagination.perPage, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { items: true } } } }),
    prisma.customList.count({ where: { userId } }),
  ]);
  return { data, total };
}

export async function createList(userId: string, data: { name: string; description?: string; isPublic?: boolean }) {
  return prisma.customList.create({ data: { userId, ...data } });
}

export async function getList(listId: string, requesterId?: string) {
  const list = await prisma.customList.findUnique({
    where: { id: listId },
    include: { items: { orderBy: { position: 'asc' } }, user: { select: { id: true, username: true, avatarUrl: true } } },
  });
  if (!list) throw ApiError.notFound('List not found');
  if (!list.isPublic && list.userId !== requesterId) throw ApiError.forbidden('Private list');
  return list;
}

export async function updateList(userId: string, listId: string, data: { name?: string; description?: string; isPublic?: boolean }) {
  const list = await prisma.customList.findFirst({ where: { id: listId, userId } });
  if (!list) throw ApiError.notFound('List not found');
  return prisma.customList.update({ where: { id: listId }, data });
}

export async function deleteList(userId: string, listId: string) {
  const list = await prisma.customList.findFirst({ where: { id: listId, userId } });
  if (!list) throw ApiError.notFound('List not found');
  await prisma.customList.delete({ where: { id: listId } });
}

export async function addItem(userId: string, listId: string, data: { externalId: string; mediaType: MediaType }) {
  const list = await prisma.customList.findFirst({ where: { id: listId, userId } });
  if (!list) throw ApiError.notFound('List not found');
  const maxPos = await prisma.customListItem.aggregate({ where: { listId }, _max: { position: true } });
  return prisma.customListItem.create({ data: { listId, externalId: data.externalId, mediaType: data.mediaType, position: (maxPos._max.position || 0) + 1 } });
}

export async function removeItem(userId: string, listId: string, externalId: string) {
  const list = await prisma.customList.findFirst({ where: { id: listId, userId } });
  if (!list) throw ApiError.notFound('List not found');
  await prisma.customListItem.deleteMany({ where: { listId, externalId } });
}
