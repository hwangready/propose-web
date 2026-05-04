import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

interface Props { isActive: boolean }

const CONFETTI_COLORS = ['#e05c7a', '#7db8a0', '#ffb3c6', '#b5d9c9', '#ffffff', '#f9d6df'];
const NO_MESSAGES = ['정말...? 💕', '한 번 더 생각해봐', '나 슬퍼지잖아 😢', '마지막 기회야... 💍', '제발... 🥺'];

interface Particle { x:number;y:number;vx:number;vy:number;color:string;angle:number;angVel:number;w:number;h:number;opacity:number }

export default function FinaleSection({ isActive }: Props) {
  const [answered, setAnswered] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // 💍 커서 추적
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

  const triggerConfetti = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    const cx = canvas.width / 2; const cy = canvas.height * 0.45;
    const particles: Particle[] = Array.from({ length: 240 }, () => ({
      x: cx, y: cy,
      vx: (Math.random() - 0.5) * 24, vy: (Math.random() - 1.8) * 14,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      angle: Math.random() * 360, angVel: (Math.random() - 0.5) * 14,
      w: 8 + Math.random() * 9, h: 5 + Math.random() * 5, opacity: 1,
    }));
    let animId: number;
    function animate() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      let alive = false;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.4; p.vx *= 0.99;
        p.angle += p.angVel; p.opacity -= 0.01;
        if (p.opacity > 0) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.opacity); ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      }
      if (alive) animId = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas!.width, canvas!.height);
    }
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleYes = () => { setAnswered(true); setTimeout(() => triggerConfetti(), 100); };
  const noScale = Math.max(0.4, 1 - noCount * 0.14);
  const noLabel = noCount === 0 ? '음... 글쎄' : NO_MESSAGES[noCount - 1];

  return (
    <motion.section
      ref={sectionRef}
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: isActive ? 0.6 : 0 }}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 60px',
        background: '#0f0a14',
        overflow: 'hidden',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: 100, pointerEvents: 'none' }} />

      <motion.div
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 36 }}
        transition={{ duration: isActive ? 0.8 : 0, delay: isActive ? 0.15 : 0, type: 'spring', stiffness: 120 }}
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: '64px 88px',
          maxWidth: 680,
          textAlign: 'center',
          position: 'relative',
          boxShadow: '0 16px 64px rgba(0,0,0,0.6)',
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
