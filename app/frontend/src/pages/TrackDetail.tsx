import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import YouTubePlayer from '../components/YouTubePlayer';
import MediaActions from '../components/MediaActions';

export default function TrackDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [track, setTrack] = useState<any>(null);

  const fetchMedia = () => {
    if (id) api(`/music/tracks/${id}`).then(setTrack).catch(console.error);
  };

  useEffect(() => {
    if (id) api(`/music/tracks/${id}`).then(setTrack).catch(console.error);
  }, [id]);

  if (!track) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{track.name}</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>{track.artist?.name}</p>

      {track.stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {track.stats.avgRating && <span>{t('track.avg')}: {track.stats.avgRating.toFixed(1)}/5</span>}
          <span>{track.stats.reviewCount} {t('common.reviews')}</span>
        </div>
      )}

      {track.videoId && <YouTubePlayer videoId={track.videoId} />}

      <MediaActions externalId={id!} mediaType="TRACK" initialStatus={track.stats?.myStatus} initialRating={track.stats?.myRating} title={track.name} artistName={track.artist?.name} imageUrl={track.album?.image?.[3]?.['#text'] || track.image?.[3]?.['#text']}  onReviewSubmitted={fetchMedia} />

      {track.wiki?.summary && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>{t('track.about')}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: 1.8 }} dangerouslySetInnerHTML={{ __html: track.wiki.summary }} />
        </div>
      )}
    </div>
  );
}
