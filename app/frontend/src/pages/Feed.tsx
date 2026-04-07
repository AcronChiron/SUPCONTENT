import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import './Feed.css';

export default function Feed() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/feed').then(res => setReviews(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div className="feed-page">
      <h2>{t('feed.yourFeed')}</h2>
      {reviews.length === 0 ? (
        <p className="empty-state">{t('feed.followToSee')}</p>
      ) : (
        <div className="feed-list">
          {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}
    </div>
  );
}
