import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { Bell, Check } from 'lucide-react';

export default function Notifications() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    api('/notifications').then(res => setNotifications(res.data)).catch(console.error);
  }, []);

  const markAllRead = async () => {
    await api('/notifications/read-all', { method: 'PATCH' });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{t('notifications.title')}</h2>
        <button className="btn-secondary" onClick={markAllRead} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
          <Check size={14} /> {t('notifications.markAllRead')}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {notifications.map(n => (
          <div key={n.id} style={{ background: n.isRead ? 'var(--color-surface)' : 'rgba(232,50,90,0.05)', padding: '0.875rem', borderRadius: 'var(--radius)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start', borderLeft: n.isRead ? 'none' : '3px solid var(--color-accent)' }}>
            <Bell size={16} style={{ marginTop: 2, color: 'var(--color-text-secondary)' }} />
            <div>
              <p style={{ fontSize: '0.875rem' }}>{n.type}: {JSON.stringify(n.payload)}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {notifications.length === 0 && <p className="empty-state">{t('notifications.empty')}</p>}
      </div>
    </div>
  );
}
