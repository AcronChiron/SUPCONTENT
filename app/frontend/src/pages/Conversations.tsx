import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api } from '../services/api';

export default function Conversations() {
  const { t } = useTranslation();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    api('/messages/conversations').then(res => setConversations(res.data)).catch(console.error);
  }, []);

  return (
    <div style={{ maxWidth: 600 }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>{t('messages.title')}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {conversations.map(conv => (
          <Link key={conv.partner.id} to={`/messages/${conv.partner.username}`} style={{ background: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--color-text)', textDecoration: 'none' }}>
            {conv.partner.avatarUrl ? <img src={conv.partner.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: '50%' }} /> : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent2), var(--color-accent))' }} />}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500 }}>{conv.partner.username}</p>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage.content}</p>
            </div>
            {conv.unreadCount > 0 && <span style={{ background: 'var(--color-accent)', color: 'white', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>{conv.unreadCount}</span>}
          </Link>
        ))}
        {conversations.length === 0 && <p className="empty-state">{t('messages.empty')}</p>}
      </div>
    </div>
  );
}
