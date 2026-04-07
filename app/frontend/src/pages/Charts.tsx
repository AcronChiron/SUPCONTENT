import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { pickImage, gradientFromString } from '../utils/image';

export default function Charts() {
  const { t } = useTranslation();
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [tab, setTab] = useState<'artists' | 'tracks'>('artists');

  useEffect(() => {
    api('/music/chart/artists').then(res => setArtists(res.data)).catch(console.error);
    api('/music/chart/tracks').then(res => setTracks(res.data)).catch(console.error);
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t('charts.title')}</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={tab === 'artists' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('artists')}>{t('charts.topArtists')}</button>
        <button className={tab === 'tracks' ? 'btn-primary' : 'btn-secondary'} onClick={() => setTab('tracks')}>{t('charts.topTracks')}</button>
      </div>

      <div className="search-grid">
        {(tab === 'artists' ? artists : tracks).map((item: any, i: number) => {
          const cover = pickImage(item.image);
          return (
          <Link to={tab === 'artists'
              ? `/artists/${encodeURIComponent(item.mbid || item.name)}`
              : `/tracks/${encodeURIComponent(`${(typeof item.artist === 'string' ? item.artist : item.artist?.name) || ''}::${item.name}`)}`}
              key={i} className="search-card">
            <div className="search-card-img">
              {cover ? <img src={cover} alt={item.name} /> : <div className="placeholder" style={{ background: gradientFromString(item.name || '') }} />}
            </div>
            <div className="search-card-info">
              <p className="search-card-name">{item.name}</p>
              {item.artist && <p className="search-card-sub">{typeof item.artist === 'string' ? item.artist : item.artist.name}</p>}
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
}
