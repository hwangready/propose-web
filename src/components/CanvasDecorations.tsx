import { motion } from 'framer-motion';

interface Item {
  type: string; left: string; top: string; size: number;
  opacity: number; rotate: number; dur: number; delay: number;
}

const ITEMS: Item[] = [
  // Row 0 — Hero (0-100vw, 0-100vh)
  { type: 'ghost',    left: '4vw',   top: '76vh',  size: 44, opacity: 0.14, rotate: -8,  dur: 3.2, delay: 0   },
  { type: 'sparkle',  left: '90vw',  top: '7vh',   size: 22, opacity: 0.20, rotate: 20,  dur: 2.4, delay: 0.3 },
  { type: 'heart',    left: '85vw',  top: '80vh',  size: 32, opacity: 0.15, rotate: 12,  dur: 2.9, delay: 0.6 },
  // Row 0 — Meeting (100-200vw, 0-100vh)
  { type: 'star',     left: '110vw', top: '6vh',   size: 36, opacity: 0.17, rotate: -5,  dur: 3.4, delay: 0.2 },
  { type: 'cloud',    left: '182vw', top: '14vh',  size: 52, opacity: 0.11, rotate: 0,   dur: 4.0, delay: 0.8 },
  { type: 'heart',    left: '194vw', top: '82vh',  size: 28, opacity: 0.18, rotate: -15, dur: 2.6, delay: 0.5 },
  // Row 0 — Dating (200-300vw, 0-100vh)
  { type: 'sparkle',  left: '256vw', top: '9vh',   size: 20, opacity: 0.20, rotate: 30,  dur: 2.2, delay: 0.4 },
  { type: 'ghost',    left: '287vw', top: '75vh',  size: 40, opacity: 0.13, rotate: 8,   dur: 3.6, delay: 0.7 },
  { type: 'star',     left: '214vw', top: '84vh',  size: 28, opacity: 0.16, rotate: -20, dur: 2.7, delay: 0.1 },

  // Row 1 — Travel (0-100vw, 100-200vh)
  { type: 'phone',    left: '6vw',   top: '118vh', size: 48, opacity: 0.13, rotate: 10,  dur: 3.1, delay: 0.3 },
  { type: 'star',     left: '90vw',  top: '108vh', size: 30, opacity: 0.16, rotate: -18, dur: 2.7, delay: 0   },
  // Row 1 — Memories (100-200vw, 100-200vh)
  { type: 'cloud',    left: '114vw', top: '186vh', size: 56, opacity: 0.10, rotate: 0,   dur: 4.2, delay: 1.0 },
  { type: 'sparkle',  left: '148vw', top: '106vh', size: 24, opacity: 0.18, rotate: 45,  dur: 2.3, delay: 0.6 },
  // Row 1 — FirstTrip (200-300vw, 100-200vh)
  { type: 'frame',    left: '204vw', top: '122vh', size: 50, opacity: 0.13, rotate: -6,  dur: 3.3, delay: 0.2 },
  { type: 'heart',    left: '287vw', top: '183vh', size: 34, opacity: 0.16, rotate: 20,  dur: 2.8, delay: 0.9 },
  { type: 'sparkle',  left: '242vw', top: '108vh', size: 22, opacity: 0.19, rotate: -22, dur: 2.5, delay: 0.5 },

  // Row 2 — Daily (0-100vw, 200-300vh)
  { type: 'magazine', left: '5vw',   top: '278vh', size: 56, opacity: 0.12, rotate: 15,  dur: 3.5, delay: 0.4 },
  { type: 'ghost',    left: '88vw',  top: '208vh', size: 42, opacity: 0.14, rotate: -10, dur: 3.0, delay: 0.1 },
  // Row 2 — Together (100-200vw, 200-300vh)
  { type: 'star',     left: '156vw', top: '286vh', size: 28, opacity: 0.17, rotate: 8,   dur: 2.5, delay: 0.7 },
  { type: 'sparkle',  left: '196vw', top: '205vh', size: 26, opacity: 0.19, rotate: -30, dur: 2.6, delay: 0.3 },
  // Row 2 — Climax (200-300vw, 200-300vh)
  { type: 'heart',    left: '252vw', top: '278vh', size: 36, opacity: 0.14, rotate: -12, dur: 2.9, delay: 0.5 },
  { type: 'cloud',    left: '288vw', top: '212vh', size: 50, opacity: 0.10, rotate: 0,   dur: 4.1, delay: 0.8 },
  { type: 'star',     left: '220vw', top: '260vh', size: 24, opacity: 0.15, rotate: 35,  dur: 2.8, delay: 0.2 },

  // Row 3 — Finale (0-100vw, 300-400vh)
  { type: 'frame',    left: '7vw',   top: '386vh', size: 54, opacity: 0.13, rotate: 6,   dur: 3.4, delay: 0.6 },
  { type: 'phone',    left: '88vw',  top: '318vh', size: 44, opacity: 0.12, rotate: -8,  dur: 3.2, delay: 0.2 },
  // Row 3 — Promise (100-200vw, 300-400vh)
  { type: 'sparkle',  left: '152vw', top: '308vh', size: 22, opacity: 0.20, rotate: 15,  dur: 2.3, delay: 0   },
  { type: 'heart',    left: '190vw', top: '382vh', size: 30, opacity: 0.16, rotate: -8,  dur: 2.7, delay: 0.5 },
  // Row 3 — Future (200-300vw, 300-400vh)
  { type: 'ghost',    left: '196vw', top: '384vh', size: 46, opacity: 0.13, rotate: 12,  dur: 3.7, delay: 0.9 },
  { type: 'magazine', left: '244vw', top: '310vh', size: 52, opacity: 0.11, rotate: -14, dur: 3.5, delay: 0.4 },
  { type: 'star',     left: '290vw', top: '378vh', size: 32, opacity: 0.16, rotate: -5,  dur: 2.7, delay: 0.7 },
];

function StickerSVG({ type, size }: { type: string; size: number }) {
  const s = { width: size, height: size, display: 'block' as const, overflow: 'visible' as const };
  switch (type) {
    case 'ghost': return (
      <svg viewBox="0 0 48 52" style={s}>
        <path d="M8,30 Q8,6 24,6 Q40,6 40,30 L40,48 Q34,41 29,47 Q24,41 19,47 Q14,41 8,48 Z" fill="rgba(255,255,255,0.85)" />
        <circle cx="18" cy="26" r="3.5" fill="#2a2a2a" />
        <circle cx="30" cy="26" r="3.5" fill="#2a2a2a" />
        <circle cx="19.5" cy="24.5" r="1.2" fill="#fff" />
        <circle cx="31.5" cy="24.5" r="1.2" fill="#fff" />
      </svg>
    );
    case 'heart': return (
      <svg viewBox="0 0 48 44" style={{ ...s, height: size * 0.92 }}>
        <path d="M24,40 L6,22 Q2,10 14,8 Q20,8 24,16 Q28,8 34,8 Q46,10 42,22 Z" fill="#e05c7a" />
      </svg>
    );
    case 'star': return (
      <svg viewBox="0 0 48 46" style={{ ...s, height: size * 0.96 }}>
        <polygon points="24,3 29,17 44,17 32,26 37,41 24,32 11,41 16,26 4,17 19,17" fill="#f4c842" />
      </svg>
    );
    case 'sparkle': return (
      <svg viewBox="0 0 48 48" style={s}>
        <path d="M24,2 L26.5,21.5 L46,24 L26.5,26.5 L24,46 L21.5,26.5 L2,24 L21.5,21.5 Z" fill="#a8e6cf" />
        <circle cx="24" cy="24" r="3" fill="rgba(168,230,207,0.6)" />
      </svg>
    );
    case 'cloud': return (
      <svg viewBox="0 0 72 44" style={{ ...s, width: size * 1.5, height: size }}>
        <ellipse cx="22" cy="32" rx="18" ry="13" fill="rgba(255,255,255,0.78)" />
        <ellipse cx="36" cy="24" rx="22" ry="18" fill="rgba(255,255,255,0.78)" />
        <ellipse cx="52" cy="32" rx="16" ry="12" fill="rgba(255,255,255,0.78)" />
        <rect x="4" y="32" width="64" height="12" fill="rgba(255,255,255,0.78)" />
      </svg>
    );
    case 'phone': return (
      <svg viewBox="0 0 32 54" style={{ ...s, width: size * 0.59, height: size }}>
        <rect x="2" y="2" width="28" height="50" rx="7" fill="none" stroke="#5dcaa5" strokeWidth="2.5" />
        <rect x="7" y="10" width="18" height="28" rx="2" fill="rgba(93,202,165,0.12)" stroke="rgba(93,202,165,0.3)" strokeWidth="0.8" />
        <circle cx="16" cy="46" r="2.5" fill="none" stroke="#5dcaa5" strokeWidth="1.5" />
        <rect x="11" y="5" width="6" height="2" rx="1" fill="rgba(93,202,165,0.4)" />
      </svg>
    );
    case 'frame': return (
      <svg viewBox="0 0 52 44" style={{ ...s, width: size * 1.18, height: size }}>
        <rect x="2" y="2" width="48" height="40" rx="5" fill="none" stroke="#e8a4b8" strokeWidth="3" />
        <rect x="9" y="9" width="34" height="26" rx="2" fill="rgba(232,164,184,0.08)" stroke="#e8a4b8" strokeWidth="1.2" />
        <path d="M26,28 L19,22 Q17,17 21,16 Q24,16 26,20 Q28,16 31,16 Q35,17 33,22 Z" fill="#e8a4b8" opacity="0.75" />
      </svg>
    );
    case 'magazine': return (
      <svg viewBox="0 0 40 54" style={{ ...s, width: size * 0.74, height: size }}>
        <rect x="2" y="2" width="36" height="50" rx="5" fill="none" stroke="#7db8a0" strokeWidth="2.5" />
        <rect x="7" y="10" width="26" height="18" rx="2" fill="rgba(125,184,160,0.12)" stroke="rgba(125,184,160,0.3)" strokeWidth="0.8" />
        <line x1="7" y1="34" x2="33" y2="34" stroke="#7db8a0" strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />
        <line x1="7" y1="40" x2="26" y2="40" stroke="#7db8a0" strokeWidth="1.8" strokeLinecap="round" opacity="0.38" />
        <line x1="7" y1="46" x2="20" y2="46" stroke="#7db8a0" strokeWidth="1.8" strokeLinecap="round" opacity="0.25" />
      </svg>
    );
    default: return null;
  }
}

export default function CanvasDecorations() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -(item.size * 0.14), 0] }}
          transition={{
            duration: item.dur, repeat: Infinity,
            ease: 'easeInOut', repeatType: 'mirror', delay: item.delay,
          }}
          style={{
            position: 'absolute', left: item.left, top: item.top,
            transform: `rotate(${item.rotate}deg)`,
            opacity: item.opacity,
            pointerEvents: 'none', userSelect: 'none', zIndex: 0,
          }}
        >
          <StickerSVG type={item.type} size={item.size} />
        </motion.div>
      ))}
    </>
  );
}
