import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon } from 'lucide-react';
import { api } from '../services/api';
import { pickImage, gradientFromString } from '../utils/image';
import './Search.css';

export default function Search() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('artist');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api(`/music/search?q=${encodeURIComponent(query)}&type=${type}&limit=20`);
      setResults(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getLink = (item: any) => {
    const enc = (s: string) => encodeURIComponent(s);
    if (type === 'artist') return `/artists/${enc(item.mbid || item.name)}`;
    const artistName = typeof item.artist === 'string' ? item.artist : item.artist?.name || '';
    if (type === 'album') return `/albums/${enc(item.mbid || `${artistName}::${item.name}`)}`;
    return `/tracks/${enc(`${artistName}::${item.name}`)}`;
  };

  const getImage = (item: any) => pickImage(item.image);

  return (
    <div className="search-page">
      <form className="search-bar" onSubmit={handleSearch}>
        <SearchIcon size={20} />
        <input type="text" placeholder={t('search.placeholder')} value={query} onChange={e => setQuery(e.target.value)} />
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="artist">{t('common.artists')}</option>
          <option value="album">{t('common.albums')}</option>
          <option value="track">{t('common.tracks')}</option>
        </select>
        <button type="submit" className="btn-primary">{t('common.search')}</button>
      </form>

      {loading && <div className="page-loading">{t('search.searching')}</div>}

      <div className="search-grid">
        {results.map((item, i) => (
          <Link to={getLink(item)} key={i} className="search-card">
            <div className="search-card-img">
              {getImage(item) ? <img src={getImage(item)!} alt={item.name} /> : <div className="placeholder" style={{ background: gradientFromString(item.name || '') }} />}
            </div>
            <div className="search-card-info">
              <p className="search-card-name">{item.name}</p>
              {item.artist && <p className="search-card-sub">{typeof item.artist === 'string' ? item.artist : item.artist.name}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
