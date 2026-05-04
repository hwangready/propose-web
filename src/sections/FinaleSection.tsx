import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

interface Props { isActive: boolean }

const NO_MESSAGES = ['정말...? 💕', '한 번 더 생각해봐', '나 슬퍼지잖아 😢', '마지막 기회야... 💍', '제발... 🥺'];

const PETAL_COLORS = ['#ffb3c6', '#e05c7a', '#f9d6df', '#ffe4e4', '#fff', '#ffcad4'];

const SLIDE_PHOTOS = Array.from({ length: 12 }, (_, i) =>
  `https://picsum.photos/seed/couple${i + 1}/900/600`
);

interface Petal { x:number; y:number; vx:number; vy:number; color:string; angle:number; angVel:number; rx:number; ry:number; opacity:number }

function playChime() {
  try {
    const ac = new AudioContext();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.connect(g); g.connect(ac.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ac.currentTime + i * 0.14;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.2, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      osc.start(t); osc.stop(t + 1.4);
    });
    setTimeout(() => ac.close(), 2500);
  } catch { /* ignore */ }
}

function playBGM(): () => void {
  try {
    const ac = new AudioContext();
    // G장조 코드 진행: G-Em-C-D 루프 (각 2초)
    const chords = [
      [392, 494, 587],  // G
      [330, 392, 494],  // Em
      [262, 330, 392],  // C
      [294, 370, 440],  // D
    ];
    let stopped = false;
    let loop = 0;

    function playChord(notes: number[], time: number) {
      notes.forEach(freq => {
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.connect(g); g.connect(ac.destination);
        osc.type = 'triangle';
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(0.04, time + 0.15);
        g.gain.setValueAtTime(0.04, time + 1.6);
        g.gain.linearRampToValueAtTime(0, time + 2.0);
        osc.start(time); osc.stop(time + 2.0);
      });
    }

    function scheduleLoop() {
      if (stopped) return;
      const now = ac.currentTime;
      chords.forEach((chord, i) => {
        playChord(chord, now + i * 2);
      });
      loop++;
      setTimeout(scheduleLoop, 7800);
    }
    scheduleLoop();

    return () => {
      stopped = true;
      ac.close();
    };
  } catch {
    return () => {};
  }
}

export default function FinaleSection({ isActive }: Props) {
  const [answered, setAnswered] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // 커서 추적
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

  // YES 버튼 마그네틱
  const yesBtnX = useMotionValue(0);
  const yesBtnY = useMotionValue(0);
  const yesBtnXSpring = useSpring(yesBtnX, { stiffness: 300, damping: 18 });
  const yesBtnYSpring = useSpring(yesBtnY, { stiffness: 300, damping: 18 });

  const handleYesHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    yesBtnX.set((e.clientX - (rect.left + rect.width / 2)) * 0.35);
    yesBtnY.set((e.clientY - (rect.top + rect.height / 2)) * 0.35);
  };
  const handleYesLeave = () => { yesBtnX.set(0); yesBtnY.set(0); };

  // 꽃잎 canvas 애니메이션
  const triggerPetals = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const petals: Petal[] = Array.from({ length: 320 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      vx: (Math.random() - 0.5) * 2.5,
      vy: 0.8 + Math.random() * 1.4,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      angle: Math.random() * 360,
      angVel: (Math.random() - 0.5) * 4,
      rx: 5 + Math.random() * 9,
      ry: 3 + Math.random() * 5,
      opacity: 0.7 + Math.random() * 0.3,
    }));
    let animId: number;
    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of petals) {
        p.x += p.vx + Math.sin(p.angle * 0.04) * 0.8;
        p.y += p.vy;
        p.angle += p.angVel;
        p.opacity -= 0.0025;
        if (p.y < canvas!.height + 40 && p.opacity > 0) alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // 슬라이드쇼
  useEffect(() => {
    if (!answered) return;
    const id = setInterval(() => {
      setSlideIdx(i => (i + 1) % SLIDE_PHOTOS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [answered]);

  // BGM
  useEffect(() => {
    if (!answered) return;
    playChime();
    const stop = playBGM();
    return stop;
  }, [answered]);

  const handleYes = () => {
    setAnswered(true);
    setTimeout(() => triggerPetals(), 200);
  };

  const noScale = Math.max(0.4, 1 - noCount * 0.14);
  const noLabel = noCount === 0 ? '음... 글쎄' : NO_MESSAGES[noCount - 1];

  return (
    <motion.section
      ref={sectionRef}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: isActive ? 0.6 : 0 }}
      style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 60px', background: 'transparent',
        overflow: 'hidden', boxSizing: 'border-box', position: 'relative',
      }}
    >
      {/* 꽃잎 canvas */}
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }} />

      {/* 슬라이드쇼 오버레이 */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.88)' }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={slideIdx}
                src={SLIDE_PHOTOS[slideIdx]}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 0.45, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.9 }}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AnimatePresence>

            {/* 중앙 텍스트 */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 120 }}
                style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(44px,5vw,72px)', color: '#e05c7a', textShadow: '0 2px 24px rgba(224,92,122,0.5)' }}
              >
                사랑해, 영원히 ♡
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.7 }}
                style={{ fontFamily: "'Noto Sans KR',sans-serif", fontSize: 16, color: 'rgba(255,255,255,0.65)', fontWeight: 300, letterSpacing: '1px' }}
              >
                함께해줘서 고마워
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메인 카드 */}
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 36 }}
        transition={{ duration: isActive ? 0.8 : 0, delay: isActive ? 0.15 : 0, type: 'spring', stiffness: 120 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: '64px 88px', maxWidth: 680,
          textAlign: 'center', position: 'relative',
          boxShadow: '0 4px 32px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
          zIndex: 10,
        }}
      >
        <motion.div
          style={{ fontSize: 72, marginBottom: 28, display: 'inline-block', lineHeight: 1, x: ringX, y: ringY }}
          animate={{ scale: isActive ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 12, delay: isActive ? 0.3 : 0 }}
        >
          💍
        </motion.div>

        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(36px,4vw,58px)', color: '#f0d4e0', marginBottom: 20, lineHeight: 1.3 }}>
          나랑 결혼해 줄래?
        </div>

        <div style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.6)', fontWeight: 300, marginBottom: 40 }}>
          <p>네가 있어서 매일이 행복해.</p>
          <p>평생 네 옆에 있고 싶어.</p>
        </div>

        <AnimatePresence mode="wait">
          {!answered ? (
            <motion.div key="buttons" exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
              style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'center' }}>
              <motion.button
                onMouseMove={handleYesHover} onMouseLeave={handleYesLeave}
                onClick={handleYes}
                style={{
                  x: yesBtnXSpring, y: yesBtnYSpring,
                  background: 'linear-gradient(135deg,#7db8a0,#5a9e82)',
                  color: '#fff', border: 'none', borderRadius: 99,
                  padding: '14px 38px', fontSize: 17,
                  fontFamily: "'Noto Sans KR',sans-serif", fontWeight: 500,
                  cursor: 'pointer', boxShadow: '0 4px 16px rgba(93,168,128,0.35)', letterSpacing: '0.5px',
                }}
                whileTap={{ scale: 0.94 }}
              >
                응, 할게 💕
              </motion.button>
              <motion.button
                animate={{ scale: noScale }}
                transition={{ type: 'spring', stiffness: 220, damping: 14 }}
                onClick={() => setNoCount(c => Math.min(c + 1, NO_MESSAGES.length - 1))}
                whileTap={{ scale: noScale * 0.9 }}
                style={{
                  background: 'transparent', color: '#9ecfba',
                  border: '1.5px solid #9ecfba', borderRadius: 99,
                  padding: '14px 28px', fontSize: 15,
                  fontFamily: "'Noto Sans KR',sans-serif", cursor: 'pointer', minWidth: 90,
                }}
              >
                {noLabel}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div key="love"
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(28px,3vw,44px)', color: '#e05c7a' }}
            >
              사랑해, 영원히 ♡
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.section>
  );
}
