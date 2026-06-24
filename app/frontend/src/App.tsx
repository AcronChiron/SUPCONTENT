import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Feed from './pages/Feed';
import Discover from './pages/Discover';
import Search from './pages/Search';
import ArtistDetail from './pages/ArtistDetail';
import AlbumDetail from './pages/AlbumDetail';
import TrackDetail from './pages/TrackDetail';
import Charts from './pages/Charts';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import UserProfile from './pages/UserProfile';
import MyLibrary from './pages/MyLibrary';
import MyLists from './pages/MyLists';
import ListDetail from './pages/ListDetail';
import ReviewDetail from './pages/ReviewDetail';
import Conversations from './pages/Conversations';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '2rem' }}>{t('common.loading')}</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      <Route element={<Layout />}>
        <Route path="/" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/search" element={<Search />} />
        <Route path="/artists/:id" element={<ArtistDetail />} />
        <Route path="/albums/:id" element={<AlbumDetail />} />
        <Route path="/tracks/:id" element={<TrackDetail />} />
        <Route path="/charts" element={<Charts />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/u/:username" element={<UserProfile />} />
        <Route path="/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
        <Route path="/lists" element={<ProtectedRoute><MyLists /></ProtectedRoute>} />
        <Route path="/lists/:id" element={<ListDetail />} />
        <Route path="/reviews/:id" element={<ReviewDetail />} />
        <Route path="/messages" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
        <Route path="/messages/:username" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
