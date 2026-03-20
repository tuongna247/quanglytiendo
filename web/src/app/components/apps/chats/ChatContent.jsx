import React, { useContext, useEffect, useRef, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { IconMenu2, IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { ChatContext } from '@/app/context/ChatContext/index';
import apiClient from '@/app/lib/apiClient';

const ChatContent = ({ toggleChatSidebar }) => {
  const { selectedChat, currentUser, typing, setSelectedChat } = useContext(ChatContext);
  const messagesEndRef = useRef(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMsg, setMenuMsg] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages, typing]);

  function openMenu(e, msg) { e.stopPropagation(); setMenuAnchor(e.currentTarget); setMenuMsg(msg); }
  function closeMenu() { setMenuAnchor(null); setMenuMsg(null); }

  function startEdit() { setEditContent(menuMsg.content); setEditOpen(true); closeMenu(); }

  async function handleEdit() {
    if (!editContent.trim() || !menuMsg) return;
    await apiClient.put(`/api/chat/messages/${menuMsg.id}`, { content: editContent.trim() });
    // Update locally (SignalR will also push but update optimistically)
    setEditOpen(false);
    setMenuMsg(null);
  }

  async function handleDelete() {
    if (!menuMsg) return;
    closeMenu();
    await apiClient.delete(`/api/chat/messages/${menuMsg.id}`);
  }

  if (!selectedChat) {
    return (
      <Box display="flex" alignItems="center" p={2}>
        <Box sx={{ display: { xs: 'flex', lg: 'none' }, mr: '10px' }}>
          <IconMenu2 stroke={1.5} onClick={toggleChatSidebar} style={{ cursor: 'pointer' }} />
        </Box>
        <Typography variant="h4">Chọn cuộc trò chuyện</Typography>
      </Box>
    );
  }

  const messages = selectedChat.messages || [];

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Header */}
      <Box display="flex" alignItems="center" p={2}>
        <Box sx={{ display: { xs: 'block', lg: 'none' }, mr: '10px' }}>
          <IconMenu2 stroke={1.5} onClick={toggleChatSidebar} style={{ cursor: 'pointer' }} />
        </Box>
        <ListItem dense disableGutters>
          <ListItemAvatar>
            <Avatar sx={{ width: 40, height: 40, bgcolor: selectedChat.partnerAvatarColor || '#2196f3', fontSize: 16 }}>
              {(selectedChat.partnerName?.[0] || selectedChat.partnerUsername?.[0] || '?').toUpperCase()}
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={<Typography variant="h5">{selectedChat.partnerName || selectedChat.partnerUsername}</Typography>}
            secondary={<Typography variant="caption" color="textSecondary">@{selectedChat.partnerUsername}</Typography>}
          />
        </ListItem>
      </Box>
      <Divider />

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: 620, px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        {messages.length === 0 && (
          <Box display="flex" justifyContent="center" alignItems="center" height={200}>
            <Typography color="textSecondary" variant="body2">
              Bắt đầu cuộc trò chuyện với {selectedChat.partnerName}!
            </Typography>
          </Box>
        )}
        {messages.map((msg) => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <Box
              key={msg.id || msg.createdAt}
              display="flex"
              justifyContent={isMine ? 'flex-end' : 'flex-start'}
              alignItems="flex-end"
              gap={0.5}
            >
              {!isMine && (
                <Avatar sx={{ width: 28, height: 28, bgcolor: selectedChat.partnerAvatarColor, fontSize: 12, mr: 0.5, flexShrink: 0 }}>
                  {(selectedChat.partnerName?.[0] || '?').toUpperCase()}
                </Avatar>
              )}
              <Box sx={{ position: 'relative', maxWidth: '70%', '&:hover .msg-actions': { opacity: 1 } }}>
                {isMine && !msg.isDeleted && (
                  <Box className="msg-actions" sx={{ opacity: 0, transition: 'opacity 0.15s', position: 'absolute', top: -18, right: 0 }}>
                    <IconButton size="small" onClick={e => openMenu(e, msg)} sx={{ p: 0.25 }}>
                      <IconDots size={14} />
                    </IconButton>
                  </Box>
                )}
                <Paper elevation={0} sx={{
                  px: 1.5, py: 0.75,
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: msg.isDeleted ? 'action.disabledBackground' : isMine ? 'primary.main' : 'grey.100',
                  color: msg.isDeleted ? 'text.disabled' : isMine ? 'primary.contrastText' : 'text.primary',
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontStyle: msg.isDeleted ? 'italic' : 'normal' }}>
                    {msg.isDeleted ? 'Tin nhắn đã bị xóa' : msg.content}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    {msg.isEdited && !msg.isDeleted && (
                      <Typography variant="caption" sx={{ opacity: 0.6, fontSize: 9 }}>đã sửa</Typography>
                    )}
                    <Typography variant="caption" sx={{ opacity: 0.65, fontSize: 10 }}>
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          );
        })}
        {typing && (
          <Box display="flex" alignItems="center" gap={0.5} pl={5}>
            <Typography variant="caption" color="textSecondary" fontStyle="italic">
              {selectedChat.partnerName} đang nhập...
            </Typography>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message context menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={startEdit} sx={{ gap: 1 }}><IconEdit size={16} /> Sửa</MenuItem>
        <MenuItem onClick={handleDelete} sx={{ gap: 1, color: 'error.main' }}><IconTrash size={16} /> Xóa</MenuItem>
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
};

export default ChatContent;
