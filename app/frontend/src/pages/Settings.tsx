import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { api, getToken } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface NotifPrefs {
  likes: boolean;
  comments: boolean;
  follows: boolean;
  new_release: boolean;
}

export default function Settings() {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('fr');
  const [prefs, setPrefs] = useState<NotifPrefs>({ likes: true, comments: true, follows: true, new_release: true });
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(false);

  useEffect(() => {
    setTheme(user?.theme === 'light' ? 'light' : 'dark');
    setLanguage(user?.language || 'fr');
    api<NotifPrefs>('/notifications/preferences').then(setPrefs).catch(() => {});
  }, [user]);

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleThemeChange = async (value: string) => {
    setTheme(value);
    const updated = await api('/users/me', { method: 'PATCH', body: JSON.stringify({ theme: value }) });
    setUser(updated);
    flashSaved();
  };

  const handleLanguageChange = async (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    const updated = await api('/users/me', { method: 'PATCH', body: JSON.stringify({ language: value }) });
    setUser(updated);
    flashSaved();
  };

  const handlePrefToggle = async (key: keyof NotifPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    await api('/notifications/preferences', { method: 'PATCH', body: JSON.stringify(next) });
    flashSaved();
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    setExportError(false);
    try {
      const res = await fetch(`/api/v1/export/my-data?format=${format}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error('export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supcontent-export.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t('settings.title')}</h2>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{t('settings.appearance')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t('settings.theme')}</label>
            <select value={theme} onChange={e => handleThemeChange(e.target.value)}>
              <option value="dark">{t('settings.themeDark')}</option>
              <option value="light">{t('settings.themeLight')}</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{t('settings.language')}</label>
            <select value={language} onChange={e => handleLanguageChange(e.target.value)}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>{t('settings.notifPrefs')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {([
            ['likes', t('settings.notifLikes')],
            ['comments', t('settings.notifComments')],
            ['follows', t('settings.notifFollows')],
            ['new_release', t('settings.notifNewRelease')],
          ] as [keyof NotifPrefs, string][]).map(([key, label]) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.875rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={prefs[key]}
                onChange={() => handlePrefToggle(key)}
                style={{ width: 'auto' }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{t('settings.data')}</h3>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>{t('settings.exportHint')}</p>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="button" className="btn-secondary" disabled={exporting} onClick={() => handleExport('json')}>{t('settings.exportJson')}</button>
          <button type="button" className="btn-secondary" disabled={exporting} onClick={() => handleExport('csv')}>{t('settings.exportCsv')}</button>
        </div>
        {exportError && <p style={{ color: 'var(--accent-primary)', fontSize: '0.8125rem', marginTop: '0.75rem' }}>{t('settings.exportError')}</p>}
      </div>

      {saved && (
        <p style={{ marginTop: '1rem', fontSize: '0.8125rem', color: 'var(--success)' }}>{t('settings.saved')}</p>
      )}
    </div>
  );
}
