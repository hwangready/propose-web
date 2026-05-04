import { useState, useEffect, useCallback } from 'react';

export type Dir = 'right' | 'left' | 'down' | 'up';

const NAV_MAP: Record<string, Partial<Record<Dir, [number, number]>>> = {
  '0,0': { right: [0, 1], down: [1, 0] },
  '0,1': { left: [0, 0], down: [1, 1] },
  '1,0': { right: [1, 1], down: [2, 0], up: [0, 0] },
  '1,1': { left: [1, 0], up: [0, 1] },
  '2,0': { right: [2, 1], up: [1, 0] },
  '2,1': { left: [2, 0], up: [1, 0] },
};

export function useJourneyNav() {
  const [pos, setPos] = useState<[number, number]>([0, 0]);

  const canGo = useCallback(
    (dir: Dir) => !!NAV_MAP[`${pos[0]},${pos[1]}`]?.[dir],
    [pos]
  );

  const go = useCallback(
    (dir: Dir) => {
      const next = NAV_MAP[`${pos[0]},${pos[1]}`]?.[dir];
      if (next) setPos(next);
    },
    [pos]
  );

  const goTo = useCallback((row: number, col: number) => {
    setPos([row, col]);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowRight: 'right',
        ArrowLeft: 'left',
        ArrowDown: 'down',
        ArrowUp: 'up',
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        go(dir);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return { pos, go, goTo, canGo };
}
