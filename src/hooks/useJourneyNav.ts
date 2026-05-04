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

export const SEQUENCE: [number, number][] = [
  [0, 0], // Hero
  [0, 1], // Meeting
  [1, 1], // Memories
  [1, 0], // Travel
  [2, 0], // Climax
  [2, 1], // Finale
];

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

  const seqIdx = SEQUENCE.findIndex(([r, c]) => r === pos[0] && c === pos[1]);
  const next = useCallback(() => {
    const nextPos = SEQUENCE[seqIdx + 1];
    if (nextPos) setPos(nextPos);
  }, [seqIdx]);

  const isLast = seqIdx === SEQUENCE.length - 1;

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
      if (e.key === ' ') {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, next]);

  return { pos, go, goTo, canGo, next, isLast, seqIdx };
}
