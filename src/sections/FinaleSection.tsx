import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useImageViewer } from '../context/ImageContext';
import AudioUploader from '../components/AudioUploader';
import EditableText from '../components/EditableText';

interface Props { isActive: boolean; step: number }

const NO_MESSAGES = ['정말...? 💕', '한 번 더 생각해봐', '나 슬퍼지잖아 😢', '마지막 기회야... 💍', '제발... 🥺'];
const PETAL_COLORS = ['#ffb3c6', '#e05c7a', '#f9d6df', '#ffe4e4', '#fff', '#ffcad4'];

const COLLAGE_PHOTOS_INIT = [
  'https://picsum.photos/seed/couple1/900/600',
  'https://picsum.photos/seed/couple2/900/600',
  'https://picsum.photos/seed/couple3/900/600',
  'https://picsum.photos/seed/couple4/900/600',
  'https://picsum.photos/seed/couple5/900/600',
  'https://picsum.photos/seed/couple6/900/600',
  'https://picsum.photos/seed/couple7/900/600',
  'https://picsum.photos/seed/couple28/900/600',
];

// 8 polaroid positions: offset from screen center (% of screen), each flies in from `from`
const COLLAGE = [
  { ox: '-44%', oy: '-32%', rotate: -13, w: 230, from: { x: -700, y: -500 }, delay: 0.0  },
  { ox:  '10%', oy: '-38%', rotate:   9, w: 205, from: { x:  400, y: -600 }, delay: 0.11 },
  { ox:  '42%', oy: '-20%', rotate:  -5, w: 215, from: { x:  800, y: -250 }, delay: 0.22 },
  { ox: '-52%', oy:  '10%', rotate:  15, w: 198, from: { x: -800, y:  150 }, delay: 0.34 },
  { ox:  '-6%', oy:   '6%', rotate:  -8, w: 252, from: { x: -250, y:  700 }, delay: 0.08 },
  { ox:  '30%', oy:  '12%', rotate:   7, w: 224, from: { x:  550, y:  500 }, delay: 0.19 },
  { ox: '-30%', oy:  '40%', rotate: -17, w: 200, from: { x: -600, y:  700 }, delay: 0.29 },
  { ox:  '40%', oy:  '36%', rotate:  11, w: 212, from: { x:  700, y:  700 }, delay: 0.40 },
];

interface Petal { x:number; y:number; vx:number; vy:number; color:string; angle:number; angVel:number; rx:number; ry:number; opacity:number }

function playChime() {
  try {
    const ac = new AudioContext();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ac.createOscillator(); const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sine'; osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.14;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.2, t + 0.05); g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      osc.start(t); osc.stop(t + 1.4);
    });
    setTimeout(() => ac.close(), 2500);
  } catch { /* ignore */ }
}

function playBGM(): () => void {
  try {
    const ac = new AudioContext();
    const chords = [[392, 494, 587], [330, 392, 494], [262, 330, 392], [294, 370, 440]];
    let stopped = false;
    function playChord(notes: number[], time: number) {
      notes.forEach(freq => {
        const osc = ac.createOscillator(); const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'triangle'; osc.frequency.value = freq;
        g.gain.setValueAtTime(0, time); g.gain.linearRampToValueAtTime(0.04, time + 0.15);
        g.gain.setValueAtTime(0.04, time + 1.6); g.gain.linearRampToValueAtTime(0, time + 2.0);
        osc.start(time); osc.stop(time + 2.0);
      });
    }
    function scheduleLoop() {
      if (stopped) return;
      const now = ac.currentTime;
      chords.forEach((chord, i) => playChord(chord, now + i * 2));
      setTimeout(scheduleLoop, 7800);
    }
    scheduleLoop();
    return () => { stopped = true; ac.close(); };
  } catch { return () => {}; }
}

export default function FinaleSection({ isActive, step }: Props) {
  const [answered, setAnswered] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [collagePhotos, setCollagePhotos] = useState(COLLAGE_PHOTOS_INIT);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { openViewer } = useImageViewer();

  const show = (n: number) => isActive && step >= n + 1;

  const ringRawX = useMotionValue(0);
  const ringRawY = useMotionValue(0);
  const ringX = useSpring(ringRawX, { stiffness: 60, damping: 10 });
  const ringY = useSpring(ringRawY, { stiffness: 60, damping: 10 });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const handler = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      ringRawX.set(e.clientX - rect.left - rect.width / 2);
      ringRawY.set(e.clientY - rect.top - rect.height / 2);
    };
    section.addEventListener('mousemove', handler);
    return () => section.removeEventListener('mousemove', handler);
  }, [ringRawX, ringRawY]);

  const yesBtnX = useMotionValue(0); const yesBtnY = useMotionValue(0);
  const yesBtnXSpring = useSpring(yesBtnX, { stiffness: 300, damping: 18 });
  const yesBtnYSpring = useSpring(yesBtnY, { stiffness: 300, damping: 18 });

  const handleYesHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    yesBtnX.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    yesBtnY.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };
  const handleYesLeave = () => { yesBtnX.set(0); yesBtnY.set(0); };

  const triggerPetals = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const petals: Petal[] = Array.from({ length: 320 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2.5, vy: 0.8 + Math.random() * 1.4,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      angle: Math.random() * 360, angVel: (Math.random() - 0.5) * 4,
      rx: 5 + Math.random() * 9, ry: 3 + Math.random() * 5,
      opacity: 0.7 + Math.random() * 0.3,
    }));
    let animId: number;
    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of petals) {
        p.x += p.vx + Math.sin(p.angle * 0.04) * 0.8; p.y += p.vy;
        p.angle += p.angVel; p.opacity -= 0.0025;
        if (p.y < canvas!.height + 40 && p.opacity > 0) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    if (!answered) return;
    playChime();
    const stop = playBGM();
    return stop;
  }, [answered]);

  const handleYes = () => { setAnswered(true); setTimeout(() => triggerPetals(), 200); };
  const noScale = Math.max(0.4, 1 - noCount * 0.14);
  const noLabel = noCount === 0 ? '음... 글쎄' : NO_MESSAGES[noCount - 1];

  return (
    <motion.section
      ref={sectionRef}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: isActive ? 0.6 : 0 }}
      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box', position: 'relative' }}
    >
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }} />

      {/* 청혼 승낙 아웃트로 — 밝은 배경 + 폴라로이드 날아오기 */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: '#fffff4' }}
          >
            {/* 날아오는 폴라로이드 사진들 */}
            {COLLAGE.map((c, i) => (
              <motion.div
                key={i}
                initial={{ x: c.from.x, y: c.from.y, opacity: 0, rotate: c.rotate * 2 }}
                animate={{ x: 0, y: 0, opacity: 1, rotate: c.rotate }}
                transition={{ type: 'spring', stiffness: 110, damping: 18, delay: c.delay }}
                style={{
                  position: 'absolute',
                  left: '50%', top: '50%',
                  translateX: `calc(-50% + ${c.ox})`,
                  translateY: `calc(-50% + ${c.oy})`,
                  cursor: 'zoom-in',
                  zIndex: 2 + i,
                }}
                onClick={e => {
                  e.stopPropagation();
                  openViewer(collagePhotos[i], newSrc => setCollagePhotos(prev => prev.map((s, j) => j === i ? newSrc : s)));
                }}
              >
                <div style={{
                  background: '#fff', padding: '8px 8px 34px',
                  width: c.w, boxShadow: '0 10px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={collagePhotos[i]}
                      alt=""
                      style={{ width: '100%', height: c.w * 0.78, objectFit: 'cover', display: 'block' }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fff', pointerEvents: 'none' }}
                    >⊕</motion.div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* 텍스트 오버레이 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, pointerEvents: 'none' }}>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.85, duration: 0.55, type: 'spring', stiffness: 120 }}
                style={{ fontFamily: "'Dancing Script', cursive", fontSize: 'clamp(52px,6vw,88px)', color: '#c94b6d', textShadow: '0 2px 16px rgba(201,75,109,0.2)', lineHeight: 1.15 }}
                onClick={e => e.stopPropagation()}
              >
                <span style={{ pointerEvents: 'auto' }}>
                  <EditableText>사랑해, 영원히 ♡</EditableText>
                </span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 18, color: '#9a7a80', fontWeight: 300, letterSpacing: '1.5px' }}
                onClick={e => e.stopPropagation()}
              >
                <span style={{ pointerEvents: 'auto' }}>
                  <EditableText>함께해줘서 고마워</EditableText>
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 카드 */}
      <motion.div
        animate={{ opacity: show(0) ? 1 : 0, y: show(0) ? 0 : 36 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 120 }}
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '64px 88px', maxWidth: 680, textAlign: 'center', position: 'relative', boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset', zIndex: 10 }}
      >
        <motion.div
          style={{ fontSize: 72, marginBottom: 28, display: 'inline-block', lineHeight: 1, x: ringX, y: ringY }}
          animate={{ scale: show(0) ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12 }}
        >
          💍
        </motion.div>

        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(36px,4vw,58px)', color: '#f0d4e0', marginBottom: 20, lineHeight: 1.3 }} onClick={e => e.stopPropagation()}>
          <EditableText>나랑 결혼해 줄래?</EditableText>
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.6)', fontWeight: 300, marginBottom: 40 }} onClick={e => e.stopPropagation()}>
          <p><EditableText>네가 있어서 매일이 행복해.</EditableText></p>
          <p><EditableText>평생 네 옆에 있고 싶어.</EditableText></p>
        </div>

        <AnimatePresence mode="wait">
          {show(1) && !answered ? (
            <motion.div key="buttons" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center' }}>
              <motion.button
                onMouseMove={handleYesHover} onMouseLeave={handleYesLeave} onClick={handleYes}
                style={{ x: yesBtnXSpring, y: yesBtnYSpring, background: 'linear-gradient(135deg,#7db8a0,#5a9e82)', color: '#fff', border: 'none', borderRadius: 99, padding: '14px 38px', fontSize: 17, fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 500, cursor: 'pointer', boxShadow: '0 4px 16px rgba(93,168,128,0.35)', letterSpacing: '0.5px' }}
                whileTap={{ scale: 0.94 }}
              >
                응, 할게 💕
              </motion.button>
              <motion.button
                animate={{ scale: noScale }} transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                onClick={() => setNoCount(c => Math.min(c + 1, NO_MESSAGES.length - 1))} whileTap={{ scale: noScale * 0.9 }}
                style={{ background: 'transparent', color: '#9ecfba', border: '1.5px solid #9ecfba', borderRadius: 99, padding: '14px 28px', fontSize: 15, fontFamily: "'Noto Sans KR',sans-serif", cursor: 'pointer', minWidth: 90 }}
              >
                {noLabel}
              </motion.button>
            </motion.div>
          ) : show(1) && answered ? (
            <motion.div key="love" initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(28px,3vw,44px)', color: '#e05c7a' }}>
              사랑해, 영원히 ♡
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <AudioUploader isActive={isActive} />
    </motion.section>
  );
}
