import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { pickImage, gradientFromString } from '../utils/image';
import MediaActions from '../components/MediaActions';

export default function AlbumDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [album, setAlbum] = useState<any>(null);

  useEffect(() => {
    if (id) { setAlbum(null); api(`/music/albums/${id}`).then(setAlbum).catch(console.error); }
  }, [id]);

  if (!album) return <div className="page-loading">{t('common.loading')}</div>;

  const img = pickImage(album.image);
  const gradient = gradientFromString(`${album.artist || ''}-${album.name || ''}`);
  const tracks = album.tracks?.track ? (Array.isArray(album.tracks.track) ? album.tracks.track : [album.tracks.track]) : [];

  return (
    <div className="animate-in">
      <div className="media-header">
        <div className="media-cover" style={!img ? { background: gradient } : undefined}>
          {img && <img src={img} alt={album.name} />}
        </div>
        <div className="media-info">
          <div className="media-tag">{t('common.album')}</div>
          <h1 className="media-title">{album.name}</h1>
          <div className="media-meta">
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{album.artist}</span>
            {album.stats?.avgRating != null && (<><span className="media-meta-dot" /><span><strong style={{ color: 'var(--text-primary)' }}>{album.stats.avgRating.toFixed(1)}</strong>{t('artist.avgRating')}</span></>)}
            <span className="media-meta-dot" />
            <span>{album.stats?.reviewCount ?? 0} {t('common.reviews')}</span>
            {tracks.length > 0 && <><span className="media-meta-dot" /><span>{tracks.length} {t('common.tracks').toLowerCase()}</span></>}
          </div>
          {album.wiki?.summary && <p className="media-bio" dangerouslySetInnerHTML={{ __html: album.wiki.summary }} />}
          <MediaActions externalId={id!} mediaType="ALBUM" initialStatus={album.stats?.myStatus} initialRating={album.stats?.myRating} title={album.name} artistName={album.artist} imageUrl={album.image?.[3]?.['#text']} />
        </div>
      </div>

      {tracks.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <h2 className="section-title">{t('album.tracklist')}</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {tracks.map((tr: any, i: number) => (
              <div key={i} className="list-item">
                <div style={{ width: 28, textAlign: 'center', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{tr['@attr']?.rank || i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tr.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{album.artist}</p>
                </div>
                {tr.duration > 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                    {Math.floor(tr.duration / 60)}:{String(tr.duration % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
