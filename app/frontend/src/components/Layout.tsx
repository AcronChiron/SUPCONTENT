import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { Home, Search, Music, Library, ListMusic, MessageCircle, Bell, User, LogOut, Compass, Shield, Settings as SettingsIcon } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  useEffect(() => {
    if (!user) return;
    api('/notifications').then(res => {
      if (pathnameRef.current === '/notifications') return;
      setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (location.pathname === '/notifications') setUnreadCount(0);
  }, [location.pathname]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onNotification = () => setUnreadCount(c => c + 1);
    socket.on('notification:new', onNotification);
    return () => { socket.off('notification:new', onNotification); };
  }, [user]);

  const linkClass = ({ isActive }: { isActive: boolean }) => `nav-item${isActive ? ' active' : ''}`;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <NavLink to="/">
            <div className="sidebar-logo-icon">♪</div>
            <h1>SUPCONTENT</h1>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <div className="sidebar-section-title">{t('nav.sections.discover')}</div>
            <NavLink to="/" end className={linkClass}><Home size={19} /> {t('nav.feed')}</NavLink>
            <NavLink to="/discover" className={linkClass}><Compass size={19} /> {t('nav.discover')}</NavLink>
            <NavLink to="/search" className={linkClass}><Search size={19} /> {t('nav.search')}</NavLink>
            <NavLink to="/charts" className={linkClass}><Music size={19} /> {t('nav.charts')}</NavLink>
          </div>

          {user && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('nav.sections.library')}</div>
              <NavLink to="/library" className={linkClass}><Library size={19} /> {t('nav.library')}</NavLink>
              <NavLink to="/lists" className={linkClass}><ListMusic size={19} /> {t('nav.lists')}</NavLink>
              <NavLink to="/profile" className={linkClass}><User size={19} /> {t('nav.profile')}</NavLink>
              <NavLink to="/settings" className={linkClass}><SettingsIcon size={19} /> Réglages</NavLink>
            </div>
          )}

          {user && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('nav.sections.social')}</div>
              <NavLink to="/messages" className={linkClass}><MessageCircle size={19} /> {t('nav.messages')}</NavLink>
              <NavLink to="/notifications" className={linkClass} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <Bell size={19} /> {t('nav.notifications')}
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 'auto', background: 'var(--color-accent)', color: 'white', borderRadius: 10, fontSize: '0.6875rem', padding: '0.0625rem 0.4375rem' }}>{unreadCount}</span>
                )}
              </NavLink>
            </div>
          )}

          {user?.role === 'ADMIN' && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('nav.sections.admin')}</div>
              <NavLink to="/admin" className={linkClass}><Shield size={19} /> {t('nav.admin')}</NavLink>
            </div>
          )}
        </nav>

        <div className="sidebar-bottom">
          {user ? (
            <>
              <div className="sidebar-user">
                <div className="sidebar-user-avatar">
                  {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : user.username?.[0]?.toUpperCase()}
                </div>
                <div className="sidebar-user-info">
                  <div className="sidebar-user-name">{user.username}</div>
                  <div className="sidebar-user-handle">@{user.username}</div>
                </div>
                <button className="btn-icon logout-btn" onClick={handleLogout} title={t('nav.logout')}>
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <NavLink to="/login" className="nav-item"><User size={19} /> {t('auth.login')}</NavLink>
          )}
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
