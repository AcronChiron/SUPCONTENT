import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

type Props = {
  externalId: string;
  mediaType: 'ARTIST' | 'ALBUM' | 'TRACK';
  initialStatus?: string | null;
  initialRating?: number | null;
  title?: string;
  artistName?: string;
  imageUrl?: string;
  onReviewSubmitted?: () => void;
};

const STATUSES = ['TO_LISTEN', 'LISTENING', 'DONE', 'ABANDONED'] as const;

export default function MediaActions({ externalId, mediaType, initialStatus, initialRating, title, artistName, imageUrl, onReviewSubmitted }: Props) {
  const meta = { title, artistName, imageUrl };
  const { t } = useTranslation();
  const { user } = useAuth();
  const [status, setStatus] = useState<string | null>(initialStatus ?? null);
  const [libRating, setLibRating] = useState<number | null>(initialRating ?? null);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [spoiler, setSpoiler] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const flash = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const updateStatus = async (newStatus: string) => {
    try {
      await api('/library', {
        method: 'PUT',
        body: JSON.stringify({ externalId, mediaType, status: newStatus, ...(libRating ? { rating: libRating } : {}), ...meta }),
      });
      setStatus(newStatus);
      flash();
    } catch (e) { console.error(e); }
  };

  const updateRating = async (rating: number) => {
    try {
      await api('/library', {
        method: 'PUT',
        body: JSON.stringify({ externalId, mediaType, status: status || 'DONE', rating, ...meta }),
      });
      setLibRating(rating);
      if (!status) setStatus('DONE');
      flash();
    } catch (e) { console.error(e); }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    if (reviewContent.trim().length < 10) { setReviewError('min 10'); return; }
    if (reviewRating < 1) { setReviewError('rating'); return; }
    setSubmitting(true);
    try {
      await api('/reviews', {
        method: 'POST',
        body: JSON.stringify({ externalId, mediaType, content: reviewContent, rating: reviewRating, containsSpoiler: spoiler, ...meta }),
      });
      setShowReview(false);
      setReviewContent(''); setReviewRating(0); setSpoiler(false);
      flash();
      onReviewSubmitted?.();
    } catch (err: any) {
      setReviewError(err.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', marginTop: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginRight: '0.25rem' }}>{status ? t('actions.inLibrary') : t('actions.addToLibrary')}:</span>
        {STATUSES.map(s => (
          <button
            key={s}
            type="button"
            className={status === s ? 'btn-primary' : 'btn-secondary'}
            style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
            onClick={() => updateStatus(s)}
          >
            {t(`library.status.${s}`)}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{t('actions.rating')}:</span>
        <div style={{ display: 'flex', gap: '0.125rem' }}>
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => updateRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <Star size={20} fill={libRating && n <= libRating ? 'var(--color-accent)' : 'none'} color={libRating && n <= libRating ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
            </button>
          ))}
        </div>
        {savedFlash && <span style={{ fontSize: '0.75rem', color: 'var(--color-success, #0D8A7A)' }}>✓ {t('actions.saved')}</span>}
      </div>

      {!showReview ? (
        <button type="button" className="btn-secondary" style={{ alignSelf: 'flex-start', fontSize: '0.8125rem' }} onClick={() => setShowReview(true)}>
          {t('actions.writeReview')}
        </button>
      ) : (
        <form onSubmit={submitReview} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <strong style={{ fontSize: '0.875rem' }}>{t('actions.yourReview')}</strong>
          <div style={{ display: 'flex', gap: '0.125rem' }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setReviewRating(n)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <Star size={22} fill={n <= reviewRating ? 'var(--color-accent)' : 'none'} color={n <= reviewRating ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
              </button>
            ))}
          </div>
          <textarea
            value={reviewContent}
            onChange={e => setReviewContent(e.target.value)}
            placeholder={t('actions.contentPlaceholder')}
            rows={4}
            maxLength={5000}
            style={{ resize: 'vertical', minHeight: 80 }}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem' }}>
            <input type="checkbox" checked={spoiler} onChange={e => setSpoiler(e.target.checked)} />
            {t('actions.spoilerWarning')}
          </label>
          {reviewError && <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem' }}>{reviewError}</span>}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ fontSize: '0.8125rem' }}>{t('actions.publish')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowReview(false)} style={{ fontSize: '0.8125rem' }}>{t('common.cancel')}</button>
          </div>
        </form>
      )}
    </div>
  );
}
