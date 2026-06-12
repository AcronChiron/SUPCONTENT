import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { setToken } from '../services/api';

export default function AuthCallback() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      setToken(token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [params, navigate]);

  return <div style={{ padding: '2rem' }}>{t('common.loading')}</div>;
}
