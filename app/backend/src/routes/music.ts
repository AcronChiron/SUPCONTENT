import { Router } from 'express';
import * as musicCtrl from '../controllers/music';
import { optionalAuth } from '../middlewares/auth';

export const musicRouter = Router();

musicRouter.get('/search', musicCtrl.search);
musicRouter.get('/artists/:artistId', optionalAuth, musicCtrl.getArtist);
musicRouter.get('/artists/:artistId/albums', musicCtrl.getArtistAlbums);
musicRouter.get('/artists/:artistId/similar', musicCtrl.getSimilarArtists);
musicRouter.get('/albums/:albumId', optionalAuth, musicCtrl.getAlbum);
musicRouter.get('/tracks/:trackId', optionalAuth, musicCtrl.getTrack);
musicRouter.get('/chart/artists', musicCtrl.getChartArtists);
musicRouter.get('/chart/tracks', musicCtrl.getChartTracks);
musicRouter.get('/:mediaType/:externalId/reviews', musicCtrl.getMediaReviews);
