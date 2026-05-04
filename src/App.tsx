import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import { useJourneyNav } from './hooks/useJourneyNav';

const AUTO_PLAY_SEC = 6;

const SECTION_NAMES = [
  '인트로', '처음 만난 날', '우리가 된 날',
  '첫 여행', '소중한 기억', '여행의 기억',
  '우리의 일상', '함께한 순간들', '매일 네 곁에',
  '앞으로의 우리', '영원히 함께', '나랑 결혼해 줄래?',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

export default function App() {
  const { pos, go, goTo, canGo, next, isLast, seqIdx } = useJourneyNav();
  const [presentMode, setPresentMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // 자동 재생 타이머
  useEffect(() => {
    if (!autoPlay || isLast) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!autoPlay) setProgress(0);
      return;
    }
    setProgress(0);
    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const pct = Math.min(elapsed / AUTO_PLAY_SEC, 1);
      setProgress(pct);
      if (pct < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    intervalRef.current = setInterval(() => {
      next();
      startTimeRef.current = performance.now();
      setProgress(0);
    }, AUTO_PLAY_SEC * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [autoPlay, pos, isLast, next]);

  const btnStyle: React.CSSProperties = {
    position: 'fixed',
    right: 24,
    zIndex: 200,
    background: 'rgba(8,22,14,0.88)',
    backdropFilter: 'blur(14px)',
    WebkitBackdropFilter: 'blur(14px)',
    border: '1px solid rgba(100,170,130,0.4)',
    color: '#9ecfba',
    padding: '10px 18px',
    borderRadius: 99,
    cursor: 'pointer',
    fontFamily: "'Courier New',monospace",
    fontSize: 10,
    letterSpacing: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
  };

  return (
    <>
      <CustomCursor />
      <JourneyCanvas pos={pos} go={go} canGo={canGo} next={next} />
      <NavigationMap pos={pos} goTo={goTo} />
      <DirectionArrows canGo={canGo} go={go} />

      {/* 그레인 텍스처 오버레이 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none',
        opacity: 0.045,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }} />

      {/* 현재 섹션 이름 — 상단 좌측 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={seqIdx}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'fixed', top: 28, left: 32, zIndex: 200,
            fontFamily: "'Courier New',monospace", fontSize: 11,
            color: 'rgba(125,184,160,0.6)', letterSpacing: '2px',
            pointerEvents: 'none',
          }}
        >
          {String(seqIdx + 1).padStart(2, '0')} — {SECTION_NAMES[seqIdx]}
        </motion.div>
      </AnimatePresence>

      {/* 섹션 카운터 — 하단 중앙 */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, fontFamily: "'Courier New',monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.2)', letterSpacing: '3px', pointerEvents: 'none',
      }}>
        {String(seqIdx + 1).padStart(2, '0')} / 12
      </div>

      {/* 자동 재생 버튼 */}
      <motion.button
        onClick={() => setAutoPlay(a => !a)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        style={{ ...btnStyle, bottom: 140 }}
      >
        <span>{autoPlay ? '⏸' : '▷'}</span>
        <span>자동</span>
      </motion.button>

      {/* 연출 모드 버튼 */}
      <motion.button
        onClick={() => setPresentMode(true)}
        whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(93,168,128,0.3)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{ ...btnStyle, bottom: 80 }}
      >
        <span>▶</span>
        <span>연출 모드</span>
      </motion.button>

      {/* 자동 재생 진행 바 */}
      <AnimatePresence>
        {autoPlay && !isLast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 2, zIndex: 300, background: 'rgba(125,184,160,0.15)' }}
          >
            <div
              style={{
                height: '100%',
                background: 'linear-gradient(to right, #5dcaa5, #7db8a0)',
                width: `${progress * 100}%`,
                transition: 'none',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {presentMode && <PresentationMode onClose={() => setPresentMode(false)} />}
      </AnimatePresence>
    </>
  );
}
