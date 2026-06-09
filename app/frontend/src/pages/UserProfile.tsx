import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';

export default function UserProfile() {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user: me } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (username) {
      api(`/users/${username}`).then(setUser).catch(console.error);
      api(`/users/${username}/reviews`).then(res => setReviews(res.data || [])).catch(console.error);
    }
  }, [username]);

  const toggleFollow = async () => {
    if (!username || !user) return;
    try {
      if (user.isFollowing) {
        await api(`/users/${username}/follow`, { method: 'DELETE' });
        setUser((u: any) => ({ ...u, isFollowing: false, followersCount: Math.max(0, u.followersCount - 1) }));
      } else {
        await api(`/users/${username}/follow`, { method: 'POST' });
        setUser((u: any) => ({ ...u, isFollowing: true, followersCount: u.followersCount + 1 }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 600 }}>
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent2), var(--color-accent))' }} />
        )}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{user.username}</h2>
          {user.bio && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{user.bio}</p>}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <span><strong style={{ color: 'var(--color-text)' }}>{user.followersCount}</strong> {t('common.followers')}</span>
            <span><strong style={{ color: 'var(--color-text)' }}>{user.followingCount}</strong> {t('common.following')}</span>
            <span><strong style={{ color: 'var(--color-text)' }}>{user.reviewsCount}</strong> {t('common.reviews')}</span>
          </div>
        </div>
      </div>

      {me && me.username !== username && (
        <button className={user.isFollowing ? 'btn-secondary' : 'btn-primary'} onClick={toggleFollow} style={{ marginBottom: '1.5rem' }}>
          {user.isFollowing ? t('common.unfollow') : t('common.follow')}
        </button>
      )}

      {reviews.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>{t('common.reviews')} ({reviews.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {reviews.map((r: any) => <ReviewCard key={r.id} review={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}
