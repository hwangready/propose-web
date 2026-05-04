import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import type { Dir } from '../hooks/useJourneyNav';

const ARROW_POS: Record<Dir, React.CSSProperties> = {
  right:  { right: 16,    top: 'calc(50vh - 20px)' },
  left:   { left: 16,     top: 'calc(50vh - 20px)' },
  down:   { bottom: 16,   left: 'calc(50vw - 20px)' },
  up:     { top: 16,      left: 'calc(50vw - 20px)' },
};

const ARROW_GLYPH: Record<Dir, string> = {
  right: '›', left: '‹', down: '⌄', up: '⌃',
};

function Arrow({ dir, go }: { dir: Dir; go: (d: Dir) => void }) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 320, damping: 20 });
  const y = useSpring(my, { stiffness: 320, damping: 20 });
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = btnRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        mx.set(dx * 0.35);
        my.set(dy * 0.35);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mx, my]);

  return (
    <motion.div
      ref={btnRef}
      onClick={() => go(dir)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.25, background: 'rgba(255,255,255,0.15)' }}
      whileTap={{ scale: 0.9 }}
      style={{
        position: 'fixed',
        zIndex: 150,
        x,
        y,
        ...ARROW_POS[dir],
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '50%',
        color: 'rgba(255,255,255,0.55)',
        fontSize: 22,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {ARROW_GLYPH[dir]}
    </motion.div>
  );
}

interface Props {
  canGo: (dir: Dir) => boolean;
  go: (dir: Dir) => void;
}

const ALL_DIRS: Dir[] = ['right', 'left', 'down', 'up'];

export default function DirectionArrows({ canGo, go }: Props) {
  return (
    <AnimatePresence>
      {ALL_DIRS.filter(d => canGo(d)).map(dir => (
        <Arrow key={dir} dir={dir} go={go} />
      ))}
    </AnimatePresence>
  );
}
