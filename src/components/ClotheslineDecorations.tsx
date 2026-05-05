import { motion } from 'framer-motion';

function DecoSVG({ type, size }: { type: string; size: number }) {
  const s = { width: size, height: size, display: 'block' as const };

  switch (type) {
    case 'flower': return (
      <svg viewBox="0 0 48 48" style={s}>
        <circle cx="24" cy="14" r="10" fill="#e8b4c8" opacity="0.92" />
        <circle cx="24" cy="34" r="10" fill="#e8b4c8" opacity="0.92" />
        <circle cx="14" cy="24" r="10" fill="#f0c4d4" opacity="0.9" />
        <circle cx="34" cy="24" r="10" fill="#f0c4d4" opacity="0.9" />
        <circle cx="24" cy="24" r="7"  fill="#f8e0ea" />
        <circle cx="24" cy="24" r="3"  fill="#f4c842" />
      </svg>
    );
    case 'camera': return (
      <svg viewBox="0 0 52 42" style={{ ...s, height: size * 0.81 }}>
        <rect x="2" y="10" width="48" height="30" rx="5"
          fill="none" stroke="#c8905a" strokeWidth="2.5" />
        <circle cx="26" cy="25" r="9"
          fill="none" stroke="#c8905a" strokeWidth="2" />
        <circle cx="26" cy="25" r="5"
          fill="rgba(200,144,90,0.22)" />
        <rect x="16" y="4" width="12" height="8" rx="2"
          fill="none" stroke="#c8905a" strokeWidth="2" />
        <circle cx="41" cy="16" r="2.5"
          fill="#c8905a" opacity="0.6" />
        <rect x="4" y="18" width="6" height="4" rx="1"
          fill="rgba(200,144,90,0.35)" />
      </svg>
    );
    case 'music': return (
      <svg viewBox="0 0 44 52" style={s}>
        <line x1="16" y1="8" x2="16" y2="36"
          stroke="#9ecfba" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="4" x2="30" y2="32"
          stroke="#9ecfba" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="8" x2="30" y2="4"
          stroke="#9ecfba" strokeWidth="2" />
        <ellipse cx="12" cy="37" rx="5.5" ry="4"
          fill="#9ecfba" transform="rotate(-15,12,37)" />
        <ellipse cx="26" cy="33" rx="5.5" ry="4"
          fill="#9ecfba" transform="rotate(-15,26,33)" />
      </svg>
    );
    case 'ribbon': return (
      <svg viewBox="0 0 56 36" style={{ ...s, width: size * 1.56 }}>
        <path d="M 8,4 Q 28,18 48,4 L 50,10 Q 30,22 28,18 Q 26,22 6,10 Z"
          fill="#e05c7a" opacity="0.85" />
        <path d="M 8,32 Q 28,18 48,32 L 50,26 Q 30,14 28,18 Q 26,14 6,26 Z"
          fill="#e87a90" opacity="0.85" />
        <circle cx="28" cy="18" r="5" fill="#f47890" />
        <circle cx="28" cy="18" r="2.5" fill="#c04060" />
      </svg>
    );
    case 'star-bright': return (
      <svg viewBox="0 0 48 48" style={s}>
        <polygon points="24,3 29,18 44,18 33,27 37,42 24,33 11,42 15,27 4,18 19,18"
          fill="#f4c842" opacity="0.92" />
        <line x1="24" y1="0" x2="24" y2="7" stroke="#f9df80" strokeWidth="1.5" opacity="0.6" />
        <line x1="24" y1="41" x2="24" y2="48" stroke="#f9df80" strokeWidth="1.5" opacity="0.6" />
        <line x1="0" y1="24" x2="7" y2="24" stroke="#f9df80" strokeWidth="1.5" opacity="0.6" />
        <line x1="41" y1="24" x2="48" y2="24" stroke="#f9df80" strokeWidth="1.5" opacity="0.6" />
      </svg>
    );
    case 'leaf': return (
      <svg viewBox="0 0 36 52" style={{ ...s, width: size * 0.69 }}>
        <path d="M 18,48 Q 2,28 6,12 Q 14,2 18,8 Q 22,2 30,12 Q 34,28 18,48 Z"
          fill="#5a9a70" opacity="0.82" />
        <path d="M 18,48 Q 18,28 18,8"
          fill="none" stroke="#3a7a50" strokeWidth="1.2" opacity="0.55" />
        <path d="M 18,34 Q 10,28 6,22"
          fill="none" stroke="#3a7a50" strokeWidth="0.8" opacity="0.45" />
        <path d="M 18,34 Q 26,28 30,22"
          fill="none" stroke="#3a7a50" strokeWidth="0.8" opacity="0.45" />
      </svg>
    );
    case 'double-heart': return (
      <svg viewBox="0 0 60 44" style={{ ...s, width: size * 1.36 }}>
        <path d="M 15,38 L 2,22 Q -1,11 8,9 Q 13,9 15,17 Q 17,9 22,9 Q 31,11 28,22 Z"
          fill="#e05c7a" opacity="0.68" />
        <path d="M 40,38 L 27,22 Q 24,11 33,9 Q 38,9 40,17 Q 42,9 47,9 Q 56,11 53,22 Z"
          fill="#e87a90" opacity="0.85" />
      </svg>
    );
    default: return null;
  }
}

// clothesline 전체 영역(100vw × 4*ROW_HEIGHT)에 분산 배치
// ROW_HEIGHT=380px 기준, vh 단위로 환산: 380px ≈ 40vh
const ITEMS = [
  // --- Row 0 (0 ~ 40vh) ---
  { type: 'flower',       left:  '3%',  top:  '2vh', size: 36, opacity: 0.22, rotate: -10, dur: 3.2, delay: 0   },
  { type: 'star-bright',  left: '92%',  top:  '4vh', size: 22, opacity: 0.24, rotate:  20, dur: 2.4, delay: 0.3 },
  { type: 'music',        left: '88%',  top: '34vh', size: 30, opacity: 0.20, rotate:  15, dur: 2.8, delay: 0.5 },
  { type: 'ribbon',       left: '48%',  top:  '1vh', size: 28, opacity: 0.18, rotate:  -5, dur: 3.4, delay: 0.2 },
  { type: 'leaf',         left: '70%',  top: '30vh', size: 42, opacity: 0.16, rotate:   8, dur: 4.0, delay: 0.8 },
  // --- Row 1 (40 ~ 80vh) ---
  { type: 'double-heart', left:  '6%',  top: '48vh', size: 30, opacity: 0.20, rotate: -12, dur: 2.6, delay: 0.4 },
  { type: 'camera',       left: '90%',  top: '52vh', size: 38, opacity: 0.17, rotate:  -8, dur: 3.6, delay: 0.7 },
  { type: 'flower',       left: '40%',  top: '70vh', size: 28, opacity: 0.19, rotate:  22, dur: 2.7, delay: 0.1 },
  { type: 'star-bright',  left: '18%',  top: '75vh', size: 20, opacity: 0.23, rotate: -18, dur: 2.3, delay: 0.6 },
  { type: 'leaf',         left: '75%',  top: '44vh', size: 44, opacity: 0.15, rotate:  12, dur: 3.1, delay: 0.3 },
  // --- Row 2 (80 ~ 120vh) ---
  { type: 'music',        left:  '5%',  top: '96vh', size: 32, opacity: 0.19, rotate:  16, dur: 3.5, delay: 0.4 },
  { type: 'ribbon',       left: '82%',  top: '88vh', size: 30, opacity: 0.18, rotate:   8, dur: 2.5, delay: 0.7 },
  { type: 'double-heart', left: '55%',  top:'108vh', size: 28, opacity: 0.21, rotate: -14, dur: 2.9, delay: 0.5 },
  { type: 'camera',       left: '28%',  top: '82vh', size: 36, opacity: 0.16, rotate: -35, dur: 2.8, delay: 0.2 },
  { type: 'flower',       left: '95%',  top:'115vh', size: 32, opacity: 0.20, rotate: -28, dur: 2.6, delay: 0.3 },
  // --- Row 3 (120 ~ 160vh) ---
  { type: 'star-bright',  left:  '8%',  top:'128vh', size: 24, opacity: 0.22, rotate:  30, dur: 4.1, delay: 0.8 },
  { type: 'leaf',         left: '85%',  top:'124vh', size: 48, opacity: 0.14, rotate:  -8, dur: 3.2, delay: 0.2 },
  { type: 'ribbon',       left: '42%',  top:'148vh', size: 32, opacity: 0.18, rotate:  15, dur: 2.3, delay: 0   },
  { type: 'music',        left: '18%',  top:'152vh', size: 28, opacity: 0.19, rotate:  -8, dur: 2.7, delay: 0.5 },
  { type: 'double-heart', left: '65%',  top:'136vh', size: 34, opacity: 0.20, rotate: -14, dur: 3.5, delay: 0.4 },
];

export default function ClotheslineDecorations() {
  return (
    <>
      {ITEMS.map((item, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -(item.size * 0.15), 0] }}
          transition={{
            duration: item.dur, repeat: Infinity,
            ease: 'easeInOut', repeatType: 'mirror', delay: item.delay,
          }}
          style={{
            position: 'absolute',
            left: item.left,
            top: item.top,
            transform: `rotate(${item.rotate}deg)`,
            opacity: item.opacity,
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 0,
          }}
        >
          <DecoSVG type={item.type} size={item.size} />
        </motion.div>
      ))}
    </>
  );
}
