import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
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
