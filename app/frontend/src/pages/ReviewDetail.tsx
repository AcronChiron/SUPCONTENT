import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';

export default function ReviewDetail() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useAuth();
  const [review, setReview] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [notFound, setNotFound] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('spam');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSent, setReportSent] = useState(false);
  const [reportError, setReportError] = useState(false);

  useEffect(() => {
    if (!id) return;
    api(`/reviews/${id}`).then((r: any) => { setReview(r); setLiked(!!r.isLiked); }).catch(() => setNotFound(true));
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

  const toggleFeature = async () => {
    if (!id || !review) return;
    const updated = await api(`/admin/reviews/${id}/feature`, { method: 'PATCH', body: JSON.stringify({ featured: !review.isFeatured }) });
    setReview((r: any) => ({ ...r, isFeatured: updated.isFeatured }));
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setReportError(false);
    try {
      const reasonLabel = t(`reviews.reportReasons.${reportReason === 'unmarkedSpoiler' ? 'unmarkedSpoiler' : reportReason}`);
      await api(`/reviews/${id}/report`, { method: 'POST', body: JSON.stringify({ reason: reasonLabel, details: reportDetails || undefined }) });
      setReportSent(true);
      setShowReport(false);
    } catch {
      setReportError(true);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newComment.trim()) return;
    const comment = await api(`/reviews/${id}/comments`, { method: 'POST', body: JSON.stringify({ content: newComment }) });
    setComments(prev => [...prev, comment]);
    setReview((r: any) => ({ ...r, _count: { ...r._count, comments: r._count.comments + 1 } }));
    setNewComment('');
  };

  if (notFound) return <NotFound />;
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

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        {user && <button className="btn-secondary" onClick={handleLike} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Heart size={16} /> {review._count.likes}</button>}
        <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>{review._count.comments} {t('reviews.commentsCount')}</span>
        {review.containsSpoiler && <span style={{ background: 'var(--color-accent)', color: 'white', padding: '0.125rem 0.5rem', borderRadius: 8, fontSize: '0.75rem' }}>{t('common.spoiler')}</span>}
        {user?.role === 'ADMIN' && (
          <button type="button" className="btn-secondary" onClick={toggleFeature} style={{ fontSize: '0.8125rem', marginLeft: 'auto' }}>
            {review.isFeatured ? t('reviews.unfeature') : t('reviews.feature')}
          </button>
        )}
        {user && user.id !== review.userId && !reportSent && (
          <button type="button" className="btn-secondary" onClick={() => setShowReport(v => !v)} style={{ fontSize: '0.8125rem', marginLeft: user?.role === 'ADMIN' ? undefined : 'auto' }}>{t('reviews.report')}</button>
        )}
        {reportSent && <span style={{ marginLeft: user?.role === 'ADMIN' ? undefined : 'auto', fontSize: '0.8125rem', color: 'var(--color-success, #0D8A7A)' }}>{t('reviews.reportSent')}</span>}
      </div>

      {showReport && (
        <form onSubmit={handleReport} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'var(--color-surface)', padding: '0.875rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{t('reviews.reportReason')}</label>
          <select name="reportReason" value={reportReason} onChange={e => setReportReason(e.target.value)}>
            <option value="spam">{t('reviews.reportReasons.spam')}</option>
            <option value="offensive">{t('reviews.reportReasons.offensive')}</option>
            <option value="unmarkedSpoiler">{t('reviews.reportReasons.unmarkedSpoiler')}</option>
            <option value="other">{t('reviews.reportReasons.other')}</option>
          </select>
          <textarea name="reportDetails" value={reportDetails} onChange={e => setReportDetails(e.target.value)} placeholder={t('reviews.reportDetails')} rows={2} />
          {reportError && <p style={{ color: 'var(--color-accent)', fontSize: '0.8125rem' }}>{t('errors.requestFailed')}</p>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" style={{ fontSize: '0.8125rem' }}>{t('reviews.reportSend')}</button>
            <button type="button" className="btn-secondary" style={{ fontSize: '0.8125rem' }} onClick={() => setShowReport(false)}>{t('reviews.reportCancel')}</button>
          </div>
        </form>
      )}

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
          <input name="comment" value={newComment} onChange={e => setNewComment(e.target.value)} placeholder={t('reviews.addComment')} style={{ flex: 1 }} />
          <button type="submit" className="btn-primary">{t('reviews.post')}</button>
        </form>
      )}
    </div>
  );
}
