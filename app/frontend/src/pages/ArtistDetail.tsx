import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { pickImage, gradientFromString } from '../utils/image';
import MediaActions from '../components/MediaActions';

export default function ArtistDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [artist, setArtist] = useState<any>(null);
  const [albums, setAlbums] = useState<any[]>([]);
  const [similar, setSimilar] = useState<any[]>([]);

  const fetchArtist = () => {
    if (!id) return;
    api(`/music/artists/${id}`).then(setArtist).catch(console.error);
  };

  useEffect(() => {
    if (!id) return;
    setArtist(null); setAlbums([]); setSimilar([]);
    api(`/music/artists/${id}`).then(setArtist).catch(console.error);
    api(`/music/artists/${id}/albums`).then(res => setAlbums(res.data || [])).catch(console.error);
    api(`/music/artists/${id}/similar`).then(res => setSimilar(res.data || [])).catch(() => {});
  }, [id]);

  if (!artist) return <div className="page-loading">{t('common.loading')}</div>;

  const img = pickImage(artist.image);
  const gradient = gradientFromString(artist.name || 'artist');
  const listeners = artist.stats?.listeners || artist.listeners;

  return (
    <div className="animate-in">
      <div className="media-header">
        <div className="media-cover circle" style={!img ? { background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 80, fontWeight: 900 } : undefined}>
          {img ? <img src={img} alt={artist.name} /> : artist.name?.charAt(0).toUpperCase()}
        </div>
        <div className="media-info">
          <div className="media-tag">{t('common.artist')}</div>
          <h1 className="media-title">{artist.name}</h1>
          <div className="media-meta">
            {artist.stats?.avgRating != null && <><span><strong style={{ color: 'var(--text-primary)' }}>{artist.stats.avgRating.toFixed(1)}</strong>{t('artist.avgRating')}</span><span className="media-meta-dot" /></>}
            <span>{artist.stats?.reviewCount ?? 0} {t('common.reviews')}</span>
            <span className="media-meta-dot" />
            <span>{artist.stats?.inLibraryCount ?? 0} {t('common.inLibraries')}</span>
            {listeners && <><span className="media-meta-dot" /><span>{Number(listeners).toLocaleString()} {t('common.listeners')}</span></>}
          </div>
          {artist.bio?.summary && (
            <p className="media-bio" dangerouslySetInnerHTML={{ __html: artist.bio.summary }} />
          )}
          <MediaActions externalId={id!} mediaType="ARTIST" initialStatus={artist.stats?.myStatus} initialRating={artist.stats?.myRating} title={artist.name} artistName={artist.name} imageUrl={artist.image?.[3]?.['#text']} onReviewSubmitted={fetchArtist} />
        </div>
      </div>

      {albums.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <h2 className="section-title">{t('common.albums')}</h2>
            <span className="section-subtitle">{albums.length} {t('artist.releases')}</span>
          </div>
          <div className="card-grid">
            {albums.slice(0, 24).map((a: any, i: number) => {
              const cover = pickImage(a.image);
              return (
                <Link to={`/albums/${encodeURIComponent(a.mbid || `${artist.name}::${a.name}`)}`} key={i} className="card">
                  <div className="card-image">
                    {cover ? <img src={cover} alt={a.name} /> : <div className="placeholder" style={{ background: gradientFromString(a.name || '') }} />}
                  </div>
                  <div className="card-info">
                    <p className="card-title">{a.name}</p>
                    <p className="card-subtitle">{artist.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {similar.length > 0 && (
        <section className="page-section">
          <div className="section-header">
            <h2 className="section-title">{t('artist.fansAlsoLike')}</h2>
          </div>
          <div className="card-grid">
            {similar.slice(0, 12).map((s: any, i: number) => {
              const cover = pickImage(s.image);
              return (
                <Link to={`/artists/${s.mbid || s.name}`} key={i} className="card">
                  <div className="card-image" style={{ borderRadius: '50%' }}>
                    {cover ? <img src={cover} alt={s.name} /> : <div className="placeholder" style={{ background: gradientFromString(s.name || '') }} />}
                  </div>
                  <div className="card-info" style={{ textAlign: 'center' }}>
                    <p className="card-title">{s.name}</p>
                    <p className="card-subtitle">{t('common.artist')}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
