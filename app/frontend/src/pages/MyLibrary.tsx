import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

const TYPE_PATH: Record<string, string> = { ARTIST: 'artists', ALBUM: 'albums', TRACK: 'tracks' };

const STATUS_KEYS = ['TO_LISTEN', 'LISTENING', 'DONE', 'ABANDONED'] as const;

export default function MyLibrary() {
  const { t } = useTranslation();
  const STATUS_LABELS: Record<string, string> = {
    TO_LISTEN: t('library.status.TO_LISTEN'),
    LISTENING: t('library.status.LISTENING'),
    DONE: t('library.status.DONE'),
    ABANDONED: t('library.status.ABANDONED'),
  };
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const params = filter ? `?status=${filter}` : '';
    api(`/library${params}`).then(res => setItems(res.data)).catch(console.error);
    api('/library/stats').then(setStats).catch(console.error);
  }, [filter]);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>{t('library.title')}</h2>

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {stats.byStatus?.map((s: any) => (
            <div key={s.status} style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '0.875rem' }}>
              <strong>{s._count}</strong> <span style={{ color: 'var(--color-text-secondary)' }}>{STATUS_LABELS[s.status] || s.status}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={!filter ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter('')}>{t('common.all')}</button>
        {STATUS_KEYS.map(k => (
          <button key={k} className={filter === k ? 'btn-primary' : 'btn-secondary'} onClick={() => setFilter(k)}>{STATUS_LABELS[k]}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {items.map(item => (
          <Link key={item.id} to={`/${TYPE_PATH[item.mediaType]}/${encodeURIComponent(item.externalId)}`} style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', display: 'flex', gap: '0.875rem', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
            {item.imageUrl ? (
              <img src={item.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            ) : (
              <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--color-bg)', flexShrink: 0 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title || item.externalId}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.artistName ? `${item.artistName} · ` : ''}{t(`common.${item.mediaType.toLowerCase()}`)} · {STATUS_LABELS[item.status]}
              </p>
            </div>
            {item.rating && <span style={{ color: 'var(--color-accent)', fontWeight: 600, flexShrink: 0 }}>{item.rating}/5</span>}
          </Link>
        ))}
        {items.length === 0 && <p className="empty-state">{t('library.empty')}</p>}
      </div>
    </div>
  );
}
