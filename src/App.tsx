import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import { useJourneyNav } from './hooks/useJourneyNav';

const AUTO_PLAY_SEC = 6;

export default function App() {
  const { pos, go, goTo, canGo, next, isLast } = useJourneyNav();
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
