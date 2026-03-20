import React, { useContext, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import { IconSend, IconMoodSmile } from '@tabler/icons-react';
import { ChatContext } from '@/app/context/ChatContext';

const EMOJIS = [
  '😀','😂','🥰','😍','😎','🤩','😢','😭','😡','🤔',
  '👍','👎','❤️','🔥','🎉','✅','💯','🙏','😅','🤣',
  '😊','😋','😏','🤗','😴','😱','🤯','🥳','🎊','💪',
  '👏','🌹','⭐','🌟','💡','🚀','🎯','💬','📌','🫶',
];

const ChatMsgSent = () => {
  const [msg, setMsg] = useState('');
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const { sendMessage, sendTyping, selectedChat } = useContext(ChatContext);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!msg.trim() || !selectedChat) return;
    sendMessage(msg.trim());
    setMsg('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const insertEmoji = (emoji) => {
    setMsg(prev => prev + emoji);
    setEmojiAnchor(null);
  };

  return (
    <Box p={2}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <IconButton size="small" onClick={e => setEmojiAnchor(e.currentTarget)} sx={{ mb: 0.25 }}>
          <IconMoodSmile size={20} />
        </IconButton>
        <TextField
          fullWidth size="small" multiline maxRows={4}
          placeholder="Nhập tin nhắn..."
          value={msg}
          onChange={e => { setMsg(e.target.value); sendTyping(); }}
          onKeyDown={handleKeyDown}
          disabled={!selectedChat}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
        />
        <IconButton color="primary" type="submit" disabled={!msg.trim() || !selectedChat} sx={{ mb: 0.25 }}>
          <IconSend stroke={1.5} size={20} />
        </IconButton>
      </form>

      <Popover
        open={Boolean(emojiAnchor)}
        anchorEl={emojiAnchor}
        onClose={() => setEmojiAnchor(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 1.5, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 0.25, maxWidth: 280 }}>
          {EMOJIS.map(emoji => (
            <IconButton key={emoji} size="small" onClick={() => insertEmoji(emoji)} sx={{ fontSize: 20, p: 0.5 }}>
              {emoji}
            </IconButton>
          ))}
        </Box>
      </Popover>
    </Box>
  );
};

export default ChatMsgSent;
