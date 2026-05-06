import { useRef, useEffect, useState } from 'react';
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

// exercise name → local photo key (public/exercises/{key}_0.jpg + {key}_1.jpg)
const PHOTO_MAP = {
  'Hít đất':         'pushup',
  'Gập bụng':        'situp',
  'Squat':           'squat',
  'Plank':           'plank',
  'Mountain Climber':'mountain',
  'Nhảy dây':        'jumprope',
  'Lunge':           'lunge',
  'Leg Raise':       'legraise',
};

const containerStyle = (size) => ({
  width: size,
  height: size,
  borderRadius: 16,
  overflow: 'hidden',
  flexShrink: 0,
  position: 'relative',
  background: '#e8f0fe',
  boxShadow: '0 4px 16px rgba(21,101,192,0.18)',
});

function PhotoAnim({ photoKey, size }) {
  const [frame, setFrame] = useState(0);
  const [opacity0, setOpacity0] = useState(1);
  const timer = useRef(null);

  useEffect(() => {
    // crossfade: frame 0 visible → fade to frame 1 → fade back
    let f = 0;
    timer.current = setInterval(() => {
      f = 1 - f;
      setFrame(f);
      setOpacity0(f === 0 ? 1 : 0);
    }, 1000);
    return () => clearInterval(timer.current);
  }, [photoKey]);

  const imgStyle = {
    position: 'absolute', inset: 0,
    width: '100%', height: '100%',
    objectFit: 'contain',
    transition: 'opacity 0.5s ease-in-out',
  };

  return (
    <>
      <img
        src={`/exercises/${photoKey}_0.jpg`}
        alt=""
        style={{ ...imgStyle, opacity: opacity0 }}
      />
      <img
        src={`/exercises/${photoKey}_1.jpg`}
        alt=""
        style={{ ...imgStyle, opacity: 1 - opacity0 }}
      />
    </>
  );
}

export default function ExerciseAnimation({ name, size = 140 }) {
  const photoKey = PHOTO_MAP[name];
  const Anim = ANIM_MAP[name];

  if (photoKey) {
    return (
      <div style={containerStyle(size)}>
        <PhotoAnim photoKey={photoKey} size={size} />
      </div>
    );
  }

  if (!Anim) return null;
  return (
    <div style={{
      ...containerStyle(size),
      background: 'linear-gradient(150deg, #e8f5fe 0%, #b3d9f8 60%, #90caf9 100%)',
      overflow: 'visible',
      padding: 8,
      boxShadow: '0 8px 24px rgba(21,101,192,0.22), 0 2px 6px rgba(21,101,192,0.12), inset 0 1px 0 rgba(255,255,255,0.6)',
      transform: 'perspective(600px) rotateX(8deg) rotateY(-3deg)',
      transformOrigin: 'center 90%',
    }}>
      <Anim />
    </div>
  );
}
