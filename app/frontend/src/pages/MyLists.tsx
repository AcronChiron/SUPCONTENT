import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus } from 'lucide-react';
import { api } from '../services/api';

export default function MyLists() {
  const { t } = useTranslation();
  const [lists, setLists] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    api('/lists').then(res => setLists(res.data)).catch(console.error);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const list = await api('/lists', { method: 'POST', body: JSON.stringify({ name, description: description || undefined, isPublic }) });
    setLists(prev => [{ ...list, _count: { items: 0 } }, ...prev]);
    setName(''); setDescription(''); setIsPublic(true); setShowCreate(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('list.deleteConfirm'))) return;
    await api(`/lists/${id}`, { method: 'DELETE' });
    setLists(prev => prev.filter(l => l.id !== id));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('list.title')}</h2>
        <button type="button" className="btn-primary" onClick={() => setShowCreate(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Plus size={16} /> {t('list.newList')}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
          <input name="name" value={name} onChange={e => setName(e.target.value)} placeholder={t('list.name')} required maxLength={100} />
          <textarea name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder={t('list.description')} rows={2} maxLength={500} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <input type="checkbox" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} style={{ width: 'auto' }} /> {t('list.public')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.8125rem' }}>{t('list.create')}</button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setShowCreate(false)}>{t('common.cancel')}</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {lists.map(l => (
          <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to={`/lists/${l.id}`} style={{ flex: 1, background: 'var(--color-surface)', padding: '0.875rem 1rem', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <p style={{ fontWeight: 600 }}>{l.name}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{l.isPublic ? t('list.public') : t('list.private')}</span>
              </div>
              {l.description && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{l.description}</p>}
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{l._count?.items ?? 0} {t('list.items')}</p>
            </Link>
            <button type="button" className="btn-icon" onClick={() => handleDelete(l.id)} title={t('common.delete')}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {lists.length === 0 && <p className="empty-state">{t('list.empty')}</p>}
      </div>
    </div>
  );
}
