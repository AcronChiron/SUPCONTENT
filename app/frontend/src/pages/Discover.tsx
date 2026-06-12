import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';
import ReviewCard from '../components/ReviewCard';
import './Feed.css';

export default function Discover() {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/feed/discover').then(res => setReviews(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div className="discover-page">
      <h2>{t('feed.discover')}</h2>
      <div className="feed-list">
        {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
      </div>
      {reviews.length === 0 && <p className="empty-state">{t('reviews.noReviews')}</p>}
    </div>
  );
}
