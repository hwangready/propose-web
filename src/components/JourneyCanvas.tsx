import { useEffect } from 'react';
import { motion, useSpring, type PanInfo } from 'framer-motion';
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
}

const SECTIONS = [
  { row: 0, col: 0, key: '0-0', Component: HeroSection },
  { row: 0, col: 1, key: '0-1', Component: MeetingSection },
  { row: 1, col: 0, key: '1-0', Component: TravelSection },
  { row: 1, col: 1, key: '1-1', Component: MemoriesSection },
  { row: 2, col: 0, key: '2-0', Component: ClimaxSection },
  { row: 2, col: 1, key: '2-1', Component: FinaleSection },
];

export default function JourneyCanvas({ pos, go }: Props) {
  const x = useSpring(0, { stiffness: 150, damping: 25 });
  const y = useSpring(0, { stiffness: 150, damping: 25 });

  useEffect(() => {
    x.set(-pos[1] * window.innerWidth);
    y.set(-pos[0] * window.innerHeight);
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

    const isHoriz = absX > absY || absVX > absVY;
    const OFFSET_THRESH = 80;
    const VEL_THRESH = 400;

    if (isHoriz) {
      if (offset.x < 0 && (absVX > VEL_THRESH || absX > OFFSET_THRESH)) go('right');
      else if (offset.x > 0 && (absVX > VEL_THRESH || absX > OFFSET_THRESH)) go('left');
    } else {
      if (offset.y < 0 && (absVY > VEL_THRESH || absY > OFFSET_THRESH)) go('down');
      else if (offset.y > 0 && (absVY > VEL_THRESH || absY > OFFSET_THRESH)) go('up');
    }
  };

  return (
    <motion.div
      onPanEnd={handlePanEnd}
      style={{ position: 'fixed', inset: 0, overflow: 'hidden' }}
    >
      <motion.div
        style={{
          x,
          y,
          width: '200vw',
          height: '300vh',
          position: 'relative',
        }}
      >
        {SECTIONS.map(({ row, col, key, Component }) => (
          <div
            key={key}
            style={{
              position: 'absolute',
              left: `${col * 100}vw`,
              top: `${row * 100}vh`,
              width: '100vw',
              height: '100vh',
              overflow: 'hidden',
            }}
          >
            <Component isActive={pos[0] === row && pos[1] === col} />
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
