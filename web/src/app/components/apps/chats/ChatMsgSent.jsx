import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import { IconSend } from '@tabler/icons-react';
import { ChatContext } from '@/app/context/ChatContext';

const ChatMsgSent = () => {
  const [msg, setMsg] = useState('');
  const { sendMessage, sendTyping, selectedChat } = useContext(ChatContext);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!msg.trim() || !selectedChat) return;
    sendMessage(msg.trim());
    setMsg('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Box p={2}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          size="small"
          multiline
          maxRows={4}
          placeholder="Nhập tin nhắn..."
          value={msg}
          onChange={e => { setMsg(e.target.value); sendTyping(); }}
          onKeyDown={handleKeyDown}
          disabled={!selectedChat}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton
          color="primary"
          type="submit"
          disabled={!msg.trim() || !selectedChat}
          sx={{ mb: 0.25 }}
        >
          <IconSend stroke={1.5} size={20} />
        </IconButton>
      </form>
    </Box>
  );
};

export default ChatMsgSent;
