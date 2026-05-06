import { PushupAnim, SitupAnim, JumpRopeAnim, BurpeeAnim } from './ExerciseAnimsA';
import { SquatAnim, JumpingJackAnim, PlankAnim, SidePlankAnim, LegRaiseAnim } from './ExerciseAnimsB';

const BG = '#e3f2fd';

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
    <div style={{ width: size, height: size, background: BG, borderRadius: 12, padding: 8, flexShrink: 0 }}>
      <Anim />
    </div>
  );
}
