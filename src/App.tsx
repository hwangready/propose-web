import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import ImageViewer from './components/ImageViewer';
import { ImageProvider, useImageViewer } from './context/ImageContext';
import { useJourneyNav } from './hooks/useJourneyNav';

const SPEED_OPTIONS = [3, 5, 8, 10];

const SECTION_NAMES = [
  '인트로', '처음 만난 날', '우리가 된 날',
  '첫 여행', '소중한 기억', '여행의 기억',
  '우리의 일상', '함께한 순간들', '매일 네 곁에',
  '앞으로의 우리', '영원히 함께', '나랑 결혼해 줄래?',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function AppInner() {
  const { pos, go, goTo, canGo, next, isLast, seqIdx } = useJourneyNav();
  const [presentMode, setPresentMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSec, setAutoSec] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { viewer, closeViewer } = useImageViewer();

  // 전체화면 토글
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

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
      const pct = Math.min(elapsed / autoSec, 1);
      setProgress(pct);
      if (pct < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    intervalRef.current = setInterval(() => {
      next();
      startTimeRef.current = performance.now();
      setProgress(0);
    }, autoSec * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [autoPlay, autoSec, pos, isLast, next]);

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

      {/* 그레인 텍스처 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none',
        opacity: 0.045,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }} />

      {/* 섹션 이름 — 상단 좌측 */}
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

      {/* 카운터 — 하단 중앙 */}
      <div style={{
        position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 200, fontFamily: "'Courier New',monospace", fontSize: 10,
        color: 'rgba(255,255,255,0.2)', letterSpacing: '3px', pointerEvents: 'none',
      }}>
        {String(seqIdx + 1).padStart(2, '0')} / 12
      </div>

      {/* 전체화면 버튼 */}
      <motion.button
        onClick={toggleFullscreen}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
        style={{ ...btnStyle, bottom: 200 }}
      >
        <span>{isFullscreen ? '⛶' : '⛶'}</span>
        <span>{isFullscreen ? '창모드' : '전체화면'}</span>
      </motion.button>

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
        <span>자동 {autoSec}s</span>
      </motion.button>

      {/* 속도 선택 칩 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6 }}
        style={{
          position: 'fixed', right: 24, bottom: 108, zIndex: 200,
          display: 'flex', gap: 5,
        }}
      >
        {SPEED_OPTIONS.map(s => (
          <button
            key={s}
            onClick={() => { setAutoSec(s); if (!autoPlay) setAutoPlay(true); }}
            style={{
              background: autoSec === s ? 'rgba(93,202,165,0.25)' : 'rgba(8,22,14,0.7)',
              border: `1px solid ${autoSec === s ? 'rgba(93,202,165,0.6)' : 'rgba(100,170,130,0.2)'}`,
              color: autoSec === s ? '#5dcaa5' : 'rgba(125,184,160,0.5)',
              padding: '5px 10px',
              borderRadius: 99,
              cursor: 'pointer',
              fontFamily: "'Courier New',monospace",
              fontSize: 9,
              letterSpacing: '1px',
            }}
          >
            {s}s
          </button>
        ))}
      </motion.div>

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
            <div style={{
              height: '100%',
              background: 'linear-gradient(to right, #5dcaa5, #7db8a0)',
              width: `${progress * 100}%`,
              transition: 'none',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {presentMode && <PresentationMode onClose={() => setPresentMode(false)} />}
      </AnimatePresence>

      {/* 이미지 뷰어 */}
      <AnimatePresence>
        {viewer && (
          <ImageViewer
            src={viewer.src}
            onClose={closeViewer}
            onReplace={viewer.onReplace}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <ImageProvider>
      <AppInner />
    </ImageProvider>
  );
}
