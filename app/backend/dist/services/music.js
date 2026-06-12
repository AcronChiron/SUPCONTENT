"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.search = search;
exports.getArtist = getArtist;
exports.getArtistAlbums = getArtistAlbums;
exports.getSimilarArtists = getSimilarArtists;
exports.getAlbum = getAlbum;
exports.getTrack = getTrack;
exports.getChartArtists = getChartArtists;
exports.getChartTracks = getChartTracks;
exports.getMediaReviews = getMediaReviews;
const database_1 = require("../config/database");
const lastfm = __importStar(require("./lastfm"));
const youtube = __importStar(require("./youtube"));
// Enrich music data with SUPCONTENT stats
async function enrichWithStats(externalId, userId) {
    const [reviews, libraryCount] = await Promise.all([
        database_1.prisma.review.aggregate({
            where: { externalId },
            _avg: { rating: true },
            _count: { id: true },
        }),
        database_1.prisma.libraryItem.count({ where: { externalId } }),
    ]);
    const stats = {
        avgRating: reviews._avg.rating || null,
        reviewCount: reviews._count.id,
        inLibraryCount: libraryCount,
    };
    if (userId) {
        const [myReview, myLibrary] = await Promise.all([
            database_1.prisma.review.findUnique({ where: { userId_externalId: { userId, externalId } }, select: { rating: true } }),
            database_1.prisma.libraryItem.findUnique({ where: { userId_externalId: { userId, externalId } }, select: { status: true } }),
        ]);
        stats.myRating = myReview?.rating || null;
        stats.myStatus = myLibrary?.status || null;
    }
    return stats;
}
async function search(query, type, limit) {
    return lastfm.search(query, type, limit);
}
async function getArtist(artistId, userId) {
    const [artist, stats] = await Promise.all([
        lastfm.getArtist(artistId),
        enrichWithStats(artistId, userId),
    ]);
    return { ...artist, stats };
}
async function getArtistAlbums(artistId) {
    return lastfm.getArtistAlbums(artistId);
}
async function getSimilarArtists(artistId) {
    return lastfm.getSimilarArtists(artistId);
}
async function getAlbum(albumId, userId) {
    const [album, stats] = await Promise.all([
        lastfm.getAlbum(albumId),
        enrichWithStats(albumId, userId),
    ]);
    return { ...album, stats };
}
async function getTrack(trackId, userId) {
    const [track, stats] = await Promise.all([
        lastfm.getTrack(trackId),
        enrichWithStats(trackId, userId),
    ]);
    // Resolve YouTube videoId
    let videoId = null;
    if (track?.name && track?.artist?.name) {
        videoId = await youtube.resolveVideoId(track.name, track.artist.name);
    }
    return { ...track, videoId, stats };
}
async function getChartArtists() {
    return lastfm.getChartArtists();
}
async function getChartTracks() {
    return lastfm.getChartTracks();
}
async function getMediaReviews(externalId, page, perPage) {
    const skip = (page - 1) * perPage;
    const [data, total] = await Promise.all([
        database_1.prisma.review.findMany({
            where: { externalId },
            skip, take: perPage,
            include: { user: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { likes: true, comments: true } } },
            orderBy: { createdAt: 'desc' },
        }),
        database_1.prisma.review.count({ where: { externalId } }),
    ]);
    return { data, total };
}
//# sourceMappingURL=music.js.map