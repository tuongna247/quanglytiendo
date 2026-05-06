import { PushupAnim, SitupAnim, JumpRopeAnim, BurpeeAnim } from './ExerciseAnimsA';
import { SquatAnim, JumpingJackAnim, PlankAnim, SidePlankAnim, LegRaiseAnim } from './ExerciseAnimsB';

const ANIM_MAP = {
  'Hít đất': PushupAnim,
  'Gập bụng': SitupAnim,
  'Nhảy dây': JumpRopeAnim,
  'Burpee': BurpeeAnim,
  'Squat': SquatAnim,
  'Jumping Jack': JumpingJackAnim,
  'Plank': PlankAnim,
  'Side Plank': SidePlankAnim,
  'Leg Raise': LegRaiseAnim,
};

export default function ExerciseAnimation({ name, size = 140 }) {
  const Anim = ANIM_MAP[name];
  if (!Anim) return null;
  return (
    <div style={{
      width: size,
      height: size,
      background: 'linear-gradient(150deg, #e8f5fe 0%, #b3d9f8 60%, #90caf9 100%)',
      borderRadius: 16,
      padding: 8,
      flexShrink: 0,
      boxShadow: '0 8px 24px rgba(21,101,192,0.22), 0 2px 6px rgba(21,101,192,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
      transform: 'perspective(600px) rotateX(8deg) rotateY(-3deg)',
      transformOrigin: 'center 90%',
    }}>
      <Anim />
    </div>
  );
}
