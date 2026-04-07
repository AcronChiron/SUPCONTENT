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
exports.getMediaReviews = exports.getChartTracks = exports.getChartArtists = exports.getTrack = exports.getAlbum = exports.getSimilarArtists = exports.getArtistAlbums = exports.getArtist = exports.search = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const pagination_1 = require("../utils/pagination");
const musicService = __importStar(require("../services/music"));
exports.search = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { q, type = 'artist', limit = '20' } = req.query;
    if (!q)
        return res.status(400).json({ error: 'Query parameter q is required' });
    const results = await musicService.search(q, type, parseInt(limit));
    res.json({ data: results });
});
exports.getArtist = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const artist = await musicService.getArtist(req.params.artistId, req.user?.userId);
    res.json(artist);
});
exports.getArtistAlbums = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const albums = await musicService.getArtistAlbums(req.params.artistId);
    res.json({ data: albums });
});
exports.getSimilarArtists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const artists = await musicService.getSimilarArtists(req.params.artistId);
    res.json({ data: artists });
});
exports.getAlbum = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const album = await musicService.getAlbum(req.params.albumId, req.user?.userId);
    res.json(album);
});
exports.getTrack = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const track = await musicService.getTrack(req.params.trackId, req.user?.userId);
    res.json(track);
});
exports.getChartArtists = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const artists = await musicService.getChartArtists();
    res.json({ data: artists });
});
exports.getChartTracks = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const tracks = await musicService.getChartTracks();
    res.json({ data: tracks });
});
exports.getMediaReviews = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const pagination = (0, pagination_1.parsePagination)(req.query);
    const { data, total } = await musicService.getMediaReviews(req.params.externalId, pagination.page, pagination.perPage);
    res.json((0, pagination_1.paginate)(data, total, pagination));
});
//# sourceMappingURL=music.js.map