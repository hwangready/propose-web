import { useState, useEffect, useCallback } from 'react';

export type Dir = 'right' | 'left' | 'down' | 'up';

const NAV_MAP: Record<string, Partial<Record<Dir, [number, number]>>> = {
  '0,0': { right: [0, 1], down: [1, 0] },
  '0,1': { left: [0, 0], right: [0, 2], down: [1, 1] },
  '0,2': { left: [0, 1], down: [1, 2] },
  '1,0': { right: [1, 1], down: [2, 0], up: [0, 0] },
  '1,1': { left: [1, 0], right: [1, 2], up: [0, 1], down: [2, 1] },
  '1,2': { left: [1, 1], up: [0, 2], down: [2, 2] },
  '2,0': { right: [2, 1], down: [3, 0], up: [1, 0] },
  '2,1': { left: [2, 0], right: [2, 2], up: [1, 1], down: [3, 1] },
  '2,2': { left: [2, 1], up: [1, 2], down: [3, 2] },
  '3,0': { right: [3, 1], up: [2, 0] },
  '3,1': { left: [3, 0], right: [3, 2], up: [2, 1] },
  '3,2': { left: [3, 1], up: [2, 2] },
};

export const SEQUENCE: [number, number][] = [
  [0, 0], // Hero
  [0, 1], // Meeting
  [0, 2], // Dating
  [1, 2], // FirstTrip
  [1, 1], // Memories
  [1, 0], // Travel
  [2, 0], // Daily
  [2, 1], // Together
  [2, 2], // Climax
  [3, 2], // Future
  [3, 1], // Promise
  [3, 0], // Finale
];

// 각 섹션 내부에서 클릭으로 순차적으로 보여줄 최대 단계 수
export const SECTION_MAX_STEPS: Record<string, number> = {
  '0,0': 4, // Hero: photo1(1) → photo2(2) → photo3(3) → center sticker(4)
  '0,1': 3, // Meeting: textcard(1) → polaroid1(2) → polaroid2(3)
  '0,2': 3, // Dating: textcard(1) → polaroid1(2) → polaroid2(3)
  '1,2': 3, // FirstTrip: photo1(1) → photo2(2) → photo3+textcard(3)
  '1,1': 3, // Memories: polaroid1(1) → polaroid2(2) → polaroid3+textcard(3)
  '1,0': 3, // Travel: photo1(1) → photo2(2) → photo3+textcard(3)
  '2,0': 2, // Daily: photos(1) → textcard(2)
  '2,1': 3, // Together: hex1(1) → hex2(2) → hex3+textcard(3)
  '2,2': 0, // Climax: TextFlippingBoard 자동 루프, 클릭 시 바로 다음 섹션
  '3,2': 4, // Future: subtitle(1) → line1(2) → line2(3) → line3(4)
  '3,1': 2, // Promise: heart+maintext(1) → bodytext(2)
  '3,0': 2, // Finale: card(1) → buttons(2)
};

export function useJourneyNav(enabled = true) {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [sectionStep, setSectionStep] = useState(0);

  const canGo = useCallback(
    (dir: Dir) => !!NAV_MAP[`${pos[0]},${pos[1]}`]?.[dir],
    [pos]
  );

  const go = useCallback(
    (dir: Dir) => {
      const nextPos = NAV_MAP[`${pos[0]},${pos[1]}`]?.[dir];
      if (nextPos) { setPos(nextPos); setSectionStep(0); }
    },
    [pos]
  );

  const goTo = useCallback((row: number, col: number) => {
    setPos([row, col]);
    setSectionStep(0);
  }, []);

  const seqIdx = SEQUENCE.findIndex(([r, c]) => r === pos[0] && c === pos[1]);

  const next = useCallback(() => {
    const key = `${pos[0]},${pos[1]}`;
    const maxSteps = SECTION_MAX_STEPS[key] ?? 0;
    if (sectionStep < maxSteps) {
      setSectionStep(s => s + 1);
    } else {
      setSectionStep(0);
      const nextPos = SEQUENCE[seqIdx + 1];
      if (nextPos) setPos(nextPos);
    }
  }, [seqIdx, sectionStep, pos]);

  const nextSection = useCallback(() => {
    setSectionStep(0);
    const nextPos = SEQUENCE[seqIdx + 1];
    if (nextPos) setPos(nextPos);
  }, [seqIdx]);

  const goToSeq = useCallback((idx: number) => {
    const p = SEQUENCE[Math.max(0, Math.min(SEQUENCE.length - 1, idx))];
    if (p) { setPos(p); setSectionStep(0); }
  }, []);

  const prevSection = useCallback(() => {
    setSectionStep(0);
    const prevPos = SEQUENCE[seqIdx - 1];
    if (prevPos) setPos(prevPos);
  }, [seqIdx]);

  const isLast = seqIdx === SEQUENCE.length - 1;

  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const map: Record<string, Dir> = {
        ArrowRight: 'right', ArrowLeft: 'left',
        ArrowDown: 'down', ArrowUp: 'up',
      };
      const dir = map[e.key];
      if (dir) { e.preventDefault(); go(dir); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, enabled]);

  return { pos, go, goTo, goToSeq, canGo, next, nextSection, prevSection, isLast, seqIdx, sectionStep };
}
