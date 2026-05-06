import { S, SH, SZ, SW, css, GLOW } from './ExerciseAnimsA';
const FL = 'rgba(21,101,192,0.18)';

function Grad({ id }) {
  return (
    <radialGradient id={id} cx="35%" cy="30%" r="65%">
      <stop offset="0%" stopColor={SH} />
      <stop offset="100%" stopColor={S} />
    </radialGradient>
  );
}

export function SquatAnim() {
  return (
    <svg viewBox="0 0 160 92" style={SZ}>
      <style>{`
        ${css('sq-up', '0%,40%{opacity:1} 50%,90%{opacity:0} 100%{opacity:1}')}
        ${css('sq-dn', '0%,40%{opacity:0} 50%,90%{opacity:1} 100%{opacity:0}')}
      `}</style>
      <defs><Grad id="sq-g" /></defs>
      <line x1="20" y1="84" x2="140" y2="84" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'sq-up 1.6s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="80" cy="18" r="9" fill="url(#sq-g)" stroke="none" />
        <line x1="80" y1="27" x2="80" y2="58" stroke={S} />
        <polyline points="80,37 64,52 60,60" stroke={S} />
        <polyline points="80,37 96,52 100,60" stroke={S} />
        <circle cx="64" cy="52" r="3" fill={SH} stroke="none" />
        <circle cx="96" cy="52" r="3" fill={SH} stroke="none" />
        <polyline points="80,58 70,72 66,84" stroke={S} />
        <polyline points="80,58 90,72 94,84" stroke={S} />
        <circle cx="70" cy="72" r="3" fill={SH} stroke="none" />
        <circle cx="90" cy="72" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'sq-dn 1.6s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="80" cy="34" r="9" fill="url(#sq-g)" stroke="none" />
        <line x1="80" y1="43" x2="80" y2="62" stroke={S} />
        <polyline points="80,49 55,48 48,54" stroke={S} />
        <polyline points="80,49 105,48 112,54" stroke={S} />
        <circle cx="55" cy="48" r="3" fill={SH} stroke="none" />
        <circle cx="105" cy="48" r="3" fill={SH} stroke="none" />
        <polyline points="80,62 54,70 48,84" stroke={S} />
        <polyline points="80,62 106,70 112,84" stroke={S} />
        <circle cx="54" cy="70" r="3" fill={SH} stroke="none" />
        <circle cx="106" cy="70" r="3" fill={SH} stroke="none" />
      </g>
      <text x="80" y="91" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Squat</text>
    </svg>
  );
}

export function JumpingJackAnim() {
  return (
    <svg viewBox="0 0 160 90" style={SZ}>
      <style>{`
        ${css('jj-cl', '0%,40%{opacity:1} 50%,90%{opacity:0} 100%{opacity:1}')}
        ${css('jj-op', '0%,40%{opacity:0} 50%,90%{opacity:1} 100%{opacity:0}')}
      `}</style>
      <defs><Grad id="jj-g" /></defs>
      <line x1="20" y1="82" x2="140" y2="82" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'jj-cl 0.7s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="80" cy="16" r="9" fill="url(#jj-g)" stroke="none" />
        <line x1="80" y1="25" x2="80" y2="56" stroke={S} />
        <polyline points="80,34 66,50 62,58" stroke={S} />
        <polyline points="80,34 94,50 98,58" stroke={S} />
        <circle cx="66" cy="50" r="3" fill={SH} stroke="none" />
        <circle cx="94" cy="50" r="3" fill={SH} stroke="none" />
        <polyline points="80,56 74,70 72,82" stroke={S} />
        <polyline points="80,56 86,70 88,82" stroke={S} />
        <circle cx="74" cy="70" r="3" fill={SH} stroke="none" />
        <circle cx="86" cy="70" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'jj-op 0.7s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="80" cy="16" r="9" fill="url(#jj-g)" stroke="none" />
        <line x1="80" y1="25" x2="80" y2="56" stroke={S} />
        <polyline points="80,34 54,20 46,12" stroke={S} />
        <polyline points="80,34 106,20 114,12" stroke={S} />
        <circle cx="54" cy="20" r="3" fill={SH} stroke="none" />
        <circle cx="106" cy="20" r="3" fill={SH} stroke="none" />
        <polyline points="80,56 54,70 46,82" stroke={S} />
        <polyline points="80,56 106,70 114,82" stroke={S} />
        <circle cx="54" cy="70" r="3" fill={SH} stroke="none" />
        <circle cx="106" cy="70" r="3" fill={SH} stroke="none" />
      </g>
      <text x="80" y="91" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Jumping Jack</text>
    </svg>
  );
}

export function PlankAnim() {
  return (
    <svg viewBox="0 0 180 75" style={SZ}>
      <style>{css('pl-breathe', '0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)}')}</style>
      <defs><Grad id="pl-g" /></defs>
      <line x1="20" y1="64" x2="165" y2="64" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'pl-breathe 3s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="20" cy="34" r="9" fill="url(#pl-g)" stroke="none" />
        <line x1="29" y1="34" x2="105" y2="32" stroke={S} />
        <line x1="46" y1="33" x2="43" y2="64" stroke={S} />
        <line x1="76" y1="32" x2="73" y2="64" stroke={S} />
        <circle cx="43" cy="64" r="3" fill={SH} stroke="none" />
        <circle cx="73" cy="64" r="3" fill={SH} stroke="none" />
        <line x1="105" y1="32" x2="148" y2="54" stroke={S} />
        <line x1="148" y1="54" x2="162" y2="64" stroke={S} />
        <circle cx="148" cy="54" r="3" fill={SH} stroke="none" />
      </g>
      <text x="88" y="74" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Plank</text>
    </svg>
  );
}

export function SidePlankAnim() {
  return (
    <svg viewBox="0 0 180 80" style={SZ}>
      <style>{css('sp-sway', '0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)}')}</style>
      <defs><Grad id="sp-g" /></defs>
      <line x1="10" y1="72" x2="165" y2="72" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'sp-sway 3s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="24" cy="42" r="9" fill="url(#sp-g)" stroke="none" />
        <line x1="31" y1="46" x2="112" y2="68" stroke={S} />
        <line x1="31" y1="46" x2="14" y2="72" stroke={S} />
        <circle cx="14" cy="72" r="3" fill={SH} stroke="none" />
        <line x1="66" y1="57" x2="66" y2="30" stroke={S} />
        <circle cx="66" cy="30" r="3" fill={SH} stroke="none" />
        <line x1="112" y1="68" x2="145" y2="72" stroke={S} />
        <line x1="112" y1="68" x2="143" y2="76" stroke={S} />
        <circle cx="112" cy="68" r="3" fill={SH} stroke="none" />
      </g>
      <text x="88" y="80" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Side Plank</text>
    </svg>
  );
}

export function LegRaiseAnim() {
  return (
    <svg viewBox="0 0 160 80" style={SZ}>
      <style>{`
        ${css('lr-up', '0%,40%{opacity:1} 50%,90%{opacity:0} 100%{opacity:1}')}
        ${css('lr-dn', '0%,40%{opacity:0} 50%,90%{opacity:1} 100%{opacity:0}')}
      `}</style>
      <defs><Grad id="lr-g" /></defs>
      <line x1="10" y1="68" x2="150" y2="68" stroke={FL} strokeWidth={3} />
      <g style={{ filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="18" cy="58" r="9" fill="url(#lr-g)" stroke="none" />
        <line x1="27" y1="58" x2="95" y2="58" stroke={S} />
        <polyline points="30,58 22,68 16,68" stroke={S} />
        <polyline points="36,58 28,68 22,68" stroke={S} />
      </g>
      <g style={{ animation: 'lr-up 2s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <line x1="95" y1="58" x2="95" y2="14" stroke={S} />
        <line x1="100" y1="58" x2="100" y2="14" stroke={S} />
        <circle cx="97" cy="14" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'lr-dn 2s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <line x1="95" y1="58" x2="134" y2="68" stroke={S} />
        <line x1="100" y1="58" x2="137" y2="68" stroke={S} />
        <circle cx="136" cy="68" r="3" fill={SH} stroke="none" />
      </g>
      <text x="80" y="78" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Leg Raise</text>
    </svg>
  );
}
