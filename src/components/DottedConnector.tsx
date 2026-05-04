import { motion } from 'framer-motion'

type Variant = 'a' | 'b' | 'c' | 'd' | 'e'

const CONFIGS: Record<Variant, { path: string; circles: {cx:number;cy:number}[]; heart: {x:number;y:number} }> = {
  a: { path: 'M 950 18 C 820 55 620 35 460 78 S 280 118 140 108', circles: [{cx:950,cy:18},{cx:550,cy:62},{cx:140,cy:108}], heart:{x:530,y:40} },
  b: { path: 'M 140 20 C 300 80 580 18 740 76 S 940 128 1000 112', circles: [{cx:140,cy:20},{cx:540,cy:52},{cx:1000,cy:112}], heart:{x:380,y:82} },
  c: { path: 'M 180 16 C 340 100 680 16 900 108', circles: [{cx:180,cy:16},{cx:540,cy:68},{cx:900,cy:108}], heart:{x:700,y:40} },
  d: { path: 'M 550 14 C 340 88 780 88 550 122', circles: [{cx:550,cy:14},{cx:360,cy:82},{cx:760,cy:82}], heart:{x:440,y:106} },
  e: { path: 'M 280 14 Q 550 126 820 102', circles: [{cx:280,cy:14},{cx:555,cy:102},{cx:820,cy:102}], heart:{x:620,y:125} },
}

export default function DottedConnector({ variant }: { variant: Variant }) {
  const cfg = CONFIGS[variant]
  return (
    <svg viewBox="0 0 1100 140" width="100%" height={140} style={{ display: 'block', overflow: 'visible' }}>
      {/* path가 스스로 그려짐 */}
      <motion.path
        d={cfg.path}
        stroke="#7db8a0" strokeWidth={2} strokeDasharray="9 6" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 1.6, ease: 'easeInOut' }}
      />
      {/* 원형 포인트 — 순서대로 등장 */}
      {cfg.circles.map((c, i) => (
        <motion.circle key={i} cx={c.cx} cy={c.cy} r={4} fill="#9ecfba"
          initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.5 + i * 0.25, type: 'spring', stiffness: 300 }}
        />
      ))}
      {/* 하트 — 바운스 */}
      <motion.text x={cfg.heart.x} y={cfg.heart.y} textAnchor="middle" fontSize={18} fill="#e05c7a"
        style={{ fontFamily: 'serif' }}
        initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 1.2, type: 'spring', stiffness: 400, damping: 12 }}
      >♡</motion.text>
    </svg>
  )
}
