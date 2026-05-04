import { useEffect, useRef, useLayoutEffect } from 'react';
import { motion, animate, useMotionValue, type PanInfo } from 'framer-motion';
import HeroSection from '../sections/HeroSection';
import MeetingSection from '../sections/MeetingSection';
import DatingSection from '../sections/DatingSection';
import FirstTripSection from '../sections/FirstTripSection';
import MemoriesSection from '../sections/MemoriesSection';
import TravelSection from '../sections/TravelSection';
import DailySection from '../sections/DailySection';
import TogetherSection from '../sections/TogetherSection';
import ClimaxSection from '../sections/ClimaxSection';
import FutureSection from '../sections/FutureSection';
import PromiseSection from '../sections/PromiseSection';
import FinaleSection from '../sections/FinaleSection';
import type { Dir } from '../hooks/useJourneyNav';
import { SEQUENCE } from '../hooks/useJourneyNav';

interface Props {
  pos: [number, number];
  go: (dir: Dir) => void;
  canGo: (dir: Dir) => boolean;
  next: () => void;
  sectionStep: number;
}

const SECTIONS = [
  { row: 0, col: 0, key: '0-0', Component: HeroSection },
  { row: 0, col: 1, key: '0-1', Component: MeetingSection },
  { row: 0, col: 2, key: '0-2', Component: DatingSection },
  { row: 1, col: 0, key: '1-0', Component: TravelSection },
  { row: 1, col: 1, key: '1-1', Component: MemoriesSection },
  { row: 1, col: 2, key: '1-2', Component: FirstTripSection },
  { row: 2, col: 0, key: '2-0', Component: DailySection },
  { row: 2, col: 1, key: '2-1', Component: TogetherSection },
  { row: 2, col: 2, key: '2-2', Component: ClimaxSection },
  { row: 3, col: 0, key: '3-0', Component: FinaleSection },
  { row: 3, col: 1, key: '3-1', Component: PromiseSection },
  { row: 3, col: 2, key: '3-2', Component: FutureSection },
];

const PATH_SEGMENTS = [
  'M 50,50  C 100,44  150,44  150,50',   // 0→1 Hero→Meeting
  'M 150,50 C 200,44  250,44  250,50',   // 1→2 Meeting→Dating
  'M 250,50 C 253,82  253,118 250,150',  // 2→3 Dating→FirstTrip
  'M 250,150 C 200,156 150,156 150,150', // 3→4 FirstTrip→Memories
  'M 150,150 C 100,156 50,156  50,150',  // 4→5 Memories→Travel
  'M 50,150 C 47,182  47,218  50,250',   // 5→6 Travel→Daily
  'M 50,250 C 100,244 150,244 150,250',  // 6→7 Daily→Together
  'M 150,250 C 200,244 250,244 250,250', // 7→8 Together→Climax
  'M 250,250 C 253,282 253,318 250,350', // 8→9 Climax→Future
  'M 250,350 C 200,356 150,356 150,350', // 9→10 Future→Promise
  'M 150,350 C 100,356 50,356  50,350',  // 10→11 Promise→Finale
];

const WINDING_PATH = [
  'M 50,0',
  'C 50,22 50,38 50,50',
  'C 100,44 150,44 150,50',
  'C 200,44 250,44 250,50',
  'C 253,82 253,118 250,150',
  'C 200,156 150,156 150,150',
  'C 100,156 50,156 50,150',
  'C 47,182 47,218 50,250',
  'C 100,244 150,244 150,250',
  'C 200,244 250,244 250,250',
  'C 253,282 253,318 250,350',
  'C 200,356 150,356 150,350',
  'C 100,356 50,356 50,350',
  'C 50,368 50,386 50,400',
].join(' ');

const SEQ_FRACTIONS = [
  0.042, 0.125, 0.208, 0.292,
  0.375, 0.458, 0.542, 0.625,
  0.708, 0.792, 0.875, 0.958,
];

const svgToPx = (svgX: number, svgY: number) => ({
  cx: svgX * (window.innerWidth / 100),
  cy: svgY * (window.innerHeight / 100),
});

const PAN_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const PAN_DURATION = 1.1;

export default function JourneyCanvas({ pos, go, next, sectionStep }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);
  const measurePathRef = useRef<SVGPathElement>(null);

  const seqIdx = SEQUENCE.findIndex(([r, c]) => r === pos[0] && c === pos[1]);
  const safeIdx = Math.max(0, seqIdx);

  useLayoutEffect(() => {
    const { cx, cy } = svgToPx(50, 50);
    dotX.set(cx);
    dotY.set(cy);
  }, [dotX, dotY]);

  useEffect(() => {
    animate(x, -pos[1] * window.innerWidth,  { duration: PAN_DURATION, ease: PAN_EASE });
    animate(y, -pos[0] * window.innerHeight, { duration: PAN_DURATION, ease: PAN_EASE });
  }, [pos, x, y]);

  useEffect(() => {
    const onResize = () => {
      x.jump(-pos[1] * window.innerWidth);
      y.jump(-pos[0] * window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos, x, y]);

  useEffect(() => {
    const svgPath = measurePathRef.current;
    if (!svgPath) return;
    const totalLen = svgPath.getTotalLength();
    const prevFrac = safeIdx > 0 ? SEQ_FRACTIONS[safeIdx - 1] : SEQ_FRACTIONS[0];
    const curFrac  = SEQ_FRACTIONS[safeIdx];
    const fromLen  = prevFrac * totalLen;
    const toLen    = curFrac  * totalLen;
    const dur = PAN_DURATION * 1000;
    let startTs: number | null = null;
    let rafId: number;

    const animateDot = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min((ts - startTs) / dur, 1);
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const len = fromLen + (toLen - fromLen) * eased;
      const pt = svgPath.getPointAtLength(len);
      const { cx, cy } = svgToPx(pt.x, pt.y);
      dotX.set(cx);
      dotY.set(cy);
      if (t < 1) rafId = requestAnimationFrame(animateDot);
    };

    rafId = requestAnimationFrame(animateDot);
    return () => cancelAnimationFrame(rafId);
  }, [safeIdx, dotX, dotY]);

  const handlePanEnd = (_e: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const absX = Math.abs(offset.x), absY = Math.abs(offset.y);
    const absVX = Math.abs(velocity.x), absVY = Math.abs(velocity.y);
    const OT = 60, VT = 300;
    if (absX > absY || absVX > absVY) {
      if (offset.x < 0 && (absVX > VT || absX > OT)) go('right');
      else if (offset.x > 0 && (absVX > VT || absX > OT)) go('left');
    } else {
      if (offset.y < 0 && (absVY > VT || absY > OT)) go('down');
      else if (offset.y > 0 && (absVY > VT || absY > OT)) go('up');
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const tag = target.tagName;
    if (['BUTTON', 'A', 'INPUT', 'CANVAS', 'SELECT', 'TEXTAREA', 'IMG'].includes(tag)) return;
    if (target.closest('[data-editable]')) return;
    next();
  };

  return (
    <motion.div
      onPanEnd={handlePanEnd}
      onClick={handleClick}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', cursor: 'default' }}
    >
      <motion.div
        style={{
          x, y,
          width: '300vw',
          height: '400vh',
          position: 'relative',
          background: '#091510',
        }}
      >
        {/* 보드 SVG 레이어 */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 300 400"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="dots" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
              <circle cx="12.5" cy="12.5" r="0.7" fill="rgba(93,202,165,0.09)" />
            </pattern>
            <pattern id="crosshatch" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 0,25 L 25,0 M 25,50 L 50,25" stroke="rgba(93,202,165,0.04)" strokeWidth="0.5" fill="none" />
            </pattern>
            <filter id="glow-soft">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <rect width="300" height="400" fill="url(#dots)" />
          <rect width="300" height="400" fill="url(#crosshatch)" />

          <path ref={measurePathRef} d={WINDING_PATH} visibility="hidden" />

          <path d={WINDING_PATH} fill="none" stroke="rgba(93,202,165,0.07)" strokeWidth="14" vectorEffect="non-scaling-stroke" />

          {PATH_SEGMENTS.map((d, i) => {
            const visited = safeIdx > i;
            return (
              <motion.path
                key={i}
                d={d}
                fill="none"
                vectorEffect="non-scaling-stroke"
                strokeDasharray={visited ? 'none' : '4 3'}
                animate={{
                  stroke: visited ? 'rgba(93,202,165,0.88)' : 'rgba(125,184,160,0.28)',
                  strokeWidth: visited ? 2.5 : 1.6,
                  filter: visited ? 'drop-shadow(0 0 3px rgba(93,202,165,0.6))' : 'none',
                }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
              />
            );
          })}

          <path d={WINDING_PATH} fill="none" stroke="rgba(125,184,160,0.15)" strokeWidth="1.6" strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* 이동 도트 */}
        <motion.div
          style={{
            position: 'absolute', left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: '-50%', translateY: '-50%',
            width: 16, height: 16,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #8fffda 0%, #5dcaa5 60%)',
            boxShadow: '0 0 0 4px rgba(93,202,165,0.2), 0 0 20px rgba(93,202,165,0.75), 0 0 40px rgba(93,202,165,0.3)',
            zIndex: 3, pointerEvents: 'none',
          }}
        />
        <motion.div
          style={{
            position: 'absolute', left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: '-50%', translateY: '-50%',
            width: 32, height: 32,
            borderRadius: '50%',
            border: '1px solid rgba(93,202,165,0.35)',
            zIndex: 3, pointerEvents: 'none',
          }}
        />

        {/* 12개 섹션 */}
        {SECTIONS.map(({ row, col, key, Component }) => {
          const isActive = pos[0] === row && pos[1] === col;
          return (
            <div
              key={key}
              style={{
                position: 'absolute',
                left: `${col * 100}vw`,
                top: `${row * 100}vh`,
                width: '100vw',
                height: '100vh',
                zIndex: 1,
              }}
            >
              <Component isActive={isActive} step={isActive ? sectionStep : 0} />
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
