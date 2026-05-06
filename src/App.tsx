import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import ImageViewer from './components/ImageViewer';
import ControlsFAB from './components/ControlsFAB';
import IntroConfigModal from './components/IntroConfigModal';
import ClotheslineCanvas from './components/ClotheslineCanvas';
import ScrapbookCanvas from './components/ScrapbookCanvas';
import GoogleIntro from './screens/GoogleIntro';
import ChatGPTIntro from './screens/ChatGPTIntro';
import ModeSelectScreen from './screens/ModeSelectScreen';
import { loadIntroConfig } from './config/introConfig';
import { ImageProvider, useImageViewer } from './context/ImageContext';
import { useJourneyNav } from './hooks/useJourneyNav';

type Phase = 'google' | 'chatgpt' | 'select' | 'journey';
type CanvasMode = 'journey' | 'clothesline' | 'scrapbook';

const SECTION_NAMES = [
  '인트로', '처음 만난 날', '우리가 된 날',
  '첫 여행', '소중한 기억', '여행의 기억',
  '우리의 일상', '함께한 순간들', '매일 네 곁에',
  '앞으로의 우리', '영원히 함께', '나랑 결혼해 줄래?',
];

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

function AppInner() {
  const introConfig = useMemo(() => loadIntroConfig(), []);
  const [phase, setPhase] = useState<Phase>(introConfig.enabled ? introConfig.introMode : 'journey');
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [canvasMode, setCanvasMode] = useState<CanvasMode>('journey');
  const { pos, go, goTo, goToSeq, canGo, next, nextSection, prevSection, isLast, seqIdx, sectionStep } = useJourneyNav(phase === 'journey' && canvasMode === 'journey');
  const [presentMode, setPresentMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [autoSec, setAutoSec] = useState(3);
  const [scrapSlideIdx, setScrapSlideIdx] = useState(0);
  const [scrapPageCount, setScrapPageCount] = useState(12);
  const effectiveIsLast = canvasMode === 'scrapbook'
    ? scrapSlideIdx >= scrapPageCount - 1
    : isLast;
  const [progress, setProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBar, setShowBar] = useState(true);
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

  // Spacebar toggles play/pause; arrow keys navigate clothesline/scrapbook
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (phase !== 'journey') return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setAutoPlay(p => !p); }
      if (canvasMode === 'scrapbook') {
        if (e.key === 'ArrowRight') { e.preventDefault(); setScrapSlideIdx(i => Math.min(i + 1, scrapPageCount - 1)); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setScrapSlideIdx(i => Math.max(0, i - 1)); }
      } else if (canvasMode !== 'journey') {
        if (e.key === 'ArrowRight') { e.preventDefault(); nextSection(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); prevSection(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, canvasMode, nextSection, prevSection, scrapPageCount]);

  useEffect(() => {
    if (phase !== 'journey' || !autoPlay || effectiveIsLast) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!autoPlay) setProgress(0);
      return;
    }
    // Climax section (2,2) holds for 18s to show all 3 flip messages
    const effectiveSec = canvasMode !== 'journey'
      ? autoSec
      : (pos[0] === 2 && pos[1] === 2 ? 18 : autoSec);

    setProgress(0);
    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const pct = Math.min(elapsed / effectiveSec, 1);
      setProgress(pct);
      if (pct < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    intervalRef.current = setInterval(() => {
      if (canvasMode === 'scrapbook') {
        setScrapSlideIdx(i => Math.min(i + 1, scrapPageCount - 1));
      } else if (canvasMode !== 'journey') {
        nextSection();
      } else {
        next();
      }
      startTimeRef.current = performance.now();
      setProgress(0);
    }, effectiveSec * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [autoPlay, autoSec, pos, effectiveIsLast, next, nextSection, phase, canvasMode, scrapPageCount]);

  return (
    <>
      {phase === 'journey' && canvasMode === 'journey' && <CustomCursor />}
      {canvasMode === 'journey'
        ? <JourneyCanvas pos={pos} go={go} canGo={canGo} next={next} sectionStep={sectionStep} />
        : canvasMode === 'clothesline'
        ? <ClotheslineCanvas seqIdx={seqIdx} nextSection={nextSection} />
        : <ScrapbookCanvas
            seqIdx={scrapSlideIdx}
            nextSection={() => setScrapSlideIdx(i => Math.min(i + 1, scrapPageCount - 1))}
            setAutoPlay={setAutoPlay}
            goToFirst={() => setScrapSlideIdx(0)}
            onPageCountChange={(count) => {
              setScrapPageCount(count);
              setScrapSlideIdx(i => Math.min(i, count - 1));
            }}
            onSlideIdxChange={setScrapSlideIdx}
          />
      }
      {canvasMode === 'journey' && <NavigationMap pos={pos} goTo={goTo} />}
      {canvasMode === 'journey' && <DirectionArrows canGo={canGo} go={go} />}

      {/* 그레인 텍스처 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1000, pointerEvents: 'none',
        opacity: 0.045,
        backgroundImage: GRAIN_SVG,
        backgroundRepeat: 'repeat',
        backgroundSize: '180px 180px',
      }} />

      {/* 페이지 번호 — 상단 좌측 */}
      {(() => {
        const dispIdx   = canvasMode === 'scrapbook' ? scrapSlideIdx  : seqIdx;
        const dispTotal = canvasMode === 'scrapbook' ? scrapPageCount : 12;
        const dispName  = canvasMode === 'scrapbook' ? ''             : SECTION_NAMES[seqIdx];
        return (
          <AnimatePresence mode="wait">
            <motion.div
              key={dispIdx}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4 }}
              style={{
                position: 'fixed', top: 28, left: 32, zIndex: 200,
                fontFamily: "'Courier New',monospace", fontSize: 11,
                color: canvasMode === 'journey' ? 'rgba(125,184,160,0.75)' : 'rgba(70,42,18,0.75)',
                letterSpacing: '2px', pointerEvents: 'none',
                textShadow: canvasMode !== 'journey' ? '0 1px 4px rgba(255,255,255,0.9)' : 'none',
              }}
            >
              {String(dispIdx + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(dispTotal).padStart(2, '0')}
              {dispName && <span style={{ opacity: 0.6, marginLeft: 8 }}>{dispName}</span>}
            </motion.div>
          </AnimatePresence>
        );
      })()}

      {/* 하단 바 토글 버튼 (항상 표시) */}
      <div style={{
        position: 'fixed', bottom: 6, left: '50%', transform: 'translateX(-50%)',
        zIndex: 201, display: 'flex', justifyContent: 'center',
      }}>
        <button
          onClick={() => setShowBar(p => !p)}
          style={{
            background: 'rgba(12,8,4,0.72)', border: '1px solid rgba(200,160,100,0.22)',
            borderRadius: 16, color: 'rgba(200,160,100,0.85)', fontSize: 14, cursor: 'pointer',
            padding: '5px 20px', letterSpacing: '1px',
            fontFamily: "'Courier New',monospace",
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          }}
        >
          {showBar ? '▾' : '▴'}
        </button>
      </div>

      {/* 하단 중앙 재생/정지 + 속도 컨트롤 */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.22 }}
            style={{
              position: 'fixed', bottom: 22, left: 0, right: 0,
              zIndex: 200, display: 'flex', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(12,8,4,0.75)', backdropFilter: 'blur(10px)',
              border: '1px solid rgba(200,160,100,0.14)',
              borderRadius: 40, padding: '7px 16px',
              pointerEvents: 'auto',
            }}>
              {/* 진행 바 */}
              <div style={{ width: 60, height: 2, background: 'rgba(255,255,255,0.08)', borderRadius: 1, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${progress * 100}%` }}
                  transition={{ duration: 0.1 }}
                  style={{ height: '100%', background: 'rgba(200,144,90,0.7)', borderRadius: 1 }}
                />
              </div>

              {/* 재생/정지 버튼 */}
              <button
                onClick={() => setAutoPlay(p => !p)}
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: 'none',
                  background: autoPlay ? 'rgba(200,144,90,0.18)' : 'rgba(93,201,165,0.18)',
                  color: autoPlay ? '#c8905a' : '#5dc9a5',
                  cursor: 'pointer', fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  outline: 'none',
                }}
              >
                {autoPlay ? '⏸' : '▶'}
              </button>

              {/* 구분선 */}
              <div style={{ width: 1, height: 16, background: 'rgba(200,160,100,0.18)' }} />

              {/* 속도 조절 */}
              <span style={{ fontFamily: "'Courier New',monospace", fontSize: 9, color: 'rgba(180,140,90,0.45)', letterSpacing: '1px' }}>
                SPD
              </span>
              {[1, 3, 5, 8].map(s => (
                <button
                  key={s}
                  onClick={() => setAutoSec(s)}
                  style={{
                    height: 22, minWidth: 26, paddingInline: 6,
                    borderRadius: 11, border: 'none',
                    background: autoSec === s ? 'rgba(200,144,90,0.38)' : 'transparent',
                    color: autoSec === s ? '#c8905a' : 'rgba(200,160,100,0.35)',
                    fontFamily: "'Courier New',monospace", fontSize: 10,
                    cursor: 'pointer', outline: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                >
                  {s}s
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 통합 FAB 컨트롤 */}
      <ControlsFAB
        autoPlay={autoPlay}
        setAutoPlay={setAutoPlay}
        autoSec={autoSec}
        setAutoSec={setAutoSec}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        onPresentMode={() => setPresentMode(true)}
        onIntroConfig={() => setShowIntroModal(true)}
        progress={progress}
        isLast={effectiveIsLast}
        canvasMode={canvasMode}
        onModeToggle={() => setCanvasMode(m => m === 'journey' ? 'clothesline' : m === 'clothesline' ? 'scrapbook' : 'journey')}
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

      {/* 인트로/선택 중 journey 완전 차단 */}
      {phase !== 'journey' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9990, background: '#0a0806' }} />
      )}

      {/* 인트로 + 모드 선택 오버레이 */}
      <AnimatePresence mode="wait">
        {phase === 'google' && (
          <motion.div key="google" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <GoogleIntro config={introConfig} onNext={() => setPhase('select')} />
          </motion.div>
        )}
        {phase === 'chatgpt' && (
          <motion.div key="chatgpt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <ChatGPTIntro config={introConfig} onStart={() => setPhase('select')} />
          </motion.div>
        )}
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <ModeSelectScreen onSelect={(mode) => { setCanvasMode(mode); setPhase('journey'); goToSeq(0); setScrapSlideIdx(0); }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인트로 설정 모달 */}
      <AnimatePresence>
        {showIntroModal && <IntroConfigModal onClose={() => setShowIntroModal(false)} />}
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
