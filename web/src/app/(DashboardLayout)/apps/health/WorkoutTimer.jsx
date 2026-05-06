'use client';
import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ExerciseAnimation from './ExerciseAnimation';

const RADIUS = 44;
const CIRC = 2 * Math.PI * RADIUS;
const WORK_COLOR = '#1976d2';
const REST_COLOR = '#43a047';

function TimerRing({ timeLeft, total, phase }) {
  const progress = total > 0 ? (total - timeLeft) / total : 1;
  const dashOffset = CIRC * (1 - progress);
  const color = phase === 'rest' ? REST_COLOR : WORK_COLOR;
  const label = phase === 'work' ? 'TẬP' : 'NGHỈ';

  return (
    <svg width={120} height={120} viewBox="0 0 110 110">
      <circle cx="55" cy="55" r={RADIUS} fill="none" stroke="#e0e0e0" strokeWidth={9} />
      <circle
        cx="55" cy="55" r={RADIUS} fill="none" stroke={color} strokeWidth={9}
        strokeDasharray={CIRC} strokeDashoffset={dashOffset}
        strokeLinecap="round" transform="rotate(-90 55 55)"
        style={{ transition: 'stroke-dashoffset 0.95s linear, stroke 0.3s' }}
      />
      <text x="55" y="50" textAnchor="middle" fontSize="28" fontWeight="bold" fill="#333" fontFamily="sans-serif">
        {timeLeft}
      </text>
      <text x="55" y="68" textAnchor="middle" fontSize="12" fontWeight="700" fill={color} fontFamily="sans-serif">
        {label}
      </text>
    </svg>
  );
}

export default function WorkoutTimer({ open, exerciseName, workSeconds, restSeconds, onComplete, onCancel }) {
  const [phase, setPhase] = useState('work');
  const [timeLeft, setTimeLeft] = useState(workSeconds);

  useEffect(() => {
    if (!open) return;
    setPhase('work');
    setTimeLeft(workSeconds);
  }, [open, workSeconds]);

  const finish = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    if (!open || phase === 'done') return;
    const id = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (phase === 'work') {
            setPhase('rest');
            return restSeconds;
          }
          setPhase('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [open, phase, restSeconds]);

  useEffect(() => {
    if (phase === 'done') finish();
  }, [phase, finish]);

  const total = phase === 'rest' ? restSeconds : workSeconds;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{exerciseName}</Typography>
          <ExerciseAnimation name={exerciseName} size={110} />
          <TimerRing timeLeft={timeLeft} total={total} phase={phase} />
          <Button variant="outlined" color="inherit" size="small" onClick={onCancel}>
            Hủy
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
