import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Flag } from 'lucide-react';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [userSearchError, setUserSearchError] = useState(false);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      api('/admin/reports').then(res => setReports(res.data)).catch(console.error);
    }
  }, [user]);

  const resolveReport = async (id: string, status: string) => {
    await api(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    setReports(prev => prev.map(r => r.id === id ? { ...r, status, resolvedAt: new Date() } : r));
  };

  const handleUserSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setUserSearchError(false);
    setFoundUser(null);
    try {
      const u = await api(`/admin/users/${encodeURIComponent(searchUsername.trim())}`);
      setFoundUser(u);
    } catch {
      setUserSearchError(true);
    }
  };

  const toggleBan = async () => {
    if (!foundUser) return;
    const action = foundUser.isBanned ? 'unban' : 'ban';
    await api(`/admin/users/${encodeURIComponent(foundUser.username)}/${action}`, { method: 'POST' });
    setFoundUser((u: any) => ({ ...u, isBanned: !u.isBanned }));
  };

  if (user?.role !== 'ADMIN') return <div className="page-loading">{t('common.accessDenied')}</div>;

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Shield size={24} /> {t('admin.title')}
      </h2>

      <h3 style={{ marginBottom: '1rem' }}>{t('admin.reports')} ({reports.length})</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reports.map(r => (
          <div key={r.id} style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500 }}><Flag size={14} style={{ display: 'inline' }} /> {r.reason}</span>
              <span style={{ fontSize: '0.8125rem', color: r.status === 'PENDING' ? 'var(--color-accent)' : 'var(--color-success)' }}>{r.status}</span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{t('admin.reportedBy')} {r.reporter.username}</p>
            {r.details && <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{r.details}</p>}
            {r.status === 'PENDING' && (
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                <button className="btn-primary" onClick={() => resolveReport(r.id, 'RESOLVED')} style={{ fontSize: '0.8125rem' }}>{t('admin.resolve')}</button>
                <button className="btn-secondary" onClick={() => resolveReport(r.id, 'DISMISSED')} style={{ fontSize: '0.8125rem' }}>{t('admin.dismiss')}</button>
              </div>
            )}
          </div>
        ))}
        {reports.length === 0 && <p className="empty-state">{t('common.empty')}</p>}
      </div>

      <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>{t('admin.users')}</h3>
      <form onSubmit={handleUserSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', maxWidth: 400 }}>
        <input name="searchUsername" value={searchUsername} onChange={e => setSearchUsername(e.target.value)} placeholder={t('admin.searchUsername')} style={{ flex: 1 }} />
        <button type="submit" className="btn-secondary">{t('admin.searchAction')}</button>
      </form>
      {userSearchError && <p style={{ color: 'var(--color-accent)', fontSize: '0.875rem' }}>{t('admin.userNotFound')}</p>}
      {foundUser && (
        <div style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', maxWidth: 400, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 500 }}>{foundUser.username}</p>
            <p style={{ fontSize: '0.8125rem', color: foundUser.isBanned ? 'var(--color-accent)' : 'var(--color-success)' }}>
              {foundUser.isBanned ? t('admin.banned') : t('admin.active')}
            </p>
          </div>
          <button className={foundUser.isBanned ? 'btn-secondary' : 'btn-primary'} onClick={toggleBan} style={{ fontSize: '0.8125rem' }}>
            {foundUser.isBanned ? t('admin.unban') : t('admin.ban')}
          </button>
        </div>
      )}
    </div>
  );
}
