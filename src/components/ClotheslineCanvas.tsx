import { useEffect } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import ClotheslineCard from './ClotheslineCard';
import ClotheslineRope from './ClotheslineRope';
import ClotheslineDecorations from './ClotheslineDecorations';
import { CLOTHESLINE_CARDS } from '../config/clotheslineData';

interface Props {
  seqIdx: number;
  nextSection: () => void;
}

const ROW_HEIGHT = 380;
const TOP_OFFSET = 100;
const PAN_EASE = [0.25, 0.46, 0.45, 0.94] as const;

const ROWS = [
  { seqIndices: [0, 1, 2],   xPositions: ['15%', '50%', '85%'] as string[] },
  { seqIndices: [3, 4, 5],   xPositions: ['85%', '50%', '15%'] as string[] },
  { seqIndices: [6, 7, 8],   xPositions: ['15%', '50%', '85%'] as string[] },
  { seqIndices: [9, 10, 11], xPositions: ['85%', '50%', '15%'] as string[] },
];

// 지그재그 연결선: 각 행 끝→다음 행 시작
const ZIGZAG_LINES = [
  { x: '85%', y1: ROW_HEIGHT * 0 + TOP_OFFSET + 200, y2: ROW_HEIGHT * 1 + TOP_OFFSET + 40 },
  { x: '15%', y1: ROW_HEIGHT * 1 + TOP_OFFSET + 200, y2: ROW_HEIGHT * 2 + TOP_OFFSET + 40 },
  { x: '85%', y1: ROW_HEIGHT * 2 + TOP_OFFSET + 200, y2: ROW_HEIGHT * 3 + TOP_OFFSET + 40 },
];

function BranchSVG() {
  return (
    <svg
      viewBox="0 0 1000 70"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 70, pointerEvents: 'none' }}
      preserveAspectRatio="none"
    >
      {/* 메인 가지 */}
      <rect x="50" y="28" width="900" height="10" rx="5" fill="#8B5E3C" opacity="0.85" />
      {/* 나뭇결 */}
      <line x1="50" y1="31" x2="950" y2="31" stroke="rgba(200,160,100,0.25)" strokeWidth="1.5" />
      <line x1="50" y1="35" x2="950" y2="35" stroke="rgba(80,40,10,0.18)" strokeWidth="1" />
      {/* 잎사귀 */}
      {[80, 150, 230, 320, 410, 500, 590, 680, 760, 850, 920].map((x) => (
        <g key={x} transform={`translate(${x}, 28)`}>
          <path
            d={`M 0,0 Q ${x % 2 === 0 ? -12 : 12},-18 0,-32 Q ${x % 2 === 0 ? 10 : -10},-18 0,0`}
            fill="#5a9a70"
            opacity={0.55 + (x % 3) * 0.08}
            transform={`rotate(${x % 2 === 0 ? -25 : 25})`}
          />
        </g>
      ))}
      {/* 줄 3개 */}
      <line x1="200" y1="38" x2="200" y2="70" stroke="#8B5E3C" strokeWidth="2" opacity="0.6" />
      <line x1="500" y1="38" x2="500" y2="70" stroke="#8B5E3C" strokeWidth="2" opacity="0.6" />
      <line x1="800" y1="38" x2="800" y2="70" stroke="#8B5E3C" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

export default function ClotheslineCanvas({ seqIdx, nextSection }: Props) {
  const y = useMotionValue(0);
  const activeRow = Math.floor(seqIdx / 3);

  useEffect(() => {
    const targetY = -(activeRow * ROW_HEIGHT + TOP_OFFSET / 2);
    animate(y, targetY, { duration: 0.7, ease: PAN_EASE });
  }, [activeRow, y]);

  const totalH = 4 * ROW_HEIGHT + TOP_OFFSET + 80;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: 'linear-gradient(170deg, #2a1a0e 0%, #1c1208 40%, #0e1820 100%)',
        cursor: 'pointer',
      }}
      onClick={nextSection}
    >
      <motion.div
        style={{
          y,
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: totalH,
        }}
      >
        {/* 배경 장식 */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ClotheslineDecorations />
        </div>

        {/* 상단 가지 */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: TOP_OFFSET }}>
          <BranchSVG />
        </div>

        {/* 지그재그 연결선 */}
        {ZIGZAG_LINES.map((line, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: line.x,
              top: line.y1,
              width: 0,
              height: line.y2 - line.y1,
              borderLeft: '1.5px dashed rgba(140,108,64,0.45)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* 4개 행 */}
        {ROWS.map((row, rowIdx) => {
          const rowTop = rowIdx * ROW_HEIGHT + TOP_OFFSET;
          const isActiveRow = activeRow === rowIdx;

          return (
            <div
              key={rowIdx}
              style={{ position: 'absolute', top: rowTop, left: 0, width: '100%', height: ROW_HEIGHT }}
            >
              {/* 로프 */}
              <ClotheslineRope
                xPositions={row.xPositions}
                isActiveRow={isActiveRow}
              />

              {/* 카드 3장 */}
              {row.seqIndices.map((cardSeqIdx, colIdx) => {
                const xPos = row.xPositions[colIdx];
                const cardData = CLOTHESLINE_CARDS[cardSeqIdx];
                const isActive = seqIdx === cardSeqIdx;

                return (
                  <div
                    key={cardSeqIdx}
                    style={{
                      position: 'absolute',
                      left: xPos,
                      top: '30%',
                      transform: 'translateX(-50%)',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ClotheslineCard
                      {...cardData}
                      isActive={isActive}
                      seqIdx={cardSeqIdx}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </motion.div>

      {/* 진행 카운터 */}
      <div
        style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200,
          fontFamily: "'Courier New', monospace",
          fontSize: 10,
          color: 'rgba(255,220,180,0.35)',
          letterSpacing: '3px',
          pointerEvents: 'none',
        }}
      >
        {String(seqIdx + 1).padStart(2, '0')} / 12
      </div>
    </div>
  );
}
