'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import { IconSend, IconX } from '@tabler/icons-react';
import * as signalR from '@microsoft/signalr';
import apiClient from '@/app/lib/apiClient';

/**
 * ChatPanel — chat drawer với một người bạn cụ thể.
 * Props:
 *   friend: FriendDto (userId, displayName, username, avatarColor)
 *   currentUser: { id, displayName, avatarColor }
 *   onClose: () => void
 */
export default function ChatPanel({ friend, currentUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load history
  useEffect(() => {
    setLoading(true);
    apiClient.get(`/api/chat/history/${friend.userId}`)
      .then(data => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [friend.userId]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  // Connect SignalR
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qlTD_token') : '';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/chat?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (msg) => {
      // Only show messages relevant to this conversation
      if (
        (msg.senderId === friend.userId && msg.receiverId === currentUser?.id) ||
        (msg.senderId === currentUser?.id && msg.receiverId === friend.userId)
      ) {
        setMessages(prev => {
          // Avoid duplicate if already added optimistically
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    });

    connection.on('UserTyping', (senderId) => {
      if (senderId === friend.userId) {
        setTyping(true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => setTyping(false), 3000);
      }
    });

    connection.start()
      .then(() => { connectionRef.current = connection; })
      .catch(err => console.warn('SignalR connect error:', err));

    return () => {
      connection.stop();
      clearTimeout(typingTimerRef.current);
    };
  }, [friend.userId, currentUser?.id]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !connectionRef.current) return;
    setInput('');
    try {
      await connectionRef.current.invoke('SendMessage', friend.userId, text);
    } catch (err) {
      console.error('Send error:', err);
    }
  }

  async function handleTyping() {
    if (!connectionRef.current) return;
    try {
      await connectionRef.current.invoke('Typing', friend.userId);
    } catch { /* ignore */ }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const letter = (friend.displayName?.[0] || friend.username?.[0] || '?').toUpperCase();

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column',
      width: { xs: '100%', sm: 360 },
      height: '100%',
      bgcolor: 'background.paper',
      borderLeft: '1px solid', borderColor: 'divider',
    }}>
      {/* Header */}
      <Box sx={{
        display: 'flex', alignItems: 'center', gap: 1.5,
        px: 2, py: 1.5,
        borderBottom: '1px solid', borderColor: 'divider',
        bgcolor: 'background.default',
      }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: friend.avatarColor, fontSize: 15 }}>
          {letter}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {friend.displayName}
          </Typography>
          <Typography variant="caption" color="textSecondary">@{friend.username}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><IconX size={18} /></IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {!loading && messages.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ py: 4, fontSize: 13 }}>
            Bắt đầu cuộc trò chuyện với {friend.displayName}!
          </Typography>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <Box key={msg.id || msg.createdAt} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <Paper
                elevation={0}
                sx={{
                  px: 1.5, py: 0.75,
                  maxWidth: '75%',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: isMine ? 'primary.main' : 'action.selected',
                  color: isMine ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.content}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', textAlign: 'right', fontSize: 10, mt: 0.25 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
            </Box>
          );
        })}
        {typing && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="caption" color="textSecondary" sx={{ fontStyle: 'italic' }}>
              {friend.displayName} đang nhập...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Input */}
      <Box sx={{ px: 1.5, py: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 0.5, alignItems: 'flex-end' }}>
        <TextField
          size="small"
          multiline
          maxRows={4}
          fullWidth
          placeholder="Nhập tin nhắn..."
          value={input}
          onChange={e => { setInput(e.target.value); handleTyping(); }}
          onKeyDown={handleKeyDown}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton color="primary" onClick={handleSend} disabled={!input.trim()} sx={{ mb: 0.25 }}>
          <IconSend size={20} />
        </IconButton>
      </Box>
    </Box>
  );
}
