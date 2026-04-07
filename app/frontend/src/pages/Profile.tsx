import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';
import { api } from '../services/api';

export default function Profile() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api('/users/me').then(setUser).catch(console.error);
  }, []);

  if (!user) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent2), var(--color-accent))' }} />
          )}
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.username}</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>{user.email}</p>
            {user.bio && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>{user.bio}</p>}
          </div>
        </div>
        <Link to="/profile/edit" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <Settings size={16} /> {t('common.edit')}
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '2rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
        <span><strong style={{ color: 'var(--color-text)' }}>{user.followersCount}</strong> {t('common.followers')}</span>
        <span><strong style={{ color: 'var(--color-text)' }}>{user.followingCount}</strong> {t('common.following')}</span>
      </div>
    </div>
  );
}
