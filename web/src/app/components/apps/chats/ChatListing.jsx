import React, { useContext } from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { ChatContext } from '@/app/context/ChatContext/index';
import Scrollbar from '../../custom-scroll/Scrollbar';
import { formatDistanceToNowStrict } from 'date-fns';
import { IconSearch } from '@tabler/icons-react';

const ChatListing = () => {
  const { conversations, selectedChat, chatSearch, setChatSearch, selectChat, loading, currentUser } = useContext(ChatContext);

  const filtered = conversations.filter(c =>
    (c.partnerName || '').toLowerCase().includes(chatSearch.toLowerCase()) ||
    (c.partnerUsername || '').toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div>
      {/* Current user header */}
      <Box display="flex" alignItems="center" gap="10px" p={3}>
        <Avatar
          sx={{ width: 54, height: 54, bgcolor: currentUser?.avatarColor || '#2196f3', fontSize: 22 }}
        >
          {(currentUser?.displayName?.[0] || currentUser?.username?.[0] || '?').toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="body1" fontWeight={600}>{currentUser?.displayName || currentUser?.username}</Typography>
          <Typography variant="body2" color="textSecondary">@{currentUser?.username}</Typography>
        </Box>
      </Box>

      {/* Search */}
      <Box px={3} py={1}>
        <TextField
          placeholder="Tìm cuộc trò chuyện..."
          size="small"
          fullWidth
          value={chatSearch}
          onChange={e => setChatSearch(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconSearch size={16} />
                </InputAdornment>
              ),
            }
          }}
        />
      </Box>

      {/* List */}
      <List sx={{ px: 0 }}>
        <Box px={2.5} pb={1}>
          <Typography variant="caption" color="textSecondary" fontWeight={600}>
            Tin nhắn gần đây
          </Typography>
        </Box>
        <Scrollbar sx={{ height: { lg: 'calc(100vh - 200px)', md: '100vh' }, maxHeight: 560 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={24} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box px={3} py={2}>
              <Typography variant="body2" color="textSecondary">
                {chatSearch ? 'Không tìm thấy' : 'Chưa có cuộc trò chuyện nào. Kết bạn và nhắn tin từ trang Bạn bè!'}
              </Typography>
            </Box>
          ) : (
            filtered.map(conv => (
              <ListItemButton
                key={conv.partnerId}
                onClick={() => selectChat(conv)}
                selected={selectedChat?.partnerId === conv.partnerId}
                sx={{ mb: 0.5, py: 1.5, px: 3, alignItems: 'start' }}
              >
                <ListItemAvatar>
                  <Badge
                    badgeContent={conv.unreadCount || 0}
                    color="primary"
                    max={99}
                  >
                    <Avatar sx={{ width: 42, height: 42, bgcolor: conv.partnerAvatarColor || '#2196f3', fontSize: 17 }}>
                      {(conv.partnerName?.[0] || conv.partnerUsername?.[0] || '?').toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                      {conv.partnerName || conv.partnerUsername}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="caption" color="textSecondary" noWrap>
                      {conv.lastMessage || ''}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />
                <Box sx={{ flexShrink: 0 }} mt={0.5}>
                  {conv.lastMessageAt && (
                    <Typography variant="caption" color="textSecondary">
                      {formatDistanceToNowStrict(new Date(conv.lastMessageAt), { addSuffix: false })}
                    </Typography>
                  )}
                </Box>
              </ListItemButton>
            ))
          )}
        </Scrollbar>
      </List>
    </div>
  );
};

export default ChatListing;
