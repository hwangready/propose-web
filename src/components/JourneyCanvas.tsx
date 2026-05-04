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

// viewBox "0 0 300 400" — 3열×4행, 스네이크 경로
const WINDING_PATH = `
  M 50 0
  C 50,22 50,38 50,50
  C 100,44 150,44 150,50
  C 200,44 250,44 250,50
  C 253,82 253,118 250,150
  C 200,156 150,156 150,150
  C 100,156 50,156 50,150
  C 47,182 47,218 50,250
  C 100,244 150,244 150,250
  C 200,244 250,244 250,250
  C 253,282 253,318 250,350
  C 200,356 150,356 150,350
  C 100,356 50,356 50,350
  C 50,368 50,386 50,400
`.trim().replace(/\s+/g, ' ');

// 각 섹션의 path 상 위치 비율 (0-1) — 스네이크 순서 기준
// 전체 경로 ≈ 1200 viewBox units
const SEQ_FRACTIONS = [
  0.042, 0.125, 0.208, 0.292,
  0.375, 0.458, 0.542, 0.625,
  0.708, 0.792, 0.875, 0.958,
];

const PAN_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const PAN_DURATION = 1.1;

export default function JourneyCanvas({ pos, go, next }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 라인 진행도 (0→1, pathLength motion value)
  const pathProgress = useMotionValue(SEQ_FRACTIONS[0]);

  // 이동 중 도트 위치 (canvas px 단위)
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  // SVG path 참조 — getTotalLength / getPointAtLength
  const measurePathRef = useRef<SVGPathElement>(null);

  // 현재 시퀀스 인덱스
  const seqIdx = SEQUENCE.findIndex(([r, c]) => r === pos[0] && c === pos[1]);
  const safeIdx = Math.max(0, seqIdx);

  // 초기 도트 위치 — Hero 섹션 중심
  useLayoutEffect(() => {
    dotX.set(50 * window.innerWidth);
    dotY.set(50 * window.innerHeight);
  }, [dotX, dotY]);

  // pos 변경 시: 카메라 패닝
  useEffect(() => {
    animate(x, -pos[1] * window.innerWidth,  { duration: PAN_DURATION, ease: PAN_EASE });
    animate(y, -pos[0] * window.innerHeight, { duration: PAN_DURATION, ease: PAN_EASE });
  }, [pos, x, y]);

  // resize 시: 즉시 점프
  useEffect(() => {
    const onResize = () => {
      x.jump(-pos[1] * window.innerWidth);
      y.jump(-pos[0] * window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [pos, x, y]);

  // seqIdx 변경 시: 라인 + 도트 애니메이션
  useEffect(() => {
    // 라인 progress
    animate(pathProgress, SEQ_FRACTIONS[safeIdx], {
      duration: PAN_DURATION,
      ease: PAN_EASE,
    });

    // 도트 이동
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
      // ease-in-out cubic
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const len = fromLen + (toLen - fromLen) * eased;
      const pt = svgPath.getPointAtLength(len);
      // viewBox (0-300 × 0-400) → canvas px (0-300vw × 0-400vh)
      dotX.set(pt.x * window.innerWidth);
      dotY.set(pt.y * window.innerHeight);
      if (t < 1) rafId = requestAnimationFrame(animateDot);
    };

    rafId = requestAnimationFrame(animateDot);
    return () => cancelAnimationFrame(rafId);
  }, [safeIdx, pathProgress, dotX, dotY]);

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
    const tag = (e.target as HTMLElement).tagName;
    if (['BUTTON', 'A', 'INPUT', 'CANVAS', 'SELECT', 'TEXTAREA'].includes(tag)) return;
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
        {/* SVG 보드 레이어 */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 300 400"
          preserveAspectRatio="none"
        >
          <defs>
            <filter id="dot-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="line-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* 측정 전용 숨김 경로 */}
          <path ref={measurePathRef} d={WINDING_PATH} visibility="hidden" />

          {/* 배경 글로우 */}
          <path d={WINDING_PATH} fill="none" stroke="rgba(93,202,165,0.12)" strokeWidth="10" vectorEffect="non-scaling-stroke" />

          {/* 전체 경로 희미한 점선 (미방문 표시) */}
          <path d={WINDING_PATH} fill="none" stroke="rgba(125,184,160,0.22)" strokeWidth="1" strokeDasharray="3 2.5" vectorEffect="non-scaling-stroke" />

          {/* 진행된 경로 — 밝은 실선으로 그려짐 */}
          <motion.path
            d={WINDING_PATH}
            fill="none"
            stroke="rgba(93,202,165,0.9)"
            strokeWidth="1.8"
            vectorEffect="non-scaling-stroke"
            filter="url(#line-glow)"
            style={{ pathLength: pathProgress }}
          />
        </svg>

        {/* 이동 도트 — canvas 좌표 위에 절대 배치 */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: '-50%',
            translateY: '-50%',
            width: 14, height: 14,
            borderRadius: '50%',
            background: '#5dcaa5',
            boxShadow: '0 0 0 3px rgba(93,202,165,0.25), 0 0 16px rgba(93,202,165,0.7), 0 0 32px rgba(93,202,165,0.35)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />
        {/* 도트 외곽 링 */}
        <motion.div
          style={{
            position: 'absolute',
            left: 0, top: 0,
            x: dotX, y: dotY,
            translateX: '-50%',
            translateY: '-50%',
            width: 28, height: 28,
            borderRadius: '50%',
            border: '1px solid rgba(93,202,165,0.4)',
            zIndex: 3,
            pointerEvents: 'none',
          }}
        />

        {/* 12개 섹션 */}
        {SECTIONS.map(({ row, col, key, Component }) => (
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
            <Component isActive={pos[0] === row && pos[1] === col} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
