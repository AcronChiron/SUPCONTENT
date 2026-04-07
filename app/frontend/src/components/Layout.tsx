import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Home, Search, Music, Library, MessageCircle, Bell, User, LogOut, Compass, Shield } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
              <NavLink to="/profile" className={linkClass}><User size={19} /> {t('nav.profile')}</NavLink>
            </div>
          )}

          {user && (
            <div className="sidebar-section">
              <div className="sidebar-section-title">{t('nav.sections.social')}</div>
              <NavLink to="/messages" className={linkClass}><MessageCircle size={19} /> {t('nav.messages')}</NavLink>
              <NavLink to="/notifications" className={linkClass}><Bell size={19} /> {t('nav.notifications')}</NavLink>
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
