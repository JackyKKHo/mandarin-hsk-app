const SKIN = '#f7c9a0'
const RED  = '#c0392b'
const GOLD = '#d4a017'
const HAIR = '#1a1a1a'
const DARK = '#23233a'

function Plum({ cx, cy, r = 7, pr = 2.8 }: { cx: number; cy: number; r?: number; pr?: number }) {
  const pts = [0, 72, 144, 216, 288].map(deg => {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
  })
  return (
    <g opacity="0.85">
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={pr} fill={GOLD} />)}
      <circle cx={cx} cy={cy} r={pr * 0.7} fill={GOLD} />
    </g>
  )
}

export function MaleCharacter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 170 385" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Hair */}
      <path d="M53 72 Q53 30 85 28 Q117 30 117 72 Q110 52 85 50 Q60 52 53 72Z" fill={HAIR} />
      {/* Head */}
      <ellipse cx="85" cy="76" rx="32" ry="37" fill={SKIN} />
      {/* Ears */}
      <ellipse cx="53" cy="79" rx="7" ry="9" fill={SKIN} />
      <ellipse cx="117" cy="79" rx="7" ry="9" fill={SKIN} />
      {/* Eyes */}
      <path d="M69 70 Q76 64 83 70 Q76 76 69 70Z" fill={HAIR} />
      <path d="M87 70 Q94 64 101 70 Q94 76 87 70Z" fill={HAIR} />
      <circle cx="74" cy="68" r="2" fill="white" />
      <circle cx="92" cy="68" r="2" fill="white" />
      {/* Eyebrows */}
      <path d="M67 62 Q76 57 84 61" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M86 61 Q94 57 103 62" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M72 89 Q85 100 98 89" stroke={HAIR} strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M72 89 Q85 98 98 89 Q85 93 72 89Z" fill="white" opacity="0.7" />
      {/* Neck */}
      <rect x="79" y="110" width="12" height="16" fill={SKIN} />
      {/* Tang suit body */}
      <path d="M52 122 L52 240 L118 240 L118 122Z" fill={RED} />
      {/* Collar */}
      <path d="M85 126 L85 115 Q85 108 91 108 L96 112 L96 126" fill={RED} stroke={GOLD} strokeWidth="2.5" />
      <path d="M85 126 L85 115 Q85 108 79 108 L74 112 L74 126" fill={RED} stroke={GOLD} strokeWidth="2.5" />
      {/* Gold centre + buttons */}
      <line x1="85" y1="126" x2="85" y2="240" stroke={GOLD} strokeWidth="1.5" opacity="0.6" />
      {[131, 142, 153, 164, 175, 186, 197].map(y => (
        <circle key={y} cx="85" cy={y} r="3" fill={GOLD} />
      ))}
      {/* Gold side trim */}
      <line x1="52" y1="122" x2="52" y2="240" stroke={GOLD} strokeWidth="2" />
      <line x1="118" y1="122" x2="118" y2="240" stroke={GOLD} strokeWidth="2" />
      {/* Sleeves */}
      <path d="M52 122 L28 168 L44 176 L60 138Z" fill={RED} />
      <path d="M118 122 L142 168 L126 176 L110 138Z" fill={RED} />
      {/* Gold cuffs */}
      <ellipse cx="36" cy="172" rx="11" ry="6" fill={GOLD} />
      <ellipse cx="134" cy="172" rx="11" ry="6" fill={GOLD} />
      {/* Clasped hands */}
      <ellipse cx="85" cy="196" rx="26" ry="15" fill={SKIN} />
      <path d="M62 196 Q85 208 108 196" stroke="#e0a880" strokeWidth="1" fill="none" />
      <path d="M72 190 Q85 194 98 190" stroke="#e0a880" strokeWidth="1" fill="none" />
      {/* Plum blossoms */}
      <Plum cx={67} cy={155} r={6} pr={2.4} />
      <Plum cx={103} cy={168} r={6} pr={2.4} />
      <Plum cx={72} cy={215} r={5} pr={2} />
      {/* Trousers */}
      <rect x="59" y="240" width="22" height="108" rx="5" fill={DARK} />
      <rect x="84" y="240" width="22" height="108" rx="5" fill={DARK} />
      {/* Shoes */}
      <ellipse cx="70" cy="351" rx="17" ry="8" fill={HAIR} />
      <ellipse cx="95" cy="351" rx="17" ry="8" fill={HAIR} />
      {/* Name */}
      <text x="85" y="372" textAnchor="middle" fontSize="18" fontWeight="800" fill={RED} fontFamily="'Noto Serif SC', serif" letterSpacing="4">小龙</text>
      <text x="85" y="384" textAnchor="middle" fontSize="9" fontWeight="500" fill={DARK} fontFamily="sans-serif" opacity="0.5" letterSpacing="1">XIǍO LÓNG</text>
    </svg>
  )
}

export function FemaleCharacter({ className }: { className?: string }) {
  // All coords centred at x=80 in a 160-wide space
  return (
    <svg viewBox="0 0 170 385" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {/* Hair buns */}
      <circle cx="57" cy="43" r="17" fill={HAIR} />
      <circle cx="103" cy="43" r="17" fill={HAIR} />
      {/* Red ribbons */}
      <path d="M43 33 L57 44 L49 27Z" fill={RED} />
      <path d="M71 33 L57 44 L65 27Z" fill={RED} />
      <circle cx="57" cy="44" r="4" fill={RED} />
      <path d="M89 33 L103 44 L95 27Z" fill={RED} />
      <path d="M117 33 L103 44 L109 27Z" fill={RED} />
      <circle cx="103" cy="44" r="4" fill={RED} />
      {/* Hair base */}
      <path d="M49 62 Q80 42 111 62 Q105 56 80 54 Q55 56 49 62Z" fill={HAIR} />
      {/* Head */}
      <ellipse cx="80" cy="76" rx="31" ry="36" fill={SKIN} />
      {/* Ears */}
      <ellipse cx="49" cy="78" rx="6" ry="8" fill={SKIN} />
      <ellipse cx="111" cy="78" rx="6" ry="8" fill={SKIN} />
      {/* Eyes */}
      <path d="M64 70 Q72 63 79 70 Q72 77 64 70Z" fill={HAIR} />
      <path d="M81 70 Q89 63 96 70 Q89 77 81 70Z" fill={HAIR} />
      <circle cx="69" cy="68" r="2.2" fill="white" />
      <circle cx="86" cy="68" r="2.2" fill="white" />
      {/* Lashes */}
      <line x1="64" y1="66" x2="61" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="67" y1="64" x2="66" y2="60" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="93" y1="66" x2="97" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="96" y1="66" x2="100" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      {/* Eyebrows */}
      <path d="M61 62 Q71 56 79 61" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M81 61 Q90 56 99 62" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Lips */}
      <path d="M69 89 Q80 84 91 89 Q80 97 69 89Z" fill={RED} />
      <path d="M69 89 Q80 95 91 89" stroke="#a02020" strokeWidth="0.5" fill="none" />
      {/* Neck */}
      <rect x="74" y="110" width="12" height="15" fill={SKIN} />
      {/* Qipao body */}
      <path d="M49 120 L49 258 Q49 266 57 266 L103 266 Q111 266 111 258 L111 120Z" fill={RED} />
      {/* Collar */}
      <path d="M80 124 L80 112 Q86 107 93 112 L97 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M80 124 L80 112 Q74 107 67 112 L63 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Collar buttons */}
      <circle cx="84" cy="124" r="3" fill={GOLD} />
      <circle cx="80" cy="133" r="3" fill={GOLD} />
      {/* Side + hem trim */}
      <line x1="49" y1="120" x2="49" y2="258" stroke={GOLD} strokeWidth="2" />
      <line x1="111" y1="120" x2="111" y2="258" stroke={GOLD} strokeWidth="2" />
      <line x1="49" y1="263" x2="111" y2="263" stroke={GOLD} strokeWidth="3" />
      {/* Sleeves */}
      <path d="M49 120 L27 163 L42 171 L55 140Z" fill={RED} />
      <path d="M111 120 L133 163 L118 171 L105 140Z" fill={RED} />
      {/* Cuffs */}
      <ellipse cx="34" cy="167" rx="10" ry="6" fill={GOLD} />
      <ellipse cx="126" cy="167" rx="10" ry="6" fill={GOLD} />
      {/* Clasped hands */}
      <ellipse cx="80" cy="188" rx="24" ry="14" fill={SKIN} />
      <path d="M58 188 Q80 200 102 188" stroke="#e0a880" strokeWidth="1" fill="none" />
      <path d="M67 182 Q80 186 93 182" stroke="#e0a880" strokeWidth="1" fill="none" />
      {/* Plum blossoms */}
      <Plum cx={64} cy={152} r={6} pr={2.4} />
      <Plum cx={96} cy={168} r={6} pr={2.4} />
      <Plum cx={67} cy={218} r={5} pr={2} />
      <Plum cx={93} cy={235} r={5} pr={2} />
      {/* Legs */}
      <rect x="63" y="266" width="14" height="72" rx="4" fill={SKIN} />
      <rect x="83" y="266" width="14" height="72" rx="4" fill={SKIN} />
      {/* Red heels */}
      <path d="M57 333 L79 333 L79 341 L61 341Z" fill={RED} />
      <line x1="78" y1="338" x2="78" y2="348" stroke={RED} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M81 333 L103 333 L103 341 L85 341Z" fill={RED} />
      <line x1="102" y1="338" x2="102" y2="348" stroke={RED} strokeWidth="3.5" strokeLinecap="round" />
      {/* Name */}
      <text x="80" y="372" textAnchor="middle" fontSize="18" fontWeight="800" fill={RED} fontFamily="'Noto Serif SC', serif" letterSpacing="4">小凤</text>
      <text x="80" y="384" textAnchor="middle" fontSize="9" fontWeight="500" fill={DARK} fontFamily="sans-serif" opacity="0.5" letterSpacing="1">XIǍO FÈNG</text>
    </svg>
  )
}
