'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import apiClient from '@/app/lib/apiClient';

const RATING_LABELS = { energy: 'Năng lượng', mood: 'Tâm trạng', sleep: 'Giấc ngủ', stress: 'Căng thẳng' };

const LEVEL_LABELS = { 1: 'Rất thấp', 2: 'Thấp', 3: 'Trung bình', 4: 'Tốt', 5: 'Rất tốt' };

export default function CheckInTab() {
  const [checkin, setCheckin] = useState({ energy: 3, mood: 3, sleep: 3, stress: 3 });
  const [saving, setSaving] = useState(false);

  async function saveCheckin() {
    setSaving(true);
    try {
      await apiClient.post('/api/health/checkin', { ...checkin, date: new Date().toISOString().split('T')[0] });
      alert('Đã lưu check-in hôm nay!');
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  }

  return (
    <Card sx={{ borderRadius: 2, maxWidth: 600 }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>Lắng nghe cơ thể hôm nay</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(RATING_LABELS).map(([key, label]) => (
            <Box key={key}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{label}</Typography>
              <ToggleButtonGroup
                value={checkin[key]}
                exclusive
                onChange={(_, v) => v !== null && setCheckin(c => ({ ...c, [key]: v }))}
                size="small"
              >
                {[1, 2, 3, 4, 5].map(v => (
                  <ToggleButton key={v} value={v} sx={{ minWidth: 48 }}>{v}</ToggleButton>
                ))}
              </ToggleButtonGroup>
              <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                {LEVEL_LABELS[checkin[key]]}
              </Typography>
            </Box>
          ))}
          <Button variant="contained" onClick={saveCheckin} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu check-in hôm nay'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
