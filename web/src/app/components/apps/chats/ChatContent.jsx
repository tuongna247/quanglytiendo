import React, { useContext, useEffect, useRef } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconMenu2 } from '@tabler/icons-react';
import { ChatContext } from '@/app/context/ChatContext/index';

const ChatContent = ({ toggleChatSidebar }) => {
  const { selectedChat, currentUser, typing } = useContext(ChatContext);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages, typing]);

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
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
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
            >
              {!isMine && (
                <Avatar
                  sx={{ width: 28, height: 28, bgcolor: selectedChat.partnerAvatarColor, fontSize: 12, mr: 1, mt: 0.5, flexShrink: 0 }}
                >
                  {(selectedChat.partnerName?.[0] || '?').toUpperCase()}
                </Avatar>
              )}
              <Paper
                elevation={0}
                sx={{
                  px: 1.5, py: 0.75,
                  maxWidth: '70%',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  bgcolor: isMine ? 'primary.main' : 'grey.100',
                  color: isMine ? 'primary.contrastText' : 'text.primary',
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.content}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.65, display: 'block', textAlign: 'right', fontSize: 10, mt: 0.25 }}>
                  {new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Typography>
              </Paper>
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
    </Box>
  );
};

export default ChatContent;
