'use client';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { IconChevronDown, IconChevronUp, IconVideo } from '@tabler/icons-react';
import { EXERCISE_DETAILS } from './lib/exerciseLibrary';
import ExerciseAnimation from './ExerciseAnimation';

export default function ExerciseTipRow({ exercise }) {
  const [open, setOpen] = useState(false);
  const detail = EXERCISE_DETAILS[exercise.name];

  const label = exercise.durationSeconds
    ? `${exercise.sets} sets × ${exercise.durationSeconds}s`
    : `${exercise.sets} sets × ${exercise.reps} reps`;

  return (
    <Box sx={{ mb: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, cursor: detail ? 'pointer' : 'default', '&:hover': detail ? { bgcolor: 'action.hover' } : {} }}
        onClick={() => detail && setOpen(v => !v)}
      >
        <Typography variant="subtitle2" sx={{ flex: 1, fontWeight: 600 }}>
          {exercise.name}
        </Typography>
        <Chip label={label} size="small" variant="outlined" />
        {exercise.restSeconds && (
          <Typography variant="caption" color="text.secondary">nghỉ {exercise.restSeconds}s</Typography>
        )}
        {detail && (
          <IconButton size="small">
            {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          </IconButton>
        )}
      </Box>

      {detail && (
        <Collapse in={open}>
          <Box sx={{ px: 1.5, pb: 1.5, bgcolor: 'grey.50' }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 1.5, alignItems: 'flex-start' }}>
              {/* Animation */}
              <ExerciseAnimation name={exercise.name} size={120} />
              {/* Tips */}
              <Box component="ul" sx={{ m: 0, pl: 2, flex: 1 }}>
                {detail.tips.map((tip, i) => (
                  <Typography key={i} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.4 }}>
                    {tip}
                  </Typography>
                ))}
              </Box>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<IconVideo size={14} />}
              href={detail.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              component="a"
            >
              Xem video Darebees
            </Button>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}
