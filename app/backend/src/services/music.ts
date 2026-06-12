import { prisma } from '../config/database';
import * as lastfm from './lastfm';
import * as youtube from './youtube';

// Enrich music data with SUPCONTENT stats
async function enrichWithStats(externalId: string, userId?: string) {
  const [reviews, libraryCount] = await Promise.all([
    prisma.review.aggregate({
      where: { externalId },
      _avg: { rating: true },
      _count: { id: true },
    }),
    prisma.libraryItem.count({ where: { externalId } }),
  ]);

  const stats: any = {
    avgRating: reviews._avg.rating || null,
    reviewCount: reviews._count.id,
    inLibraryCount: libraryCount,
  };

  if (userId) {
    const [myReview, myLibrary] = await Promise.all([
      prisma.review.findUnique({ where: { userId_externalId: { userId, externalId } }, select: { rating: true } }),
      prisma.libraryItem.findUnique({ where: { userId_externalId: { userId, externalId } }, select: { status: true } }),
    ]);
    stats.myRating = myReview?.rating || null;
    stats.myStatus = myLibrary?.status || null;
  }

  return stats;
}

export async function search(query: string, type: string, limit: number) {
  return lastfm.search(query, type, limit);
}

export async function getArtist(artistId: string, userId?: string) {
  const [artist, stats] = await Promise.all([
    lastfm.getArtist(artistId),
    enrichWithStats(artistId, userId),
  ]);
  return { ...artist, stats };
}

export async function getArtistAlbums(artistId: string) {
  return lastfm.getArtistAlbums(artistId);
}

export async function getSimilarArtists(artistId: string) {
  return lastfm.getSimilarArtists(artistId);
}

export async function getAlbum(albumId: string, userId?: string) {
  const [album, stats] = await Promise.all([
    lastfm.getAlbum(albumId),
    enrichWithStats(albumId, userId),
  ]);
  return { ...album, stats };
}

export async function getTrack(trackId: string, userId?: string) {
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

export async function getChartArtists() {
  return lastfm.getChartArtists();
}

export async function getChartTracks() {
  return lastfm.getChartTracks();
}

export async function getMediaReviews(externalId: string, page: number, perPage: number) {
  const skip = (page - 1) * perPage;
  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where: { externalId },
      skip, take: perPage,
      include: { user: { select: { id: true, username: true, avatarUrl: true } }, _count: { select: { likes: true, comments: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where: { externalId } }),
  ]);
  return { data, total };
}
