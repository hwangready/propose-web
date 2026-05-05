// xPositions: 집게 위치 3개 (%, string)
interface Props {
  xPositions: string[];
  isActiveRow: boolean;
  ropeColor?: string;
}

const SAG = 22; // 처짐 깊이 (px 기준, viewBox 0~100 기준으로 환산)

export default function ClotheslineRope({ xPositions, isActiveRow }: Props) {
  const ropeStroke = isActiveRow
    ? 'rgba(180,138,82,0.92)'
    : 'rgba(140,108,64,0.45)';
  const tapeOpacity = isActiveRow ? 0.65 : 0.35;

  // 3개의 집게 x 위치를 숫자(%)로 변환
  const xs = xPositions.map(p => parseFloat(p));

  return (
    <div style={{
      position: 'absolute',
      top: '18%',
      left: '-4%',
      width: '108%',
      height: 72,
      pointerEvents: 'none',
      zIndex: 3,
    }}>
      <svg
        viewBox="0 0 108 72"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      >
        {/* 그림자 */}
        <path
          d="M 4,34 Q 54,58 104,34"
          fill="none"
          stroke="rgba(0,0,0,0.18)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* 메인 로프 (처진 베지어 곡선) */}
        <path
          d="M 4,32 Q 54,54 104,32"
          fill="none"
          stroke={ropeStroke}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* 로프 하이라이트 */}
        <path
          d="M 4,30 Q 54,50 104,30"
          fill="none"
          stroke="rgba(255,230,180,0.18)"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* 왼쪽 마스킹 테이프 (라벤더 색) */}
        <rect x="0" y="26" width="13" height="10" rx="1.5"
          fill={`rgba(200,185,230,${tapeOpacity})`}
          transform="rotate(-4, 6, 31)"
        />
        <line x1="1" y1="29" x2="11" y2="29"
          stroke="rgba(160,140,200,0.3)" strokeWidth="0.6" />
        <line x1="1" y1="32" x2="11" y2="32"
          stroke="rgba(160,140,200,0.25)" strokeWidth="0.5" />

        {/* 오른쪽 마스킹 테이프 (노란 색) */}
        <rect x="95" y="26" width="13" height="10" rx="1.5"
          fill={`rgba(255,230,140,${tapeOpacity})`}
          transform="rotate(5, 101, 31)"
        />
        <line x1="96" y1="29" x2="106" y2="29"
          stroke="rgba(200,175,80,0.3)" strokeWidth="0.6" />
        <line x1="96" y1="32" x2="106" y2="32"
          stroke="rgba(200,175,80,0.25)" strokeWidth="0.5" />

        {/* 집게 위치의 수직 줄 (로프→카드) */}
        {xs.map((x, i) => {
          // viewBox 108 기준으로 x% 변환 (4% offset 포함)
          const svgX = (x / 100) * 108 + 4;
          // 로프의 처진 y값 계산 (베지어 근사: 54를 기준으로 포물선)
          const t = svgX / 108;
          const ropeY = 32 + SAG * 4 * t * (1 - t); // 베지어 중점 계산
          return (
            <line
              key={i}
              x1={svgX}
              y1={ropeY + 1}
              x2={svgX}
              y2={72}
              stroke="rgba(140,108,64,0.6)"
              strokeWidth="1.3"
              strokeDasharray="2 1"
            />
          );
        })}
      </svg>
    </div>
  );
}
