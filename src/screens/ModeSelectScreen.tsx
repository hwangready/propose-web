import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onSelect: (mode: 'journey' | 'clothesline' | 'scrapbook') => void;
}

function JourneyIcon() {
  return (
    <svg viewBox="0 0 88 64" width="88" height="64">
      <path d="M 8,55 Q 22,36 44,40 Q 66,44 80,16"
        fill="none" stroke="rgba(200,144,90,0.75)" strokeWidth="2.8"
        strokeLinecap="round" strokeDasharray="5 3" />
      {[[8,55],[44,40],[80,16]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={i===2?5:4} fill="#c8905a" opacity="0.9" />
      ))}
      <path d="M 80,8 Q 75,4 75,11 Q 75,16 80,20 Q 85,16 85,11 Q 85,4 80,8 Z"
        fill="#e05c7a" opacity="0.9" />
      <circle cx="80" cy="11" r="2.5" fill="#fff" opacity="0.6" />
    </svg>
  );
}

function ScrapbookIcon() {
  return (
    <svg viewBox="0 0 88 64" width="88" height="64">
      {/* Paper background */}
      <rect x="10" y="8" width="50" height="48" rx="3" fill="rgba(245,238,220,0.14)" stroke="rgba(200,160,100,0.5)" strokeWidth="1.4" />
      {/* Spiral binding */}
      {[16, 26, 36, 46].map((y, i) => (
        <circle key={i} cx="14" cy={y} r="2.4" fill="none" stroke="rgba(180,140,80,0.6)" strokeWidth="1.4" />
      ))}
      {/* Polaroid 1 */}
      <rect x="18" y="14" width="22" height="24" rx="1" fill="rgba(255,253,248,0.92)" />
      <rect x="19" y="15" width="20" height="15" fill="rgba(145,175,210,0.45)" />
      {/* Tape on photo 1 */}
      <rect x="24" y="10" width="14" height="6" rx="1.5" fill="rgba(255,228,128,0.6)" transform="rotate(-3 24 10)" />
      {/* Polaroid 2 */}
      <rect x="34" y="29" width="20" height="22" rx="1" fill="rgba(255,253,248,0.88)" />
      <rect x="35" y="30" width="18" height="13" fill="rgba(200,168,178,0.45)" />
      {/* Tape on photo 2 */}
      <rect x="38" y="26" width="12" height="5" rx="1.5" fill="rgba(198,182,232,0.62)" transform="rotate(4 38 26)" />
      {/* Ruled lines */}
      <line x1="18" y1="44" x2="36" y2="44" stroke="rgba(160,120,70,0.3)" strokeWidth="0.8" strokeDasharray="3 2" />
      <line x1="18" y1="50" x2="30" y2="50" stroke="rgba(160,120,70,0.3)" strokeWidth="0.8" strokeDasharray="3 2" />
      {/* Heart accent */}
      <path d="M70 26 Q72 22 74.5 26 Q77 22 79 26 Q79 31 74.5 36 Q70 31 70 26Z" fill="#e8a0b4" opacity="0.85" />
    </svg>
  );
}

function ClotheslineIcon() {
  return (
    <svg viewBox="0 0 88 64" width="88" height="64">
      <path d="M 4,22 Q 24,32 44,26 Q 64,32 84,22"
        fill="none" stroke="rgba(185,142,85,0.8)" strokeWidth="2.2" strokeLinecap="round" />
      {[18, 44, 70].map((x, i) => {
        const sy = [24,28,24][i];
        const colors = ['rgba(180,210,240,0.5)','rgba(240,180,200,0.5)','rgba(180,240,200,0.5)'];
        return (
          <g key={i}>
            <line x1={x} y1={sy} x2={x} y2={sy+7} stroke="rgba(140,108,64,0.7)" strokeWidth="1.2" />
            <rect x={x-9} y={sy+7} width={18} height={22} rx="1.5" fill="#fffdf8" />
            <rect x={x-7} y={sy+9} width={14} height={13} fill={colors[i]} />
            <circle cx={x} cy={sy+5} r="2.5" fill="#c8905a" />
          </g>
        );
      })}
    </svg>
  );
}

const MODES = [
  {
    id: 'journey' as const,
    Icon: JourneyIcon,
    title: '여정 모드',
    sub: '지도를 따라\n12개의 챕터를 여행하듯',
    accent: '#c8905a',
    glow: 'rgba(200,144,90,0.22)',
    border: 'rgba(200,144,90,0.35)',
    bg: 'linear-gradient(140deg, rgba(70,42,14,0.92) 0%, rgba(38,22,8,0.96) 100%)',
  },
  {
    id: 'clothesline' as const,
    Icon: ClotheslineIcon,
    title: '줄사진 모드',
    sub: '빨래줄에 걸린\n12장의 사진처럼',
    accent: '#5dc9a5',
    glow: 'rgba(93,201,165,0.22)',
    border: 'rgba(93,201,165,0.35)',
    bg: 'linear-gradient(140deg, rgba(14,52,42,0.92) 0%, rgba(8,26,22,0.96) 100%)',
  },
  {
    id: 'scrapbook' as const,
    Icon: ScrapbookIcon,
    title: '스크랩북 모드',
    sub: '종이 위에 펼쳐진\n우리의 기억들',
    accent: '#e8a0b4',
    glow: 'rgba(232,160,180,0.22)',
    border: 'rgba(232,160,180,0.35)',
    bg: 'linear-gradient(140deg, rgba(70,28,38,0.92) 0%, rgba(38,14,22,0.96) 100%)',
  },
];

export default function ModeSelectScreen({ onSelect }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);

  const handle = (id: 'journey' | 'clothesline' | 'scrapbook') => {
    if (picked) return;
    setPicked(id);
    setTimeout(() => onSelect(id), 480);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'linear-gradient(160deg, #08060e 0%, #0c1018 50%, #08070d 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 0, zIndex: 9999,
      }}
    >
      {/* 별빛 배경 */}
      {Array.from({ length: 50 }, (_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 2 + (i % 5) * 0.6, repeat: Infinity, delay: (i * 0.13) % 3 }}
          style={{
            position: 'absolute',
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 53 + 7) % 100}%`,
            width: i % 4 === 0 ? 2.5 : 1.5,
            height: i % 4 === 0 ? 2.5 : 1.5,
            borderRadius: '50%',
            background: i % 7 === 0 ? 'rgba(200,180,255,0.8)' : 'rgba(255,255,255,0.6)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8 }}
        style={{ textAlign: 'center', marginBottom: 52 }}
      >
        <div style={{
          fontFamily: "'Dancing Script', cursive",
          fontSize: 46, color: 'rgba(255,220,180,0.92)',
          marginBottom: 10, lineHeight: 1.1,
        }}>
          우리의 이야기
        </div>
        <div style={{
          fontFamily: "'Noto Sans KR', sans-serif",
          fontSize: 11, color: 'rgba(180,160,140,0.55)',
          letterSpacing: '5px',
        }}>
          어떻게 만날까요?
        </div>
      </motion.div>

      {/* 모드 카드 */}
      <div style={{ display: 'flex', gap: 28 }}>
        {MODES.map((m, idx) => {
          const isHov = hovered === m.id;
          const isPicked = picked === m.id;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: isPicked ? 0 : 1, y: 0, scale: isPicked ? 1.06 : 1 }}
              transition={{ delay: 0.55 + idx * 0.14, duration: 0.7, ease: [0.25,0.46,0.45,0.94] }}
              whileHover={{ y: -8, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handle(m.id)}
              onMouseEnter={() => setHovered(m.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: 238, padding: '36px 26px 32px',
                borderRadius: 22,
                background: m.bg,
                border: `1.5px solid ${isHov || isPicked ? m.border : 'rgba(255,255,255,0.05)'}`,
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
                boxShadow: isHov || isPicked
                  ? `0 0 48px ${m.glow}, 0 24px 60px rgba(0,0,0,0.55)`
                  : '0 10px 36px rgba(0,0,0,0.45)',
                transition: 'border-color 0.3s, box-shadow 0.3s',
                userSelect: 'none',
              }}
            >
              {/* 아이콘 */}
              <motion.div
                animate={isHov ? { rotate: [0, -4, 4, 0] } : { rotate: 0 }}
                transition={{ duration: 0.5 }}
              >
                <m.Icon />
              </motion.div>

              {/* 제목 */}
              <div style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontWeight: 700, fontSize: 21,
                color: m.accent, letterSpacing: '2.5px',
              }}>
                {m.title}
              </div>

              {/* 설명 */}
              <div style={{
                fontFamily: "'Noto Sans KR', sans-serif",
                fontSize: 13, lineHeight: 2,
                color: 'rgba(210,190,170,0.65)',
                textAlign: 'center', whiteSpace: 'pre-line',
                letterSpacing: '0.5px',
              }}>
                {m.sub}
              </div>

              {/* 버튼 */}
              <div style={{
                marginTop: 4, padding: '9px 30px',
                borderRadius: 100,
                border: `1px solid ${m.border}`,
                color: m.accent,
                fontSize: 11, letterSpacing: '2.5px',
                fontFamily: "'Courier New', monospace",
                background: isHov ? `${m.glow}` : 'transparent',
                transition: 'background 0.3s',
              }}>
                선택하기
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
