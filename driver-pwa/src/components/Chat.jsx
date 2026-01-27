import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './Button';
import './Chat.css';

export function Chat({ rideId, recipientId, recipientType, onClose, title }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    
    loadMessages();
    subscribeToMessages();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [rideId, recipientId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!user) return;

    setLoading(true);
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (rideId) {
      query = query.eq('ride_id', rideId);
    } else if (recipientId) {
      query = query.or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`);
    } else if (recipientType === 'all') {
      query = query.eq('recipient_type', 'all');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error loading messages:', error);
    } else {
      setMessages(data || []);
      markAsRead(data?.filter(m => m.recipient_id === user.id && !m.read).map(m => m.id) || []);
    }

    setLoading(false);
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel(`chat:${rideId || recipientId || 'general'}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: rideId 
            ? `ride_id=eq.${rideId}` 
            : recipientId 
            ? `or(and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id}))`
            : recipientType === 'all'
            ? `recipient_type=eq.all`
            : undefined,
        },
        (payload) => {
          const newMessage = payload.new;
          if (
            (rideId && newMessage.ride_id === rideId) ||
            (recipientId && (newMessage.sender_id === recipientId || newMessage.recipient_id === recipientId)) ||
            (recipientType === 'all' && newMessage.recipient_type === 'all')
          ) {
            setMessages((prev) => {
              if (prev.find(m => m.id === newMessage.id)) return prev;
              return [...prev, newMessage];
            });
            if (newMessage.recipient_id === user.id || (newMessage.recipient_type === 'all' && newMessage.sender_id !== user.id)) {
              markAsRead([newMessage.id]);
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const markAsRead = async (messageIds) => {
    if (messageIds.length === 0) return;
    await supabase
      .from('messages')
      .update({ read: true, read_at: new Date().toISOString() })
      .in('id', messageIds);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    setSending(true);
    try {
      const { error } = await supabase.from('messages').insert({
        ride_id: rideId || null,
        sender_id: user.id,
        recipient_id: recipientId || null,
        recipient_type: recipientType || null,
        message_text: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div>Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>{title || 'Chat'}</h3>
        {onClose && (
          <button onClick={onClose} className="chat-close-btn">×</button>
        )}
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === user?.id;
            return (
              <div key={message.id} className={`chat-message ${isOwn ? 'chat-message-own' : 'chat-message-other'}`}>
                <div className={`chat-bubble ${isOwn ? 'chat-bubble-own' : 'chat-bubble-other'}`}>
                  <p className="chat-text">{message.message_text}</p>
                  <p className="chat-time">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="chat-input"
          disabled={sending}
        />
        <Button type="submit" disabled={!newMessage.trim() || sending} size="sm">
          Send
        </Button>
      </form>
    </div>
  );
}


