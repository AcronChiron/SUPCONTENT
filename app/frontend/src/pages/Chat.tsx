import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (username) {
      api(`/messages/conversations/${username}`).then(res => setMessages(res.data)).catch(console.error);
    }
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username) return;
    try {
      const msg = await api(`/messages/conversations/${username}`, { method: 'POST', body: JSON.stringify({ content: input }) });
      setMessages(prev => [...prev, msg]);
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', maxWidth: 700 }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>{username}</h2>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingBottom: '1rem' }}>
        {messages.map(msg => {
          const isMine = msg.senderId === user?.id;
          return (
            <div key={msg.id} style={{ alignSelf: isMine ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
              <div style={{ background: isMine ? 'var(--color-accent)' : 'var(--color-surface)', padding: '0.625rem 0.875rem', borderRadius: 'var(--radius)', fontSize: '0.9375rem' }}>
                {msg.content}
              </div>
              <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem', textAlign: isMine ? 'right' : 'left' }}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0' }}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder={t('messages.typePlaceholder')} style={{ flex: 1 }} />
        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Send size={16} /> {t('messages.send')}</button>
      </form>
    </div>
  );
}
