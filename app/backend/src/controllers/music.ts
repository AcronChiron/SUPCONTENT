import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination, paginate } from '../utils/pagination';
import * as musicService from '../services/music';

export const search = asyncHandler(async (req: Request, res: Response) => {
  const { q, type = 'artist', limit = '20' } = req.query as Record<string, string>;
  if (!q) return res.status(400).json({ error: 'Query parameter q is required' });
  const results = await musicService.search(q, type, parseInt(limit));
  res.json({ data: results });
});

export const getArtist = asyncHandler(async (req: Request, res: Response) => {
  const artist = await musicService.getArtist(req.params.artistId, req.user?.userId);
  res.json(artist);
});

export const getArtistAlbums = asyncHandler(async (req: Request, res: Response) => {
  const albums = await musicService.getArtistAlbums(req.params.artistId);
  res.json({ data: albums });
});

export const getSimilarArtists = asyncHandler(async (req: Request, res: Response) => {
  const artists = await musicService.getSimilarArtists(req.params.artistId);
  res.json({ data: artists });
});

export const getAlbum = asyncHandler(async (req: Request, res: Response) => {
  const album = await musicService.getAlbum(req.params.albumId, req.user?.userId);
  res.json(album);
});

export const getTrack = asyncHandler(async (req: Request, res: Response) => {
  const track = await musicService.getTrack(req.params.trackId, req.user?.userId);
  res.json(track);
});

export const getChartArtists = asyncHandler(async (_req: Request, res: Response) => {
  const artists = await musicService.getChartArtists();
  res.json({ data: artists });
});

export const getChartTracks = asyncHandler(async (_req: Request, res: Response) => {
  const tracks = await musicService.getChartTracks();
  res.json({ data: tracks });
});

export const getMediaReviews = asyncHandler(async (req: Request, res: Response) => {
  const pagination = parsePagination(req.query as any);
  const { data, total } = await musicService.getMediaReviews(req.params.externalId, pagination.page, pagination.perPage);
  res.json(paginate(data, total, pagination));
});
