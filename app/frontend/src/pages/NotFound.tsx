import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div style={{ padding: '3rem 1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: 0, color: 'var(--color-accent)' }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.5rem' }}>{t('common.notFound')}</h2>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>{t('common.notFoundHint')}</p>
      <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '1.5rem', textDecoration: 'none' }}>{t('common.home')}</Link>
    </div>
  );
}
