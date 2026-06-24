import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';

export default function ListDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [list, setList] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!id) return;
    api(`/lists/${id}`).then((l: any) => {
      setList(l);
      setName(l.name); setDescription(l.description || ''); setIsPublic(l.isPublic);
    }).catch(() => setNotFound(true));
  }, [id]);

  const isOwner = !!user && !!list && list.user.id === user.id;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const updated = await api(`/lists/${id}`, { method: 'PATCH', body: JSON.stringify({ name, description: description || undefined, isPublic }) });
    setList((l: any) => ({ ...l, ...updated }));
    setEditing(false);
  };

  const handleRemoveItem = async (externalId: string) => {
    if (!id) return;
    await api(`/lists/${id}/items/${encodeURIComponent(externalId)}`, { method: 'DELETE' });
    setList((l: any) => ({ ...l, items: l.items.filter((it: any) => it.externalId !== externalId) }));
  };

  if (notFound) return <NotFound />;
  if (!list) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      {!editing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{list.name}</h2>
            {isOwner && <button type="button" className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setEditing(true)}>{t('common.edit')}</button>}
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {t('list.by')} {list.user.username} · {list.items.length} {t('list.items')}
          </p>
          {list.description && <p style={{ marginBottom: '1.5rem' }}>{list.description}</p>}
        </>
      ) : (
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <input name="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('list.name')} required maxLength={100} />
          <textarea name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('list.description')} rows={2} maxLength={500} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 'auto' }} /> {t('list.public')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.8125rem' }}>{t('common.save')}</button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setEditing(false)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {list.items.map((item: any, i: number) => (
          <div key={item.id} style={{ background: 'var(--color-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{i + 1}</span>
            <span>{item.externalId}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>{item.mediaType}</span>
            {isOwner && (
              <button type="button" className="btn-icon" title={t('list.removeItem')} onClick={() => handleRemoveItem(item.externalId)}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
