import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

export default function Chat() {
  const { t } = useTranslation();
  const { username } = useParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (username) {
      api(`/messages/conversations/${username}`).then(res => setMessages(res.data)).catch(console.error);
      api(`/users/${username}`).then((u: any) => setPartnerId(u.id)).catch(console.error);
    }
  }, [username]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !partnerId) return;

    const onMessage = (msg: any) => {
      if (msg.senderId === partnerId) {
        setMessages(prev => [...prev, msg]);
        setPartnerTyping(false);
      }
    };
    const onTypingStart = (data: { userId: string }) => {
      if (data.userId === partnerId) setPartnerTyping(true);
    };
    const onTypingStop = (data: { userId: string }) => {
      if (data.userId === partnerId) setPartnerTyping(false);
    };

    socket.on('message:new', onMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    return () => {
      socket.off('message:new', onMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
    };
  }, [partnerId]);

  const handleInputChange = (value: string) => {
    setInput(value);
    const socket = getSocket();
    if (!socket || !partnerId) return;
    socket.emit('typing:start', { conversationWith: partnerId });
    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing:stop', { conversationWith: partnerId });
    }, 1500);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !username) return;
    try {
      const msg = await api(`/messages/conversations/${username}`, { method: 'POST', body: JSON.stringify({ content: input }) });
      setMessages(prev => [...prev, msg]);
      setInput('');
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      getSocket()?.emit('typing:stop', { conversationWith: partnerId });
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
        {partnerTyping && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', alignSelf: 'flex-start' }}>{t('messages.typing')}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem', padding: '1rem 0' }}>
        <input value={input} onChange={e => handleInputChange(e.target.value)} placeholder={t('messages.typePlaceholder')} style={{ flex: 1 }} />
        <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Send size={16} /> {t('messages.send')}</button>
      </form>
    </div>
  );
}
