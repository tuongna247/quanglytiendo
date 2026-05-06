export const S  = '#1565c0'; // main stroke / fill
export const SH = '#42a5f5'; // highlight (head top)
export const SZ = { width: '100%', height: '100%' };
export const SW = 4.5;
export const css = (name, frames) => `@keyframes ${name} { ${frames} }`;
export const GLOW = 'drop-shadow(0px 2px 3px rgba(13,71,161,0.45)) drop-shadow(0px 0px 5px rgba(66,165,245,0.3))';
const FL = 'rgba(21,101,192,0.18)'; // floor line color

export function PushupAnim() {
  return (
    <svg viewBox="0 0 180 80" style={SZ}>
      <style>{`
        ${css('pu-up', '0%,40%{opacity:1} 50%,90%{opacity:0} 100%{opacity:1}')}
        ${css('pu-dn', '0%,40%{opacity:0} 50%,90%{opacity:1} 100%{opacity:0}')}
      `}</style>
      <defs>
        <radialGradient id="pu-hg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={SH} /><stop offset="100%" stopColor={S} />
        </radialGradient>
      </defs>
      <line x1="20" y1="62" x2="165" y2="62" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'pu-up 1.6s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="20" cy="30" r="9" fill="url(#pu-hg)" stroke="none" />
        <line x1="29" y1="30" x2="105" y2="28" stroke={S} />
        <line x1="46" y1="30" x2="43" y2="62" stroke={S} />
        <line x1="76" y1="29" x2="73" y2="62" stroke={S} />
        <line x1="105" y1="28" x2="148" y2="52" stroke={S} />
        <line x1="148" y1="52" x2="160" y2="62" stroke={S} />
        <circle cx="43" cy="62" r="3" fill={SH} stroke="none" />
        <circle cx="73" cy="62" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'pu-dn 1.6s ease-in-out infinite', filter: GLOW }} strokeLinecap="round" strokeWidth={SW} fill="none">
        <circle cx="20" cy="46" r="9" fill="url(#pu-hg)" stroke="none" />
        <line x1="29" y1="46" x2="105" y2="43" stroke={S} />
        <polyline points="46,45 30,53 43,62" stroke={S} />
        <polyline points="76,44 60,52 73,62" stroke={S} />
        <line x1="105" y1="43" x2="148" y2="52" stroke={S} />
        <line x1="148" y1="52" x2="160" y2="62" stroke={S} />
        <circle cx="30" cy="53" r="3" fill={SH} stroke="none" />
        <circle cx="60" cy="52" r="3" fill={SH} stroke="none" />
      </g>
      <text x="88" y="76" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Hít đất</text>
    </svg>
  );
}

export function SitupAnim() {
  return (
    <svg viewBox="0 0 160 90" style={SZ}>
      <style>{css('su-torso', '0%,100%{transform-origin:90px 64px;transform:rotate(0deg)} 40%,60%{transform-origin:90px 64px;transform:rotate(-60deg)}')}</style>
      <defs>
        <radialGradient id="su-hg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={SH} /><stop offset="100%" stopColor={S} />
        </radialGradient>
      </defs>
      <line x1="20" y1="72" x2="150" y2="72" stroke={FL} strokeWidth={3} />
      <g style={{ filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <line x1="50" y1="64" x2="140" y2="64" stroke={S} />
        <line x1="56" y1="68" x2="140" y2="68" stroke={S} />
        <polyline points="50,64 52,48 42,64" stroke={S} />
        <polyline points="56,68 58,52 48,68" stroke={S} />
        <circle cx="52" cy="48" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'su-torso 1.8s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <line x1="90" y1="64" x2="90" y2="26" stroke={S} />
        <circle cx="90" cy="18" r="9" fill="url(#su-hg)" stroke="none" />
        <polyline points="90,36 72,52 90,64" stroke={S} />
        <polyline points="90,36 108,52 90,64" stroke={S} />
        <circle cx="72" cy="52" r="3" fill={SH} stroke="none" />
        <circle cx="108" cy="52" r="3" fill={SH} stroke="none" />
      </g>
      <text x="80" y="86" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Gập bụng</text>
    </svg>
  );
}

export function JumpRopeAnim() {
  return (
    <svg viewBox="0 0 160 112" style={SZ}>
      <style>{`
        ${css('jr-body', '0%,100%{transform:translateY(0)} 40%,60%{transform:translateY(-20px)}')}
        ${css('jr-rope', '0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)}')}
      `}</style>
      <defs>
        <radialGradient id="jr-hg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={SH} /><stop offset="100%" stopColor={S} />
        </radialGradient>
      </defs>
      <line x1="20" y1="89" x2="140" y2="89" stroke={FL} strokeWidth={3} />
      <g style={{ transformOrigin: '80px 58px', animation: 'jr-rope 0.6s linear infinite', filter: 'drop-shadow(0px 1px 2px rgba(255,112,67,0.5))' }}>
        <ellipse cx="80" cy="58" rx="34" ry="11" fill="none" stroke="#f4511e" strokeWidth={3} />
      </g>
      <g style={{ animation: 'jr-body 0.6s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <circle cx="80" cy="26" r="9" fill="url(#jr-hg)" stroke="none" />
        <line x1="80" y1="35" x2="80" y2="66" stroke={S} />
        <polyline points="80,46 56,60 52,72" stroke={S} />
        <polyline points="80,46 104,60 108,72" stroke={S} />
        <circle cx="56" cy="60" r="3" fill={SH} stroke="none" />
        <circle cx="104" cy="60" r="3" fill={SH} stroke="none" />
        <polyline points="80,66 68,82 62,89" stroke={S} />
        <polyline points="80,66 92,82 98,89" stroke={S} />
        <circle cx="68" cy="82" r="3" fill={SH} stroke="none" />
        <circle cx="92" cy="82" r="3" fill={SH} stroke="none" />
      </g>
      <text x="80" y="106" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Nhảy dây</text>
    </svg>
  );
}

export function BurpeeAnim() {
  return (
    <svg viewBox="0 0 200 100" style={SZ}>
      <style>{`
        ${css('bu-stand', '0%,20%{opacity:1} 25%,100%{opacity:0}')}
        ${css('bu-squat', '20%,40%{opacity:1} 0%,45%,100%{opacity:0}')}
        ${css('bu-plank', '45%,65%{opacity:1} 0%,40%,70%,100%{opacity:0}')}
        ${css('bu-jump',  '70%,90%{opacity:1} 0%,65%,95%,100%{opacity:0}')}
      `}</style>
      <defs>
        <radialGradient id="bu-hg" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={SH} /><stop offset="100%" stopColor={S} />
        </radialGradient>
      </defs>
      <line x1="10" y1="83" x2="180" y2="83" stroke={FL} strokeWidth={3} />
      <g style={{ animation: 'bu-stand 2.4s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <circle cx="40" cy="22" r="9" fill="url(#bu-hg)" stroke="none" />
        <line x1="40" y1="31" x2="40" y2="60" stroke={S} />
        <polyline points="40,40 26,54 22,64" stroke={S} /><polyline points="40,40 54,54 58,64" stroke={S} />
        <circle cx="26" cy="54" r="3" fill={SH} stroke="none" /><circle cx="54" cy="54" r="3" fill={SH} stroke="none" />
        <polyline points="40,60 32,74 28,83" stroke={S} /><polyline points="40,60 48,74 52,83" stroke={S} />
        <circle cx="32" cy="74" r="3" fill={SH} stroke="none" /><circle cx="48" cy="74" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'bu-squat 2.4s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <circle cx="40" cy="40" r="9" fill="url(#bu-hg)" stroke="none" />
        <line x1="40" y1="49" x2="40" y2="63" stroke={S} />
        <polyline points="40,53 26,60 22,68" stroke={S} /><polyline points="40,53 54,60 58,68" stroke={S} />
        <circle cx="26" cy="60" r="3" fill={SH} stroke="none" /><circle cx="54" cy="60" r="3" fill={SH} stroke="none" />
        <polyline points="40,63 28,74 22,83" stroke={S} /><polyline points="40,63 52,74 58,83" stroke={S} />
        <circle cx="28" cy="74" r="3" fill={SH} stroke="none" /><circle cx="52" cy="74" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'bu-plank 2.4s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <circle cx="22" cy="46" r="9" fill="url(#bu-hg)" stroke="none" />
        <line x1="31" y1="46" x2="95" y2="44" stroke={S} />
        <polyline points="46,46 34,52 40,64" stroke={S} /><polyline points="72,45 60,51 66,64" stroke={S} />
        <circle cx="34" cy="52" r="3" fill={SH} stroke="none" /><circle cx="60" cy="51" r="3" fill={SH} stroke="none" />
        <line x1="95" y1="44" x2="132" y2="64" stroke={S} />
        <line x1="132" y1="64" x2="148" y2="70" stroke={S} />
        <circle cx="132" cy="64" r="3" fill={SH} stroke="none" />
      </g>
      <g style={{ animation: 'bu-jump 2.4s ease-in-out infinite', filter: GLOW }} strokeWidth={SW} strokeLinecap="round" fill="none">
        <circle cx="40" cy="14" r="9" fill="url(#bu-hg)" stroke="none" />
        <line x1="40" y1="23" x2="40" y2="52" stroke={S} />
        <polyline points="40,32 20,20 14,14" stroke={S} /><polyline points="40,32 60,20 66,14" stroke={S} />
        <circle cx="20" cy="20" r="3" fill={SH} stroke="none" /><circle cx="60" cy="20" r="3" fill={SH} stroke="none" />
        <polyline points="40,52 30,68 26,76" stroke={S} /><polyline points="40,52 50,68 54,76" stroke={S} />
        <circle cx="30" cy="68" r="3" fill={SH} stroke="none" /><circle cx="50" cy="68" r="3" fill={SH} stroke="none" />
      </g>
      <text x="90" y="96" textAnchor="middle" fontSize="10" fill={S} fontFamily="sans-serif" fontWeight="600">Burpee</text>
    </svg>
  );
}
