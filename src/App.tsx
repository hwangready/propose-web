import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import ImageViewer from './components/ImageViewer';
import ControlsFAB from './components/ControlsFAB';
import { ImageProvider, useImageViewer } from './context/ImageContext';
import { useJourneyNav } from './hooks/useJourneyNav';

const SECTION_NAMES = [
  '인트로', '처음 만난 날', '우리가 된 날',
  '첫 여행', '소중한 기억', '여행의 기억',
  '우리의 일상', '함께한 순간들', '매일 네 곁에',
  '앞으로의 우리', '영원히 함께', '나랑 결혼해 줄래?',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function AppInner() {
  const { pos, go, goTo, canGo, next, isLast, seqIdx, sectionStep } = useJourneyNav();
  const [presentMode, setPresentMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [autoSec, setAutoSec] = useState(3);
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { viewer, closeViewer } = useImageViewer();

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

  return (
    <>
      <CustomCursor />
      <JourneyCanvas pos={pos} go={go} canGo={canGo} next={next} sectionStep={sectionStep} />
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

      {/* 통합 FAB 컨트롤 */}
      <ControlsFAB
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        autoSec={autoSec}
        setAutoSec={setAutoSec}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onPresentMode={() => setPresentMode(true)}
        progress={progress}
        isLast={isLast}
      />

      <AnimatePresence>
        {presentMode && <PresentationMode onClose={() => setPresentMode(false)} />}
      </AnimatePresence>

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
