const S = '#1976d2'; // stroke color
const BG = '#e3f2fd'; // background
const SZ = { width: '100%', height: '100%' };

const css = (name, frames) => `@keyframes ${name} { ${frames} }`;

function PushupAnim() {
  return (
    <svg viewBox="0 0 160 80" style={SZ}>
      <style>{css('pu-body', '0%,100%{transform:translateY(0)} 50%{transform:translateY(12px)}')}</style>
      <g style={{ animation: 'pu-body 1.4s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        {/* head */}
        <circle cx="18" cy="32" r="7" fill={S} stroke="none" />
        {/* body */}
        <line x1="25" y1="32" x2="80" y2="32" />
        {/* front arm */}
        <line x1="38" y1="32" x2="38" y2="52" />
        {/* back arm */}
        <line x1="62" y1="32" x2="62" y2="52" />
        {/* legs */}
        <line x1="80" y1="32" x2="115" y2="50" />
        <line x1="84" y1="33" x2="119" y2="52" />
        {/* floor indicators */}
        <line x1="28" y1="53" x2="125" y2="53" strokeDasharray="4 4" strokeOpacity="0.3" />
      </g>
      <text x="80" y="73" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif">Hít đất</text>
    </svg>
  );
}

function SitupAnim() {
  return (
    <svg viewBox="0 0 160 90" style={SZ}>
      <style>{css('su-torso', '0%,100%{transform-origin:90px 62px;transform:rotate(0deg)} 40%,60%{transform-origin:90px 62px;transform:rotate(-55deg)}')}</style>
      {/* legs always flat */}
      <line x1="50" y1="62" x2="130" y2="62" stroke={S} strokeWidth={3} strokeLinecap="round" />
      <line x1="55" y1="62" x2="130" y2="66" stroke={S} strokeWidth={3} strokeLinecap="round" />
      {/* bent knees */}
      <line x1="50" y1="62" x2="60" y2="48" stroke={S} strokeWidth={3} strokeLinecap="round" />
      <line x1="55" y1="66" x2="65" y2="52" stroke={S} strokeWidth={3} strokeLinecap="round" />
      {/* animated torso + head */}
      <g style={{ animation: 'su-torso 1.8s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <line x1="90" y1="62" x2="90" y2="28" />
        <circle cx="90" cy="20" r="7" fill={S} stroke="none" />
        {/* arms going to knees */}
        <line x1="90" y1="36" x2="75" y2="50" />
        <line x1="90" y1="36" x2="105" y2="50" />
      </g>
      <line x1="20" y1="70" x2="140" y2="70" stroke={S} strokeDasharray="4 4" strokeOpacity="0.3" />
      <text x="80" y="85" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif">Gập bụng</text>
    </svg>
  );
}

function JumpRopeAnim() {
  return (
    <svg viewBox="0 0 160 110" style={SZ}>
      <style>{`
        ${css('jr-body', '0%,100%{transform:translateY(0)} 40%,60%{transform:translateY(-18px)}')}
        ${css('jr-rope', '0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}')}
      `}</style>
      {/* rope — rotates around figure center */}
      <g style={{ transformOrigin: '80px 55px', animation: 'jr-rope 0.6s linear infinite' }}>
        <ellipse cx="80" cy="55" rx="32" ry="10" fill="none" stroke="#FF7043" strokeWidth="2" strokeDasharray="6 4" />
      </g>
      {/* figure jumps */}
      <g style={{ animation: 'jr-body 0.6s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <circle cx="80" cy="28" r="8" fill={S} stroke="none" />
        <line x1="80" y1="36" x2="80" y2="65" />
        {/* arms out holding rope */}
        <line x1="80" y1="45" x2="55" y2="58" />
        <line x1="80" y1="45" x2="105" y2="58" />
        {/* legs */}
        <line x1="80" y1="65" x2="65" y2="85" />
        <line x1="80" y1="65" x2="95" y2="85" />
      </g>
      <line x1="20" y1="87" x2="140" y2="87" stroke={S} strokeDasharray="4 4" strokeOpacity="0.3" />
      <text x="80" y="103" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif">Nhảy dây</text>
    </svg>
  );
}

function BurpeeAnim() {
  // Cycles through 4 positions: stand → squat → plank → jump
  return (
    <svg viewBox="0 0 200 100" style={SZ}>
      <style>{`
        ${css('bu-stand', '0%,20%{opacity:1} 25%,100%{opacity:0}')}
        ${css('bu-squat', '20%,40%{opacity:1} 0%,45%,100%{opacity:0}')}
        ${css('bu-plank', '45%,65%{opacity:1} 0%,40%,70%,100%{opacity:0}')}
        ${css('bu-jump',  '70%,90%{opacity:1} 0%,65%,95%,100%{opacity:0}')}
      `}</style>
      {/* STAND */}
      <g style={{ animation: 'bu-stand 2.4s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <circle cx="40" cy="25" r="7" fill={S} stroke="none" /><line x1="40" y1="32" x2="40" y2="60" /><line x1="40" y1="40" x2="28" y2="52" /><line x1="40" y1="40" x2="52" y2="52" /><line x1="40" y1="60" x2="30" y2="80" /><line x1="40" y1="60" x2="50" y2="80" />
      </g>
      {/* SQUAT */}
      <g style={{ animation: 'bu-squat 2.4s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <circle cx="40" cy="42" r="7" fill={S} stroke="none" /><line x1="40" y1="49" x2="40" y2="62" /><line x1="40" y1="53" x2="28" y2="60" /><line x1="40" y1="53" x2="52" y2="60" /><line x1="40" y1="62" x2="28" y2="80" /><line x1="40" y1="62" x2="52" y2="80" />
      </g>
      {/* PLANK */}
      <g style={{ animation: 'bu-plank 2.4s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <circle cx="25" cy="48" r="7" fill={S} stroke="none" /><line x1="32" y1="48" x2="85" y2="48" /><line x1="40" y1="48" x2="40" y2="68" /><line x1="68" y1="48" x2="68" y2="68" /><line x1="85" y1="48" x2="105" y2="68" /><line x1="88" y1="49" x2="108" y2="69" />
      </g>
      {/* JUMP */}
      <g style={{ animation: 'bu-jump 2.4s ease-in-out infinite' }} stroke={S} strokeWidth={3} strokeLinecap="round" fill="none">
        <circle cx="40" cy="16" r="7" fill={S} stroke="none" /><line x1="40" y1="23" x2="40" y2="52" /><line x1="40" y1="32" x2="22" y2="22" /><line x1="40" y1="32" x2="58" y2="22" /><line x1="40" y1="52" x2="30" y2="70" /><line x1="40" y1="52" x2="50" y2="70" />
      </g>
      <line x1="10" y1="82" x2="120" y2="82" stroke={S} strokeDasharray="4 4" strokeOpacity="0.3" />
      <text x="60" y="96" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif">Burpee</text>
    </svg>
  );
}

const ANIM_MAP = {
  'Hít đất': PushupAnim,
  'Gập bụng': SitupAnim,
  'Nhảy dây': JumpRopeAnim,
  'Burpee': BurpeeAnim,
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
