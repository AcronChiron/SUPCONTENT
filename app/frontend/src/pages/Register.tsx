import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function translateError(msg: string, t: (k: string) => string): string {
  if (msg.includes('Invalid credentials')) return t('errors.invalidCredentials');
  if (msg.includes('Email already in use')) return t('errors.emailInUse');
  if (msg.includes('Username already taken')) return t('errors.usernameTaken');
  if (msg.includes('Account is banned')) return t('errors.accountBanned');
  if (msg.includes('at least 8')) return t('errors.passwordLength');
  if (msg.includes('at least 3') || msg.includes('at most 30') || msg.includes('username')) return t('errors.usernameFormat');
  if (msg.includes('email')) return t('errors.emailFormat');
  return t('errors.requestFailed');
}

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err: any) {
      setError(translateError(err.message, t));
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>SUP<span>CONTENT</span></h1>
        <p className="auth-subtitle">{t('auth.createAccount')}</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="text" placeholder={t('auth.username')} value={username} onChange={e => setUsername(e.target.value)} required minLength={3} maxLength={30} />
          <input type="password" placeholder={t('auth.passwordHint')} value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
          <button type="submit" className="btn-primary auth-btn">{t('auth.signup')}</button>
        </form>

        <p className="auth-link">{t('auth.haveAccount')} <Link to="/login">{t('auth.login')}</Link></p>
      </div>
    </div>
  );
}
