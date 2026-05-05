interface Props {
  color?: string;
  size?: number;
}

export default function ClipSVG({ color = '#c8905a', size = 26 }: Props) {
  return (
    <svg
      viewBox="0 0 28 52"
      width={size}
      height={size * 1.86}
      style={{ display: 'block', marginBottom: -4, position: 'relative', zIndex: 10 }}
    >
      {/* 스프링 힌지 (상단 타원) */}
      <ellipse cx="14" cy="8" rx="9" ry="6"
        fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* 왼쪽 집게 팔 */}
      <path d="M 5,10 L 3,44 Q 3,48 8,48 L 13,48 L 14,22 Z"
        fill={color} opacity="0.88" />
      {/* 오른쪽 집게 팔 */}
      <path d="M 23,10 L 25,44 Q 25,48 20,48 L 15,48 L 14,22 Z"
        fill={color} opacity="0.88" />
      {/* 하단 받침 */}
      <line x1="8" y1="48" x2="20" y2="48"
        stroke={color} strokeWidth="2.2" strokeLinecap="round" />
      {/* 하이라이트 (빛 반사) */}
      <path d="M 8,12 Q 14,16 20,12"
        fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
      {/* 목재 결 느낌 선 */}
      <line x1="6" y1="28" x2="12" y2="30"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
      <line x1="16" y1="28" x2="22" y2="30"
        stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
    </svg>
  );
}
