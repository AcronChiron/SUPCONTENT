import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EditProfile() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/users/me').then((user: any) => {
      setBio(user.bio || '');
      setWebsiteUrl(user.websiteUrl || '');
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api('/users/me', { method: 'PATCH', body: JSON.stringify({ bio, websiteUrl: websiteUrl || undefined }) });
      navigate('/profile');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api('/users/me', { method: 'DELETE' });
      logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t('profile.edit')}</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t('profile.bio')}</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={500} rows={4} placeholder={t('profile.bioPlaceholder')} />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t('profile.website')}</label>
          <input type="url" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/profile')}>{t('common.cancel')}</button>
        </div>
      </form>

      <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #1A1F3C' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#E8325A', marginBottom: '0.75rem' }}>Zone de danger</h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
          La suppression est irréversible. Toutes vos données seront effacées.
        </p>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            style={{ background: 'transparent', border: '1px solid #E8325A', color: '#E8325A', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}
          >
            Supprimer mon compte
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#E8325A', fontWeight: 600 }}>Êtes-vous sûr ? Cette action est irréversible.</p>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: '#E8325A', border: 'none', color: '#fff', borderRadius: 8, padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                {deleting ? 'Suppression...' : 'Confirmer la suppression'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
