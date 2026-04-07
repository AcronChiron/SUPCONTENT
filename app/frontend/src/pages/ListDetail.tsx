import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export default function ListDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [list, setList] = useState<any>(null);

  useEffect(() => {
    if (id) api(`/lists/${id}`).then(setList).catch(console.error);
  }, [id]);

  if (!list) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{list.name}</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
        {t('list.by')} {list.user.username} · {list.items.length} {t('list.items')}
      </p>
      {list.description && <p style={{ marginBottom: '1.5rem' }}>{list.description}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.items.map((item: any, i: number) => (
          <div key={item.id} style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{i + 1}</span>
            <span>{item.externalId}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{item.mediaType}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
