"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLists = getLists;
exports.createList = createList;
exports.getList = getList;
exports.updateList = updateList;
exports.deleteList = deleteList;
exports.addItem = addItem;
exports.removeItem = removeItem;
const database_1 = require("../config/database");
const ApiError_1 = require("../utils/ApiError");
async function getLists(userId, pagination) {
    const [data, total] = await Promise.all([
        database_1.prisma.customList.findMany({ where: { userId }, skip: pagination.skip, take: pagination.perPage, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { items: true } } } }),
        database_1.prisma.customList.count({ where: { userId } }),
    ]);
    return { data, total };
}
async function createList(userId, data) {
    return database_1.prisma.customList.create({ data: { userId, ...data } });
}
async function getList(listId, requesterId) {
    const list = await database_1.prisma.customList.findUnique({
        where: { id: listId },
        include: { items: { orderBy: { position: 'asc' } }, user: { select: { id: true, username: true, avatarUrl: true } } },
    });
    if (!list)
        throw ApiError_1.ApiError.notFound('List not found');
    if (!list.isPublic && list.userId !== requesterId)
        throw ApiError_1.ApiError.forbidden('Private list');
    return list;
}
async function updateList(userId, listId, data) {
    const list = await database_1.prisma.customList.findFirst({ where: { id: listId, userId } });
    if (!list)
        throw ApiError_1.ApiError.notFound('List not found');
    return database_1.prisma.customList.update({ where: { id: listId }, data });
}
async function deleteList(userId, listId) {
    const list = await database_1.prisma.customList.findFirst({ where: { id: listId, userId } });
    if (!list)
        throw ApiError_1.ApiError.notFound('List not found');
    await database_1.prisma.customList.delete({ where: { id: listId } });
}
async function addItem(userId, listId, data) {
    const list = await database_1.prisma.customList.findFirst({ where: { id: listId, userId } });
    if (!list)
        throw ApiError_1.ApiError.notFound('List not found');
    const maxPos = await database_1.prisma.customListItem.aggregate({ where: { listId }, _max: { position: true } });
    return database_1.prisma.customListItem.create({ data: { listId, externalId: data.externalId, mediaType: data.mediaType, position: (maxPos._max.position || 0) + 1 } });
}
async function removeItem(userId, listId, externalId) {
    const list = await database_1.prisma.customList.findFirst({ where: { id: listId, userId } });
    if (!list)
        throw ApiError_1.ApiError.notFound('List not found');
    await database_1.prisma.customListItem.deleteMany({ where: { listId, externalId } });
}
//# sourceMappingURL=list.js.map