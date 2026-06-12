import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Star } from 'lucide-react';
import './ReviewCard.css';

interface ReviewCardProps {
  review: any;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="review-card">
      <div className="review-header">
        <Link to={`/u/${review.user.username}`} className="review-user">
          {review.user.avatarUrl ? (
            <img src={review.user.avatarUrl} alt="" className="review-avatar" />
          ) : (
            <div className="review-avatar placeholder" />
          )}
          <span>{review.user.username}</span>
        </Link>
        <div className="review-rating">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} size={14} fill={i < review.rating ? 'var(--color-accent)' : 'none'} color={i < review.rating ? 'var(--color-accent)' : 'var(--color-text-secondary)'} />
          ))}
        </div>
      </div>

      {review.media && (
        <Link to={`/${review.media.mediaType === 'TRACK' ? 'tracks' : review.media.mediaType === 'ALBUM' ? 'albums' : 'artists'}/${encodeURIComponent(review.externalId)}`} style={{ display: 'flex', gap: '0.625rem', alignItems: 'center', padding: '0.5rem', background: 'var(--color-bg)', borderRadius: 8, textDecoration: 'none', color: 'inherit', marginBottom: '0.5rem' }}>
          {review.media.imageUrl ? (
            <img src={review.media.imageUrl} alt="" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 44, height: 44, borderRadius: 6, background: 'var(--color-surface)' }} />
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 500, fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{review.media.title}</p>
            {review.media.artistName && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{review.media.artistName}</p>}
          </div>
        </Link>
      )}

      <Link to={`/reviews/${review.id}`} className="review-content">
        <p>{review.content}</p>
      </Link>

      <div className="review-footer">
        <span className="review-stat"><Heart size={14} /> {review._count?.likes || 0}</span>
        <span className="review-stat"><MessageCircle size={14} /> {review._count?.comments || 0}</span>
        <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}
