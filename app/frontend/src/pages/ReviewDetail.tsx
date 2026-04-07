import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ReviewDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/reviews/${id}`).then((r: any) => { setReview(r); setLiked(!!r.isLiked); }).catch(console.error);
    api(`/reviews/${id}/comments`).then(res => setComments(res.data)).catch(console.error);
  }, [id]);

  const [liked, setLiked] = useState(false);
  const handleLike = async () => {
    if (!id) return;
    try {
      if (liked) {
        await api(`/reviews/${id}/like`, { method: 'DELETE' });
        setLiked(false);
        setReview((r: any) => ({ ...r, _count: { ...r._count, likes: Math.max(0, r._count.likes - 1) } }));
      } else {
        await api(`/reviews/${id}/like`, { method: 'POST' });
        setLiked(true);
        setReview((r: any) => ({ ...r, _count: { ...r._count, likes: r._count.likes + 1 } }));
      }
    } catch {}
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    const comment = await api(`/reviews/${id}/comments`, { method: 'POST', body: JSON.stringify({ content: newComment }) });
    setComments(prev => [...prev, comment]);
    setReview((r: any) => ({ ...r, _count: { ...r._count, comments: r._count.comments + 1 } }));
    setNewComment('');
  };

  if (!review) return <div className="page-loading">{t('common.loading')}</div>;

  return (
    <div style={{ maxWidth: 700 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <Link to={`/u/${review.user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text)', fontWeight: 500 }}>
          {review.user.avatarUrl ? <img src={review.user.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent2), var(--color-accent))' }} />}
          {review.user.username}
        </Link>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={18} fill={i < review.rating ? 'var(--color-accent)' : 'none'} color={i < review.rating ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
          ))}
        </div>
      </div>

      {review.media && (
        <Link to={`/${review.media.mediaType === 'TRACK' ? 'tracks' : review.media.mediaType === 'ALBUM' ? 'albums' : 'artists'}/${encodeURIComponent(review.externalId)}`} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem', background: 'var(--color-surface)', borderRadius: 'var(--radius)', textDecoration: 'none', color: 'inherit', marginBottom: '1rem' }}>
          {review.media.imageUrl ? (
            <img src={review.media.imageUrl} alt="" style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 56, height: 56, borderRadius: 8, background: 'var(--color-bg)' }} />
          )}
          <div>
            <p style={{ fontWeight: 600 }}>{review.media.title}</p>
            {review.media.artistName && <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{review.media.artistName}</p>}
          </div>
        </Link>
      )}

      <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{review.content}</p>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
        {user && <button className="btn-secondary" onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Heart size={16} /> {review._count.likes}</button>}
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>{review._count.comments} {t('reviews.commentsCount')}</span>
        {review.containsSpoiler && <span style={{ background: 'var(--color-accent)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: 8, fontSize: '0.75rem' }}>{t('common.spoiler')}</span>}
      </div>

      <h3 style={{ marginBottom: '1rem' }}>{t('reviews.comments')}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {comments.map(c => (
          <div key={c.id} style={{ background: 'var(--color-surface)', padding: '0.75rem', borderRadius: 'var(--radius)' }}>
            <Link to={`/u/${c.user.username}`} style={{ fontWeight: 500, fontSize: '0.8125rem', color: 'var(--color-text)' }}>{c.user.username}</Link>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{c.content}</p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={handleComment} style={{ display: 'flex', gap: '0.5rem' }}>
          <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t('reviews.addComment')} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">{t('reviews.post')}</button>
        </form>
      )}
    </div>
  );
}
