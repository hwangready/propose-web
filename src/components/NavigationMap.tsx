import { motion } from 'framer-motion';

interface Props {
  pos: [number, number];
  goTo: (row: number, col: number) => void;
}

const CELLS: [number, number][] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1],
  [2, 0], [2, 1],
];

export default function NavigationMap({ pos, goTo }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        zIndex: 200,
        background: 'rgba(0,0,0,0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderRadius: 8,
        padding: 10,
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 8px)',
        gridTemplateRows: 'repeat(3, 8px)',
        gap: 6,
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {CELLS.map(([r, c]) => {
        const isActive = pos[0] === r && pos[1] === c;
        return (
          <motion.div
            key={`${r}-${c}`}
            onClick={() => goTo(r, c)}
            animate={{
              scale: isActive ? 1.4 : 1,
              backgroundColor: isActive ? '#7db8a0' : 'rgba(255,255,255,0.25)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              cursor: 'pointer',
              gridColumn: c + 1,
              gridRow: r + 1,
            }}
          />
        );
      })}
    </div>
  );
}
