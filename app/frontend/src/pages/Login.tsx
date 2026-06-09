import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function translateError(msg: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    'Invalid credentials': t('errors.invalidCredentials'),
    'Email already in use': t('errors.emailInUse'),
    'Username already taken': t('errors.usernameTaken'),
    'Account is banned': t('errors.accountBanned'),
    'Request failed': t('errors.requestFailed'),
  };
  return map[msg] ?? t('errors.requestFailed');
}

export default function Login() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(translateError(err.message, t));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SUP<span>CONTENT</span></h1>
        <p className="auth-subtitle">{t('auth.tagline')}</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" className="btn-primary auth-btn">{t('auth.login')}</button>
        </form>

        <div className="auth-divider"><span>{t('auth.or')}</span></div>

        <div className="auth-oauth">
          <a href="/api/v1/auth/oauth/google" className="btn-secondary auth-btn">{t('auth.continueGoogle')}</a>
          <a href="/api/v1/auth/oauth/github" className="btn-secondary auth-btn">{t('auth.continueGithub')}</a>
        </div>

        <p className="auth-link">{t('auth.noAccount')} <Link to="/register">{t('auth.signup')}</Link></p>
      </div>
    </div>
  );
}
