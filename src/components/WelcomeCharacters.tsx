const SKIN  = '#f8cba4'
const RED   = '#c0392b'
const GOLD  = '#d4a017'
const HAIR  = '#1a1a1a'
const DARK  = '#23233a'
const WHITE = '#ffffff'

function Plum({ cx, cy, r = 6, pr = 2.4 }: { cx: number; cy: number; r?: number; pr?: number }) {
  return (
    <g opacity="0.9">
      {[0,72,144,216,288].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return <circle key={i} cx={cx + r * Math.sin(rad)} cy={cy - r * Math.cos(rad)} r={pr} fill={GOLD} />
      })}
      <circle cx={cx} cy={cy} r={pr * 0.65} fill={GOLD} />
    </g>
  )
}

export function MaleCharacter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 410" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">

      {/* ── HAIR (slick-back) ── */}
      <path d="M57 66 Q56 24 85 22 Q114 24 113 66 Q106 44 85 42 Q64 44 57 66Z" fill={HAIR} />
      <path d="M63 36 Q85 26 107 36 Q95 28 85 27 Q75 28 63 36Z" fill={HAIR} />

      {/* ── HEAD ── */}
      <ellipse cx="85" cy="70" rx="29" ry="34" fill={SKIN} />

      {/* Ears */}
      <ellipse cx="56" cy="72" rx="6.5" ry="9" fill={SKIN} />
      <ellipse cx="114" cy="72" rx="6.5" ry="9" fill={SKIN} />
      <ellipse cx="56" cy="72" rx="3.5" ry="5.5" fill="#f0b88a" />
      <ellipse cx="114" cy="72" rx="3.5" ry="5.5" fill="#f0b88a" />

      {/* ── FACE ── */}
      {/* Eyebrows */}
      <path d="M64 57 Q73 52 82 56" stroke={HAIR} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <path d="M88 56 Q97 52 106 57" stroke={HAIR} strokeWidth="2.8" fill="none" strokeLinecap="round" />

      {/* Eyes — almond */}
      <path d="M64 65 Q73 58 82 65 Q73 72 64 65Z" fill={HAIR} />
      <path d="M88 65 Q97 58 106 65 Q97 72 88 65Z" fill={HAIR} />
      <circle cx="70" cy="63" r="2.2" fill={WHITE} />
      <circle cx="94" cy="63" r="2.2" fill={WHITE} />

      {/* Nose */}
      <path d="M82 79 Q85 83 88 79" stroke="#d4956a" strokeWidth="1.3" fill="none" strokeLinecap="round" />

      {/* Open smile with teeth */}
      <path d="M71 88 Q85 100 99 88 Q85 92 71 88Z" fill={WHITE} />
      <path d="M71 88 Q85 99 99 88" stroke={RED} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <line x1="78" y1="90" x2="85" y2="92" stroke="#ddd" strokeWidth="0.8" />
      <line x1="85" y1="92" x2="92" y2="90" stroke="#ddd" strokeWidth="0.8" />

      {/* Cheek blush */}
      <ellipse cx="66" cy="83" rx="9" ry="5.5" fill="#f5a080" opacity="0.25" />
      <ellipse cx="104" cy="83" rx="9" ry="5.5" fill="#f5a080" opacity="0.25" />

      {/* ── NECK ── */}
      <rect x="79" y="102" width="12" height="16" fill={SKIN} />

      {/* ── TANG SUIT ── */}
      {/* Body */}
      <path d="M46 116 L46 252 L124 252 L124 116Z" fill={RED} />

      {/* Mandarin collar */}
      <path d="M79 118 L79 108 Q85 104 91 108 L91 118" fill={RED} stroke={GOLD} strokeWidth="2.5" strokeLinejoin="round" />

      {/* Centre seam */}
      <line x1="85" y1="118" x2="85" y2="252" stroke={GOLD} strokeWidth="1.5" opacity="0.55" />

      {/* Frog buttons (盘扣) */}
      {[127,140,153,166,179,192,205,218,232].map(y => (
        <g key={y}>
          <line x1="79" y1={y} x2="91" y2={y} stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="85" cy={y} r="3.8" fill={GOLD} />
        </g>
      ))}

      {/* Gold edge trim */}
      <rect x="46" y="116" width="3" height="136" fill={GOLD} />
      <rect x="121" y="116" width="3" height="136" fill={GOLD} />
      <line x1="46" y1="116" x2="79" y2="116" stroke={GOLD} strokeWidth="2.5" />
      <line x1="91" y1="116" x2="124" y2="116" stroke={GOLD} strokeWidth="2.5" />

      {/* ── ARMS — elbow-out, forearms forward for 拱手 ── */}
      {/* Left upper arm */}
      <path d="M46 126 L20 162 L34 172 L56 140Z" fill={RED} />
      {/* Left forearm angled in */}
      <path d="M20 162 L50 200 L66 188 L40 158Z" fill={RED} />
      {/* Right upper arm */}
      <path d="M124 126 L150 162 L136 172 L114 140Z" fill={RED} />
      {/* Right forearm angled in */}
      <path d="M150 162 L120 200 L104 188 L130 158Z" fill={RED} />

      {/* Gold cuffs */}
      <ellipse cx="27" cy="167" rx="11" ry="6.5" fill={GOLD} />
      <ellipse cx="143" cy="167" rx="11" ry="6.5" fill={GOLD} />

      {/* ── CLASPED HANDS (拱手礼) ── */}
      {/* Left fist */}
      <ellipse cx="80" cy="202" rx="18" ry="12" fill={SKIN} />
      {/* Right hand on top */}
      <ellipse cx="85" cy="196" rx="22" ry="13" fill={SKIN} />
      {/* Finger details */}
      <path d="M65 196 Q85 207 105 196" stroke="#d4956a" strokeWidth="1.2" fill="none" />
      <path d="M70 191 Q85 195 100 191" stroke="#d4956a" strokeWidth="1" fill="none" />
      <path d="M72 186 Q85 189 98 186" stroke="#d4956a" strokeWidth="0.8" fill="none" />

      {/* ── PLUM BLOSSOMS ── */}
      <Plum cx={60} cy={150} r={7} pr={2.6} />
      <Plum cx={110} cy={165} r={6.5} pr={2.4} />
      <Plum cx={58} cy={222} r={6} pr={2.2} />
      <Plum cx={112} cy={233} r={5.5} pr={2} />

      {/* ── TROUSERS ── */}
      <rect x="54" y="252" width="26" height="114" rx="6" fill={DARK} />
      <rect x="84" y="252" width="26" height="114" rx="6" fill={DARK} />
      <line x1="67" y1="252" x2="67" y2="366" stroke="#111122" strokeWidth="1.2" opacity="0.4" />
      <line x1="97" y1="252" x2="97" y2="366" stroke="#111122" strokeWidth="1.2" opacity="0.4" />

      {/* ── SHOES ── */}
      <path d="M50 362 L80 362 L84 372 L46 372Z" fill={HAIR} />
      <path d="M80 362 L116 362 L120 372 L76 372Z" fill={HAIR} />

      {/* ── NAME ── */}
      <text x="85" y="392" textAnchor="middle" fontSize="20" fontWeight="800" fill={RED} fontFamily="'Noto Serif SC', serif" letterSpacing="5">小龙</text>
      <text x="85" y="404" textAnchor="middle" fontSize="9" fill={DARK} fontFamily="sans-serif" opacity="0.45" letterSpacing="1.5">XIǍO LÓNG</text>
    </svg>
  )
}

export function FemaleCharacter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 410" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">

      {/* ── HAIR BUNS ── */}
      <circle cx="54" cy="40" r="18" fill={HAIR} />
      <circle cx="106" cy="40" r="18" fill={HAIR} />
      {/* Bun highlight */}
      <circle cx="50" cy="36" r="5" fill="#333" opacity="0.5" />
      <circle cx="102" cy="36" r="5" fill="#333" opacity="0.5" />

      {/* Red ribbon bows */}
      <path d="M38 28 L54 42 L46 22Z" fill={RED} />
      <path d="M70 28 L54 42 L62 22Z" fill={RED} />
      <circle cx="54" cy="41" r="5" fill={RED} />
      <path d="M90 28 L106 42 L98 22Z" fill={RED} />
      <path d="M122 28 L106 42 L114 22Z" fill={RED} />
      <circle cx="106" cy="41" r="5" fill={RED} />
      {/* Ribbon tails */}
      <path d="M50 46 L44 58" stroke={RED} strokeWidth="3" strokeLinecap="round" />
      <path d="M58 46 L64 58" stroke={RED} strokeWidth="3" strokeLinecap="round" />
      <path d="M102 46 L96 58" stroke={RED} strokeWidth="3" strokeLinecap="round" />
      <path d="M110 46 L116 58" stroke={RED} strokeWidth="3" strokeLinecap="round" />

      {/* Hair base connecting buns */}
      <path d="M48 60 Q80 44 112 60 Q104 53 80 51 Q56 53 48 60Z" fill={HAIR} />

      {/* ── HEAD ── */}
      <ellipse cx="80" cy="72" rx="28" ry="33" fill={SKIN} />

      {/* Ears */}
      <ellipse cx="52" cy="74" rx="6" ry="8.5" fill={SKIN} />
      <ellipse cx="108" cy="74" rx="6" ry="8.5" fill={SKIN} />
      <ellipse cx="52" cy="74" rx="3" ry="5" fill="#f0b88a" />
      <ellipse cx="108" cy="74" rx="3" ry="5" fill="#f0b88a" />
      {/* Earrings */}
      <circle cx="52" cy="80" r="2.5" fill={GOLD} />
      <circle cx="108" cy="80" r="2.5" fill={GOLD} />

      {/* ── FACE ── */}
      {/* Eyebrows — softer arch */}
      <path d="M60 59 Q70 53 79 58" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M81 58 Q90 53 100 59" stroke={HAIR} strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* Eyes — larger, rounder for feminine look */}
      <path d="M59 67 Q69 59 78 67 Q69 75 59 67Z" fill={HAIR} />
      <path d="M82 67 Q91 59 101 67 Q91 75 82 67Z" fill={HAIR} />
      <circle cx="65" cy="65" r="2.5" fill={WHITE} />
      <circle cx="88" cy="65" r="2.5" fill={WHITE} />

      {/* Lashes */}
      <line x1="59" y1="64" x2="55" y2="59" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="63" y1="62" x2="61" y2="57" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="100" y1="64" x2="104" y2="59" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="96" y1="62" x2="98" y2="57" stroke={HAIR} strokeWidth="1.6" strokeLinecap="round" />

      {/* Nose */}
      <path d="M77 80 Q80 84 83 80" stroke="#d4956a" strokeWidth="1.2" fill="none" strokeLinecap="round" />

      {/* Red lips — full smile */}
      <path d="M67 89 Q80 83 93 89 Q80 99 67 89Z" fill={RED} />
      <path d="M67 89 Q80 97 93 89" stroke="#a02020" strokeWidth="0.8" fill="none" />
      <path d="M67 89 Q80 85 93 89" stroke="#ff6666" strokeWidth="0.6" fill="none" opacity="0.5" />

      {/* Cheek blush */}
      <ellipse cx="60" cy="84" rx="10" ry="6" fill="#f5a080" opacity="0.3" />
      <ellipse cx="100" cy="84" rx="10" ry="6" fill="#f5a080" opacity="0.3" />

      {/* ── NECK ── */}
      <rect x="74" y="103" width="12" height="15" fill={SKIN} />

      {/* ── QIPAO ── */}
      {/* Body — slightly fitted/tapered */}
      <path d="M46 116 L42 268 Q42 276 50 276 L110 276 Q118 276 118 268 L114 116Z" fill={RED} />

      {/* Qipao angled collar (right-side closure) */}
      <path d="M80 120 L80 110 Q87 105 94 110 L98 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 120 L80 110 Q73 105 66 110 L62 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Qipao closure buttons */}
      <circle cx="84" cy="122" r="3.5" fill={GOLD} />
      <circle cx="80" cy="132" r="3.5" fill={GOLD} />
      <circle cx="77" cy="142" r="3.5" fill={GOLD} />

      {/* Gold side trim */}
      <line x1="46" y1="116" x2="42" y2="268" stroke={GOLD} strokeWidth="2.2" />
      <line x1="114" y1="116" x2="118" y2="268" stroke={GOLD} strokeWidth="2.2" />
      {/* Gold hem trim */}
      <line x1="42" y1="272" x2="118" y2="272" stroke={GOLD} strokeWidth="3.5" />

      {/* Hem slit (right side) */}
      <line x1="118" y1="255" x2="118" y2="276" stroke={GOLD} strokeWidth="1.5" />

      {/* ── ARMS ── */}
      {/* Left upper arm */}
      <path d="M46 126 L22 160 L36 169 L54 140Z" fill={RED} />
      {/* Left forearm */}
      <path d="M22 160 L48 196 L63 185 L38 156Z" fill={RED} />
      {/* Right upper arm */}
      <path d="M114 126 L138 160 L124 169 L106 140Z" fill={RED} />
      {/* Right forearm */}
      <path d="M138 160 L112 196 L97 185 L122 156Z" fill={RED} />

      {/* Short sleeve caps */}
      <ellipse cx="44" cy="126" rx="16" ry="8" fill={RED} />
      <ellipse cx="116" cy="126" rx="16" ry="8" fill={RED} />
      <line x1="28" y1="126" x2="60" y2="126" stroke={GOLD} strokeWidth="2.5" />
      <line x1="100" y1="126" x2="132" y2="126" stroke={GOLD} strokeWidth="2.5" />

      {/* Gold cuffs */}
      <ellipse cx="29" cy="164" rx="10" ry="6" fill={GOLD} />
      <ellipse cx="131" cy="164" rx="10" ry="6" fill={GOLD} />

      {/* ── CLASPED HANDS (拱手礼) ── */}
      <ellipse cx="75" cy="200" rx="17" ry="11" fill={SKIN} />
      <ellipse cx="80" cy="194" rx="21" ry="12" fill={SKIN} />
      <path d="M61 194 Q80 205 99 194" stroke="#d4956a" strokeWidth="1.2" fill="none" />
      <path d="M65 189 Q80 193 95 189" stroke="#d4956a" strokeWidth="1" fill="none" />

      {/* ── PLUM BLOSSOMS ── */}
      <Plum cx={55} cy={152} r={7} pr={2.5} />
      <Plum cx={107} cy={166} r={6.5} pr={2.3} />
      <Plum cx={52} cy={228} r={6} pr={2.2} />
      <Plum cx={110} cy={240} r={5.5} pr={2} />
      <Plum cx={80} cy={248} r={5} pr={1.8} />

      {/* ── LEGS ── */}
      <rect x="56" y="276" width="16" height="78" rx="5" fill={SKIN} />
      <rect x="78" y="276" width="16" height="78" rx="5" fill={SKIN} />

      {/* ── RED HEELS ── */}
      {/* Left shoe */}
      <path d="M50 349 L74 349 L74 358 L54 358Z" fill={RED} />
      <path d="M72 352 Q76 358 76 366 L72 366 Q70 358 68 354Z" fill={RED} />
      {/* Right shoe */}
      <path d="M76 349 L100 349 L100 358 L80 358Z" fill={RED} />
      <path d="M98 352 Q102 358 102 366 L98 366 Q96 358 92 354Z" fill={RED} />

      {/* ── NAME ── */}
      <text x="80" y="392" textAnchor="middle" fontSize="20" fontWeight="800" fill={RED} fontFamily="'Noto Serif SC', serif" letterSpacing="5">小凤</text>
      <text x="80" y="404" textAnchor="middle" fontSize="9" fill={DARK} fontFamily="sans-serif" opacity="0.45" letterSpacing="1.5">XIǍO FÈNG</text>
    </svg>
  )
}
