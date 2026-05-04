import { motion } from 'framer-motion';
import { useMouseParallax } from '../hooks/useMouseParallax';

interface Props { isActive: boolean }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple1/400/480', caption: '우리의 첫 페이지', rotate: -9, left: '4%',  top: '8%',  width: 200, photoHeight: 175, delay: 0.1 },
  { src: 'https://picsum.photos/seed/couple2/400/480', caption: '기억하고 싶은 날', rotate:  6, left: '58%', top: '6%',  width: 185, photoHeight: 160, delay: 0.25 },
  { src: 'https://picsum.photos/seed/couple3/400/480', caption: '함께라서 좋아',   rotate: -4, left: '30%', top: '48%', width: 195, photoHeight: 170, delay: 0.4 },
];

const MAGNETS = [
  { color: '#e05c7a', left: '7%',  top: '7%'  },
  { color: '#7db8a0', left: '59%', top: '5%'  },
  { color: '#f4c842', left: '32%', top: '47%' },
  { color: '#8aadde', left: '62%', top: '55%' },
];

const TAPES = [
  { left: '10%',  top: '10%',  rotate:  -12, width: 76, bg: 'rgba(255,235,150,0.38)' },
  { left: '60%',  top:  '9%',  rotate:   10, width: 72, bg: 'rgba(255,180,200,0.35)' },
  { left: '33%',  top: '50%',  rotate:   -8, width: 68, bg: 'rgba(200,235,220,0.35)' },
];

const FLOATS = [
  { emoji: '♡', left: '88%', top: '18%', size: 22, dur: 2.4, delay: 0   },
  { emoji: '✦', left: '2%',  top: '72%', size: 16, dur: 3.1, delay: 0.8 },
  { emoji: '♡', left: '90%', top: '65%', size: 18, dur: 2.8, delay: 0.4 },
  { emoji: '✦', left: '20%', top: '88%', size: 14, dur: 3.4, delay: 1.2 },
];

export default function HeroSection({ isActive }: Props) {
  const { x: mx, y: my } = useMouseParallax(80, 14);

  return (
    <section style={{
      width: '100%', height: '100%',
      position: 'relative',
      background: 'transparent',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      {/* 마스킹테이프 */}
      {TAPES.map((t, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: t.left, top: t.top,
            width: t.width, height: 18,
            background: t.bg,
            transform: `rotate(${t.rotate}deg)`,
            zIndex: 3,
            borderRadius: 2,
          }}
        />
      ))}

      {/* 마그넷 */}
      {MAGNETS.map((m, i) => (
        <motion.div
          key={i}
          animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
          transition={{ duration: isActive ? 0.4 : 0, delay: isActive ? 0.05 + i * 0.08 : 0, type: 'spring', stiffness: 260, damping: 14 }}
          style={{
            position: 'absolute',
            left: m.left, top: m.top,
            width: 22, height: 22,
            borderRadius: '50%',
            background: m.color,
            boxShadow: `0 2px 8px ${m.color}88`,
            zIndex: 4,
          }}
        />
      ))}

      {/* 폴라로이드 사진들 */}
      {PHOTOS.map((p, i) => (
        <motion.div
          key={i}
          animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.82, rotate: p.rotate }}
          initial={{ rotate: p.rotate }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 140, damping: 16 }}
          whileHover={{ scale: 1.04, zIndex: 10, rotate: p.rotate * 0.4 }}
          style={{
            position: 'absolute',
            left: p.left, top: p.top,
            zIndex: 2,
            cursor: 'grab',
          }}
        >
          <motion.div
            style={{
              x: i % 2 === 0 ? mx : my,
              y: i % 2 === 0 ? my : mx,
            }}
          >
            <div style={{
              background: '#fff',
              padding: '10px 10px 40px',
              width: p.width,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <img src={p.src} alt="" style={{ width: '100%', height: p.photoHeight, objectFit: 'cover', display: 'block' }} />
              <div style={{ textAlign: 'center', paddingTop: 8, fontFamily: "'Dancing Script',cursive", fontSize: 13, color: '#5a7a6e' }}>{p.caption}</div>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* 중앙 텍스트 스티커 */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.88 }}
        transition={{ duration: isActive ? 0.65 : 0, delay: isActive ? 0.35 : 0, type: 'spring', stiffness: 180 }}
        style={{
          position: 'absolute',
          left: '50%', top: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 5,
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          borderRadius: 10,
          padding: '20px 36px',
        }}
      >
        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(38px,4.2vw,58px)', color: '#f0d4e0', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
          우리 ♡
        </div>
        <div style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: '#7db8a0', marginTop: 8, letterSpacing: '2px', fontWeight: 300 }}>
          우리의 이야기
        </div>
      </motion.div>

      {/* 떠다니는 이모지 */}
      {FLOATS.map((f, i) => (
        <motion.div
          key={i}
          animate={isActive ? {
            y: [0, -f.size * 0.6, 0],
            opacity: [0.18, 0.42, 0.18],
          } : { opacity: 0 }}
          transition={isActive ? { duration: f.dur, repeat: Infinity, ease: 'easeInOut', delay: f.delay } : {}}
          style={{
            position: 'absolute',
            left: f.left, top: f.top,
            fontSize: f.size,
            color: '#e05c7a',
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 6,
          }}
        >
          {f.emoji}
        </motion.div>
      ))}
    </section>
  );
}
