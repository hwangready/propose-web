import { useEffect } from 'react';
import { motion, animate, useMotionValue, type PanInfo } from 'framer-motion';
import HeroSection from '../sections/HeroSection';
import MeetingSection from '../sections/MeetingSection';
import TravelSection from '../sections/TravelSection';
import MemoriesSection from '../sections/MemoriesSection';
import ClimaxSection from '../sections/ClimaxSection';
import FinaleSection from '../sections/FinaleSection';
import type { Dir } from '../hooks/useJourneyNav';

interface Props {
  pos: [number, number];
  go: (dir: Dir) => void;
  canGo: (dir: Dir) => boolean;
  next: () => void;
}

const SECTIONS = [
  { row: 0, col: 0, key: '0-0', Component: HeroSection },
  { row: 0, col: 1, key: '0-1', Component: MeetingSection },
  { row: 1, col: 0, key: '1-0', Component: TravelSection },
  { row: 1, col: 1, key: '1-1', Component: MemoriesSection },
  { row: 2, col: 0, key: '2-0', Component: ClimaxSection },
  { row: 2, col: 1, key: '2-1', Component: FinaleSection },
];

// viewBox "0 0 200 300" — 각 섹션은 100×100 단위
// SEQUENCE 순서로 흐르는 구불구불한 경로:
// Hero(50,50) → Meeting(150,50) → Memories(150,150) → Travel(50,150) → Climax(50,250) → Finale(150,250)
const WINDING_PATH = `
  M 50 0
  C 50,22 50,38 50,50
  C 80,44 120,44 150,50
  C 153,82 153,118 150,150
  C 120,156 80,156 50,150
  C 47,182 47,218 50,250
  C 80,244 120,244 150,250
  C 150,268 150,286 150,300
`.trim().replace(/\s+/g, ' ');

const PAN_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const PAN_DURATION = 1.1;

export default function JourneyCanvas({ pos, go, next }: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

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

  const handlePanEnd = (_e: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    const absX = Math.abs(offset.x);
    const absY = Math.abs(offset.y);
    const absVX = Math.abs(velocity.x);
    const absVY = Math.abs(velocity.y);
    const OFFSET_THRESH = 60;
    const VEL_THRESH = 300;

    if (absX > absY || absVX > absVY) {
      if (offset.x < 0 && (absVX > VEL_THRESH || absX > OFFSET_THRESH)) go('right');
      else if (offset.x > 0 && (absVX > VEL_THRESH || absX > OFFSET_THRESH)) go('left');
    } else {
      if (offset.y < 0 && (absVY > VEL_THRESH || absY > OFFSET_THRESH)) go('down');
      else if (offset.y > 0 && (absVY > VEL_THRESH || absY > OFFSET_THRESH)) go('up');
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
          x,
          y,
          width: '200vw',
          height: '300vh',
          position: 'relative',
          // 전체 보드 공통 배경 — 섹션마다 다른 배경 없음
          background: '#091510',
        }}
      >
        {/* 구불구불한 점선 경로 — 모든 섹션을 하나로 연결 */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0,
          }}
          viewBox="0 0 200 300"
          preserveAspectRatio="none"
        >
          {/* 배경 글로우 경로 (두껍고 흐릿한 레이어) */}
          <path
            d={WINDING_PATH}
            fill="none"
            stroke="rgba(93,202,165,0.06)"
            strokeWidth="4"
            vectorEffect="non-scaling-stroke"
          />
          {/* 메인 점선 경로 */}
          <path
            d={WINDING_PATH}
            fill="none"
            stroke="rgba(125,184,160,0.4)"
            strokeWidth="0.5"
            strokeDasharray="3 2.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 섹션들 — 개별 배경 없이 캔버스 위에 플로팅 */}
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
