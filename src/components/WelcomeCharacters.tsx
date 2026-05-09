// Cartoon characters — Chinese traditional dress (reference: flat vector illustration)

const SK  = '#f5c9a0'
const SKS = '#dfa070'
const H   = '#0d0d0d'
const R   = '#c42200'
const RD  = '#8c1800'
const G   = '#e0a200'
const GD  = '#b07800'
const BK  = '#111111'
const W   = '#f2f2f2'
const LP  = '#e03050'
const EY  = '#111111'
const EW  = '#ffffff'

function Plum({ cx, cy, r = 5 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      {[270, 342, 54, 126, 198].map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <circle
            key={i}
            cx={cx + Math.cos(rad) * r * 1.2}
            cy={cy + Math.sin(rad) * r * 1.2}
            r={r * 0.68}
            fill={G}
          />
        )
      })}
      <circle cx={cx} cy={cy} r={r * 0.4} fill={GD} />
    </g>
  )
}

export function MaleCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 510" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

      {/* Shoes */}
      <ellipse cx="83"  cy="468" rx="22" ry="9" fill={BK} />
      <ellipse cx="117" cy="468" rx="22" ry="9" fill={BK} />

      {/* Trousers */}
      <rect x="72"  y="308" width="24" height="163" rx="5" fill={BK} />
      <rect x="104" y="308" width="24" height="163" rx="5" fill={BK} />

      {/* Tang suit — main body */}
      <path d="M55 160 L50 308 L150 308 L145 160 Z" fill={R} />
      {/* Gold hem */}
      <rect x="50" y="295" width="100" height="14" rx="2" fill={G} />
      {/* Center seam */}
      <line x1="100" y1="168" x2="100" y2="295" stroke={RD} strokeWidth="2" opacity="0.5" />

      {/* Left arm (upper) */}
      <path d="M55 163 L33 173 L30 248 L55 242 Z" fill={R} />
      {/* Left forearm (angled inward) */}
      <path d="M30 232 L32 256 L72 270 L68 246 Z" fill={R} />
      {/* Left cuff */}
      <rect x="26" y="242" width="28" height="14" rx="5" fill={G} />

      {/* Right arm (upper) */}
      <path d="M145 163 L167 173 L170 248 L145 242 Z" fill={R} />
      {/* Right forearm */}
      <path d="M170 232 L168 256 L128 270 L132 246 Z" fill={R} />
      {/* Right cuff */}
      <rect x="146" y="242" width="28" height="14" rx="5" fill={G} />

      {/* Clasped hands */}
      <ellipse cx="112" cy="268" rx="17" ry="11" fill={SK} />
      <ellipse cx="88"  cy="265" rx="20" ry="12" fill={SK} />
      <ellipse cx="100" cy="266" rx="14" ry="11" fill={SK} />
      {[87, 93, 99, 105].map(x => (
        <circle key={x} cx={x} cy={258} r="2.4" fill={SKS} opacity="0.4" />
      ))}

      {/* Plum blossoms */}
      <Plum cx={68}  cy={196} r={8} />
      <Plum cx={134} cy={189} r={7} />
      <Plum cx={62}  cy={258} r={6} />
      <Plum cx={138} cy={262} r={6} />
      <Plum cx={72}  cy={286} r={5} />
      <Plum cx={129} cy={285} r={5} />

      {/* Mandarin collar */}
      <path d="M85 148 L88 168 L112 168 L115 148 Z" fill={R} />
      <path d="M85 148 L88 168 L100 168 L100 148 Z" fill={RD} opacity="0.4" />
      <path d="M85 148 Q100 143 115 148" stroke={G} strokeWidth="3"   fill="none" />
      <line x1="88"  y1="168" x2="112" y2="168" stroke={G} strokeWidth="2.5" />
      <line x1="85"  y1="148" x2="88"  y2="168" stroke={G} strokeWidth="2.5" />
      <line x1="115" y1="148" x2="112" y2="168" stroke={G} strokeWidth="2.5" />

      {/* Frog buttons */}
      {[182, 202, 222, 242, 262, 280].map(y => (
        <g key={y}>
          <line x1="92" y1={y} x2="108" y2={y} stroke={G} strokeWidth="1.5" />
          <circle cx="100" cy={y} r="4.5" fill="none" stroke={G} strokeWidth="1.5" />
          <circle cx="100" cy={y} r="2.2" fill={G} />
        </g>
      ))}

      {/* Neck */}
      <rect x="89" y="131" width="22" height="29" rx="4" fill={SK} />

      {/* Ears */}
      <ellipse cx="53"  cy="90" rx="9" ry="11" fill={SK} />
      <ellipse cx="147" cy="90" rx="9" ry="11" fill={SK} />
      <ellipse cx="53"  cy="90" rx="5" ry="7"  fill={SKS} opacity="0.45" />
      <ellipse cx="147" cy="90" rx="5" ry="7"  fill={SKS} opacity="0.45" />

      {/* Head */}
      <ellipse cx="100" cy="84" rx="47" ry="52" fill={SK} />

      {/* Hair — slick back */}
      <path d="M53 78 Q57 27 100 24 Q143 27 147 78 Q133 46 100 44 Q67 46 53 78 Z" fill={H} />
      <path d="M100 24 Q113 33 126 46" stroke="#2a2a2a" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* Eyebrows — thick */}
      <path d="M70 66 Q81 60 92 64"   stroke={H} strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M108 64 Q119 60 130 66" stroke={H} strokeWidth="4" strokeLinecap="round" fill="none" />

      {/* Left eye */}
      <ellipse cx="81"  cy="76" rx="11" ry="7"  fill={EW} />
      <ellipse cx="81"  cy="77" rx="8"  ry="6"  fill={EY} />
      <circle  cx="83"  cy="75" r="2.2"          fill={EW} />
      <path d="M70 74 Q81 68 92 74"   stroke={H} strokeWidth="1.5" fill="none" />

      {/* Right eye */}
      <ellipse cx="119" cy="76" rx="11" ry="7"  fill={EW} />
      <ellipse cx="119" cy="77" rx="8"  ry="6"  fill={EY} />
      <circle  cx="121" cy="75" r="2.2"          fill={EW} />
      <path d="M108 74 Q119 68 130 74" stroke={H} strokeWidth="1.5" fill="none" />

      {/* Nose */}
      <ellipse cx="97"  cy="92" rx="3" ry="2" fill={SKS} opacity="0.6" />
      <ellipse cx="103" cy="92" rx="3" ry="2" fill={SKS} opacity="0.6" />

      {/* Mouth — open smile with teeth */}
      <path d="M82 103 Q100 119 118 103" fill={LP} />
      <path d="M84 106 Q100 115 116 106 Q100 111 84 106 Z" fill={W} />
      <path d="M82 103 Q100 119 118 103" stroke={H} strokeWidth="1.5" fill="none" />
    </svg>
  )
}

export function FemaleCharacter({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 500" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">

      {/* Red heels */}
      <rect x="79"  y="440" width="20" height="9"  rx="3" fill={R} />
      <rect x="101" y="440" width="20" height="9"  rx="3" fill={R} />
      <rect x="80"  y="449" width="5"  height="13" rx="2" fill={R} />
      <rect x="115" y="449" width="5"  height="13" rx="2" fill={R} />

      {/* Bare legs */}
      <rect x="78"  y="363" width="22" height="80" rx="7" fill={SK} />
      <rect x="100" y="363" width="22" height="80" rx="7" fill={SK} />

      {/* Qipao — main body */}
      <path d="M62 153 L58 368 L142 368 L138 153 Z" fill={R} />
      {/* Gold hem */}
      <rect x="58" y="355" width="84" height="14" rx="2" fill={G} />
      {/* Side slit */}
      <path d="M137 326 L141 368 L136 368 L133 326 Z" fill={SK} opacity="0.35" />

      {/* Cap sleeves */}
      <path d="M62 153 L44 154 L42 180 L62 176 Z" fill={R} />
      <path d="M138 153 L156 154 L158 180 L138 176 Z" fill={R} />
      <path d="M44 154 L42 180"  stroke={G} strokeWidth="2.5" fill="none" />
      <path d="M156 154 L158 180" stroke={G} strokeWidth="2.5" fill="none" />
      <line x1="44"  y1="154" x2="62"  y2="153" stroke={G} strokeWidth="2.5" />
      <line x1="138" y1="153" x2="156" y2="154" stroke={G} strokeWidth="2.5" />

      {/* Bare arms */}
      <path d="M62 176 L42 180 L38 248 L62 244 Z" fill={SK} />
      <path d="M38 232 L40 255 L75 267 L70 244 Z" fill={SK} />
      <path d="M138 176 L158 180 L162 248 L138 244 Z" fill={SK} />
      <path d="M162 232 L160 255 L125 267 L130 244 Z" fill={SK} />

      {/* Clasped hands */}
      <ellipse cx="113" cy="264" rx="16" ry="10" fill={SK} />
      <ellipse cx="87"  cy="261" rx="20" ry="11" fill={SK} />
      <ellipse cx="100" cy="262" rx="14" ry="10" fill={SK} />
      {[86, 92, 98, 104].map(x => (
        <circle key={x} cx={x} cy={255} r="2.3" fill={SKS} opacity="0.4" />
      ))}

      {/* Plum blossoms */}
      <Plum cx={74}  cy={198} r={7} />
      <Plum cx={128} cy={192} r={7} />
      <Plum cx={68}  cy={256} r={6} />
      <Plum cx={134} cy={260} r={6} />
      <Plum cx={78}  cy={304} r={5} />
      <Plum cx={122} cy={307} r={5} />
      <Plum cx={100} cy={332} r={5} />

      {/* Qipao collar — diagonal */}
      <path d="M86 143 L88 165 L100 167 L100 143 Z" fill={RD} opacity="0.5" />
      <path d="M100 143 L116 139 L118 165 L100 167 Z" fill={R} />
      <path d="M86 143 Q93 139 116 139" stroke={G} strokeWidth="2.5" fill="none" />
      <line x1="88"  y1="165" x2="118" y2="165" stroke={G} strokeWidth="2" />
      <line x1="86"  y1="143" x2="88"  y2="165" stroke={G} strokeWidth="2.5" />
      <line x1="116" y1="139" x2="118" y2="165" stroke={G} strokeWidth="2.5" />
      <circle cx="108" cy="152" r="4.5" fill="none" stroke={G} strokeWidth="1.5" />
      <circle cx="108" cy="152" r="2"   fill={G} />
      <line x1="100" y1="152" x2="116" y2="152" stroke={G} strokeWidth="1.5" />

      {/* Neck */}
      <rect x="90" y="127" width="20" height="25" rx="4" fill={SK} />

      {/* Earrings */}
      <circle cx="54"  cy="97" r="5" fill={G} />
      <circle cx="146" cy="97" r="5" fill={G} />

      {/* Ears */}
      <ellipse cx="55"  cy="87" rx="8" ry="10" fill={SK} />
      <ellipse cx="145" cy="87" rx="8" ry="10" fill={SK} />
      <ellipse cx="55"  cy="87" rx="4" ry="6"  fill={SKS} opacity="0.45" />
      <ellipse cx="145" cy="87" rx="4" ry="6"  fill={SKS} opacity="0.45" />

      {/* Head */}
      <ellipse cx="100" cy="80" rx="45" ry="50" fill={SK} />

      {/* Hair base + side strands */}
      <path d="M55 73 Q58 31 100 27 Q142 31 145 73 Q131 49 100 47 Q69 49 55 73 Z" fill={H} />
      <path d="M55 73 Q51 86 54 103" stroke={H} strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M145 73 Q149 86 146 103" stroke={H} strokeWidth="10" fill="none" strokeLinecap="round" />
      {/* Fringe */}
      <path d="M67 57 Q100 49 133 57 Q118 51 100 49 Q82 51 67 57 Z" fill={H} />

      {/* Left bun */}
      <circle cx="75" cy="32" r="15" fill={H} />
      <path d="M69 46 L64 56 L70 54 L75 47 L80 54 L86 56 L81 46 Z" fill={R} />
      <path d="M69 56 Q64 73 66 92" stroke={R} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M81 56 Q86 73 84 92" stroke={R} strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* Right bun */}
      <circle cx="125" cy="32" r="15" fill={H} />
      <path d="M119 46 L114 56 L120 54 L125 47 L130 54 L136 56 L131 46 Z" fill={R} />
      <path d="M119 56 Q114 73 116 92" stroke={R} strokeWidth="4.5" fill="none" strokeLinecap="round" />
      <path d="M131 56 Q136 73 134 92" stroke={R} strokeWidth="4.5" fill="none" strokeLinecap="round" />

      {/* Eyebrows — thinner */}
      <path d="M72 66 Q82 62 91 65"   stroke={H} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M109 65 Q118 62 128 66" stroke={H} strokeWidth="2.5" strokeLinecap="round" fill="none" />

      {/* Left eye + lashes */}
      <ellipse cx="81"  cy="75" rx="11" ry="7.5" fill={EW} />
      <ellipse cx="81"  cy="76" rx="8"  ry="6.5" fill={EY} />
      <circle  cx="83"  cy="74" r="2.2"           fill={EW} />
      <path d="M70 73 Q81 67 92 73" stroke={H} strokeWidth="1.5" fill="none" />
      {([[73,72,70,68],[78,70,76,66],[84,68,83,64],[90,70,91,67]] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={H} strokeWidth="1.2" />
      ))}

      {/* Right eye + lashes */}
      <ellipse cx="119" cy="75" rx="11" ry="7.5" fill={EW} />
      <ellipse cx="119" cy="76" rx="8"  ry="6.5" fill={EY} />
      <circle  cx="121" cy="74" r="2.2"           fill={EW} />
      <path d="M108 73 Q119 67 130 73" stroke={H} strokeWidth="1.5" fill="none" />
      {([[110,72,107,68],[115,70,114,66],[121,68,120,64],[127,70,129,67]] as [number,number,number,number][]).map(([x1,y1,x2,y2],i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={H} strokeWidth="1.2" />
      ))}

      {/* Nose */}
      <ellipse cx="97"  cy="89" rx="2.5" ry="2" fill={SKS} opacity="0.6" />
      <ellipse cx="103" cy="89" rx="2.5" ry="2" fill={SKS} opacity="0.6" />

      {/* Lips */}
      <path d="M86 100 Q100 113 114 100" fill={LP} />
      <path d="M86 100 Q93 96 100 98 Q107 96 114 100 Q100 97 86 100 Z" fill={LP} />
      <path d="M88 102 Q100 110 112 102 Q100 107 88 102 Z" fill={W} />
      <path d="M86 100 Q100 113 114 100" stroke={H} strokeWidth="1.2" fill="none" />
    </svg>
  )
}
