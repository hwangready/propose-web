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

const CONNECTIONS = [
  { x1: 50, y1: 50,  x2: 150, y2: 50  },
  { x1: 50, y1: 50,  x2: 50,  y2: 150 },
  { x1: 150, y1: 50,  x2: 150, y2: 150 },
  { x1: 50, y1: 150, x2: 150, y2: 150 },
  { x1: 50, y1: 150, x2: 50,  y2: 250 },
  { x1: 50, y1: 250, x2: 150, y2: 250 },
];

const SECTION_CENTERS = [
  { cx: 50,  cy: 50  },
  { cx: 150, cy: 50  },
  { cx: 50,  cy: 150 },
  { cx: 150, cy: 150 },
  { cx: 50,  cy: 250 },
  { cx: 150, cy: 250 },
];

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
          background: '#080e0a',
        }}
      >
        {/* 섹션 간 점선 연결 SVG */}
        <svg
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
          viewBox="0 0 200 300"
          preserveAspectRatio="none"
        >
          {CONNECTIONS.map((c, i) => (
            <line
              key={i}
              x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
              stroke="rgba(125,184,160,0.15)"
              strokeWidth="0.3"
              strokeDasharray="2 1.6"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {SECTION_CENTERS.map((s, i) => (
            <circle
              key={i}
              cx={s.cx} cy={s.cy} r="1.4"
              fill="none"
              stroke="rgba(125,184,160,0.22)"
              strokeWidth="0.3"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {/* 섹션들 */}
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
