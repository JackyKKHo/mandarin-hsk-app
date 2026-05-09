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

function Male() {
  return (
    <g>
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
      <path d="M85 126 L85 115 Q85 108 91 108 L96 112 L96 126" fill={RED} stroke={GOLD} strokeWidth="2.5" fill-opacity="1" />
      <path d="M85 126 L85 115 Q85 108 79 108 L74 112 L74 126" fill={RED} stroke={GOLD} strokeWidth="2.5" />

      {/* Gold centre seam + buttons */}
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
      <Plum cx={72} cy={210} r={5} pr={2} />

      {/* Trousers */}
      <rect x="59" y="240" width="22" height="108" rx="5" fill={DARK} />
      <rect x="84" y="240" width="22" height="108" rx="5" fill={DARK} />

      {/* Shoes */}
      <ellipse cx="70" cy="351" rx="17" ry="8" fill={HAIR} />
      <ellipse cx="95" cy="351" rx="17" ry="8" fill={HAIR} />

      {/* Name */}
      <text x="85" y="376" textAnchor="middle" fontSize="13" fontWeight="700" fill={DARK} fontFamily="'Noto Serif SC', serif">小明</text>
    </g>
  )
}

function Female() {
  return (
    <g transform="translate(160,0)">
      {/* Hair buns */}
      <circle cx="212" cy="43" r="17" fill={HAIR} />
      <circle cx="258" cy="43" r="17" fill={HAIR} />

      {/* Red ribbons / bows */}
      <path d="M198 33 L212 44 L204 27Z" fill={RED} />
      <path d="M226 33 L212 44 L220 27Z" fill={RED} />
      <circle cx="212" cy="44" r="4" fill={RED} />
      <path d="M244 33 L258 44 L250 27Z" fill={RED} />
      <path d="M272 33 L258 44 L264 27Z" fill={RED} />
      <circle cx="258" cy="44" r="4" fill={RED} />

      {/* Hair base */}
      <path d="M204 62 Q235 42 266 62 Q260 56 235 54 Q210 56 204 62Z" fill={HAIR} />

      {/* Head */}
      <ellipse cx="235" cy="76" rx="31" ry="36" fill={SKIN} />

      {/* Ears */}
      <ellipse cx="204" cy="78" rx="6" ry="8" fill={SKIN} />
      <ellipse cx="266" cy="78" rx="6" ry="8" fill={SKIN} />

      {/* Eyes — slightly larger/softer */}
      <path d="M219 70 Q227 63 234 70 Q227 77 219 70Z" fill={HAIR} />
      <path d="M236 70 Q244 63 251 70 Q244 77 236 70Z" fill={HAIR} />
      <circle cx="224" cy="68" r="2.2" fill="white" />
      <circle cx="241" cy="68" r="2.2" fill="white" />

      {/* Eyelashes */}
      <line x1="219" y1="66" x2="216" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="222" y1="64" x2="221" y2="60" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="236" y1="66" x2="248" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="248" y1="66" x2="252" y2="62" stroke={HAIR} strokeWidth="1.5" strokeLinecap="round" />

      {/* Eyebrows */}
      <path d="M216 62 Q226 56 234 61" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M236 61 Q245 56 254 62" stroke={HAIR} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Red lips */}
      <path d="M224 89 Q235 84 246 89 Q235 97 224 89Z" fill={RED} />
      <path d="M224 89 Q235 95 246 89" stroke="#a02020" strokeWidth="0.5" fill="none" />

      {/* Neck */}
      <rect x="229" y="110" width="12" height="15" fill={SKIN} />

      {/* Qipao body */}
      <path d="M204 120 L204 258 Q204 266 212 266 L258 266 Q266 266 266 258 L266 120Z" fill={RED} />

      {/* Angled qipao collar */}
      <path d="M235 124 L235 112 Q241 107 248 112 L252 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M235 124 L235 112 Q229 107 222 112 L218 120" stroke={GOLD} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Collar buttons */}
      <circle cx="239" cy="124" r="3" fill={GOLD} />
      <circle cx="235" cy="133" r="3" fill={GOLD} />

      {/* Gold side / hem trim */}
      <line x1="204" y1="120" x2="204" y2="258" stroke={GOLD} strokeWidth="2" />
      <line x1="266" y1="120" x2="266" y2="258" stroke={GOLD} strokeWidth="2" />
      <line x1="204" y1="263" x2="266" y2="263" stroke={GOLD} strokeWidth="3" />

      {/* Sleeves */}
      <path d="M204 120 L182 163 L197 171 L210 140Z" fill={RED} />
      <path d="M266 120 L288 163 L273 171 L260 140Z" fill={RED} />

      {/* Gold cuffs */}
      <ellipse cx="189" cy="167" rx="10" ry="6" fill={GOLD} />
      <ellipse cx="281" cy="167" rx="10" ry="6" fill={GOLD} />

      {/* Clasped hands */}
      <ellipse cx="235" cy="188" rx="24" ry="14" fill={SKIN} />
      <path d="M213 188 Q235 200 257 188" stroke="#e0a880" strokeWidth="1" fill="none" />
      <path d="M222 182 Q235 186 248 182" stroke="#e0a880" strokeWidth="1" fill="none" />

      {/* Plum blossoms */}
      <Plum cx={219} cy={152} r={6} pr={2.4} />
      <Plum cx={251} cy={168} r={6} pr={2.4} />
      <Plum cx={222} cy={218} r={5} pr={2} />
      <Plum cx={248} cy={235} r={5} pr={2} />

      {/* Legs */}
      <rect x="218" y="266" width="14" height="72" rx="4" fill={SKIN} />
      <rect x="238" y="266" width="14" height="72" rx="4" fill={SKIN} />

      {/* Red heels */}
      <path d="M212 333 L234 333 L234 341 L216 341Z" fill={RED} />
      <line x1="233" y1="338" x2="233" y2="348" stroke={RED} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M236 333 L258 333 L258 341 L240 341Z" fill={RED} />
      <line x1="257" y1="338" x2="257" y2="348" stroke={RED} strokeWidth="3.5" strokeLinecap="round" />

      {/* Name */}
      <text x="235" y="376" textAnchor="middle" fontSize="13" fontWeight="700" fill={DARK} fontFamily="'Noto Serif SC', serif">小美</text>
    </g>
  )
}

export default function WelcomeCharacters({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 390 385"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <Male />
      <Female />
    </svg>
  )
}
