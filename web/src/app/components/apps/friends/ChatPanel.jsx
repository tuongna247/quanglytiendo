'use client';
import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { IconSend, IconX, IconMoodSmile, IconEdit, IconTrash, IconDots } from '@tabler/icons-react';
import * as signalR from '@microsoft/signalr';
import apiClient from '@/app/lib/apiClient';

const EMOJIS = [
  '😀','😂','🥰','😍','😎','🤩','😢','😭','😡','🤔',
  '👍','👎','❤️','🔥','🎉','✅','💯','🙏','😅','🤣',
  '😊','😋','😏','🤗','😴','😱','🤯','🥳','🎊','💪',
  '👏','🌹','⭐','🌟','💡','🚀','🎯','💬','📌','🫶',
];

export default function ChatPanel({ friend, onClose }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  // Context menu for messages
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMsg, setMenuMsg] = useState(null);
  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState('');

  const connectionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Fetch current user from DB
  useEffect(() => {
    apiClient.get('/api/auth/me').then(data => { if (data) setCurrentUser(data); }).catch(() => {});
  }, []);

  // Load history
  useEffect(() => {
    setLoading(true);
    apiClient.get(`/api/chat/history/${friend.userId}`)
      .then(data => { setMessages(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [friend.userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Connect SignalR
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('qlTD_token') : '';
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`/hubs/chat?access_token=${token}`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connection.on('ReceiveMessage', (msg) => {
      setCurrentUser(me => {
        const meId = me?.id;
        if (
          (msg.senderId === friend.userId && msg.receiverId === meId) ||
          (msg.senderId === meId && msg.receiverId === friend.userId)
        ) {
          setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
        }
        return me;
      });
    });

    connection.on('MessageUpdated', (updated) => {
      setMessages(prev => prev.map(m => m.id === updated.id ? { ...m, content: updated.content, isEdited: true } : m));
    });

    connection.on('MessageDeleted', (deleted) => {
      setMessages(prev => prev.map(m => m.id === deleted.id ? { ...m, isDeleted: true, content: '' } : m));
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
  }, [friend.userId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || !connectionRef.current) return;
    setInput('');
    try { await connectionRef.current.invoke('SendMessage', friend.userId, text); }
    catch (err) { console.error('Send error:', err); }
  }

  async function handleTyping() {
    if (!connectionRef.current) return;
    try { await connectionRef.current.invoke('Typing', friend.userId); } catch { /* ignore */ }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function insertEmoji(emoji) { setInput(prev => prev + emoji); setEmojiAnchor(null); }

  function openMenu(e, msg) { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuMsg(msg); }
  function closeMenu() { setMenuAnchor(null); setMenuMsg(null); }

  function startEdit() {
    setEditContent(menuMsg.content);
    setEditOpen(true);
    closeMenu();
  }

  async function handleEdit() {
    if (!editContent.trim() || !menuMsg) return;
    await apiClient.put(`/api/chat/messages/${menuMsg.id}`, { content: editContent.trim() });
    setMessages(prev => prev.map(m => m.id === menuMsg.id ? { ...m, content: editContent.trim(), isEdited: true } : m));
    setEditOpen(false);
    setMenuMsg(null);
  }

  async function handleDelete() {
    if (!menuMsg) return;
    closeMenu();
    await apiClient.delete(`/api/chat/messages/${menuMsg.id}`);
    setMessages(prev => prev.map(m => m.id === menuMsg.id ? { ...m, isDeleted: true, content: '' } : m));
  }

  const letter = (friend.displayName?.[0] || friend.username?.[0] || '?').toUpperCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: { xs: '100%', sm: 360 }, height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: friend.avatarColor, fontSize: 15 }}>{letter}</Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{friend.displayName}</Typography>
          <Typography variant="caption" color="textSecondary">@{friend.username}</Typography>
        </Box>
        <IconButton size="small" onClick={onClose}><IconX size={18} /></IconButton>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2, py: 1.5, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={24} /></Box>}
        {!loading && messages.length === 0 && (
          <Typography color="textSecondary" align="center" sx={{ py: 4, fontSize: 13 }}>
            Bắt đầu cuộc trò chuyện với {friend.displayName}!
          </Typography>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <Box
              key={msg.id || msg.createdAt}
              sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 0.5 }}
              className="msg-row"
            >
              {!isMine && (
                <Avatar sx={{ width: 24, height: 24, bgcolor: friend.avatarColor, fontSize: 10, flexShrink: 0 }}>{letter}</Avatar>
              )}
              <Box sx={{ position: 'relative', maxWidth: '75%', '&:hover .msg-actions': { opacity: 1 } }}>
                {isMine && !msg.isDeleted && (
                  <Box className="msg-actions" sx={{ opacity: 0, transition: 'opacity 0.15s', position: 'absolute', top: -16, right: 0 }}>
                    <IconButton size="small" onClick={e => openMenu(e, msg)} sx={{ p: 0.25 }}>
                      <IconDots size={14} />
                    </IconButton>
                  </Box>
                )}
                <Paper elevation={0} sx={{
                  px: 1.5, py: 0.75,
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: msg.isDeleted ? 'action.disabledBackground' : isMine ? 'primary.main' : 'action.selected',
                  color: msg.isDeleted ? 'text.disabled' : isMine ? 'primary.contrastText' : 'text.primary',
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontStyle: msg.isDeleted ? 'italic' : 'normal' }}>
                    {msg.isDeleted ? 'Tin nhắn đã bị xóa' : msg.content}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    {msg.isEdited && !msg.isDeleted && (
                      <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 9 }}>đã sửa</Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: 10 }}>
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
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
        <IconButton size="small" onClick={e => setEmojiAnchor(e.currentTarget)} sx={{ mb: 0.25 }}>
          <IconMoodSmile size={20} />
        </IconButton>
        <TextField
          size="small" multiline maxRows={4} fullWidth
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

      {/* Emoji Picker */}
      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.25, maxWidth: 280 }}>
          {EMOJIS.map(emoji => (
            <IconButton key={emoji} size="small" onClick={() => insertEmoji(emoji)} sx={{ fontSize: 20, p: 0.5 }}>{emoji}</IconButton>
          ))}
        </Box>
      </Popover>

      {/* Message context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={startEdit} sx={{ gap: 1 }}>
          <IconEdit size={16} /> Sửa
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ gap: 1, color: 'error.main' }}>
          <IconTrash size={16} /> Xóa
        </MenuItem>
      </Menu>

      {/* Edit dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Sửa tin nhắn</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth multiline maxRows={6}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEdit(); } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Hủy</Button>
          <Button variant="contained" onClick={handleEdit} disabled={!editContent.trim()}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
