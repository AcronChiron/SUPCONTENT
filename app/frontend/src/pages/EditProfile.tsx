import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export default function EditProfile() {
  const { t } = useTranslation();
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api('/users/me').then(user => {
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
    </div>
  );
}
