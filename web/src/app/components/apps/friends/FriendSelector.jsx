'use client';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import apiClient from '@/app/lib/apiClient';

/**
 * Dropdown to select from accepted friends.
 * Props:
 *   value: Guid | null
 *   onChange: (friendUserId, friendDto) => void
 *   label?: string
 */
export default function FriendSelector({ value, onChange, label = 'Chọn bạn bè' }) {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    apiClient.get('/api/friends')
      .then(data => {
        const accepted = (data || []).filter(f => f.status === 'accepted');
        setFriends(accepted);
      })
      .catch(() => {});
  }, []);

  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        label={label}
        onChange={e => {
          const selected = friends.find(f => f.userId === e.target.value);
          onChange(e.target.value, selected || null);
        }}
      >
        {friends.map(f => (
          <MenuItem key={f.userId} value={f.userId}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: f.avatarColor, fontSize: 12 }}>
                {f.displayName?.[0]?.toUpperCase() || f.username?.[0]?.toUpperCase()}
              </Avatar>
              <Typography variant="body2">{f.displayName} <span style={{ color: '#999' }}>@{f.username}</span></Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
