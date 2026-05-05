import { useState } from 'react';
import { motion } from 'framer-motion';
import { useImageViewer } from '../context/ImageContext';
import EditableText from './EditableText';
import ClipSVG from './ClipSVG';
import type { ClotheslineCardData } from '../config/clotheslineData';

interface Props extends ClotheslineCardData {
  isActive: boolean;
  seqIdx: number;
}

function MaskingTape({ rotate, side }: { rotate: number; side: 'left' | 'right' }) {
  const colors = [
    'rgba(200,185,230,0.55)',
    'rgba(255,230,140,0.55)',
    'rgba(180,220,200,0.5)',
    'rgba(255,200,180,0.5)',
  ];
  const color = colors[Math.abs(rotate) % colors.length];
  return (
    <div style={{
      position: 'absolute',
      [side]: -8,
      top: -10,
      width: 38,
      height: 13,
      background: color,
      borderRadius: 2,
      transform: `rotate(${rotate}deg)`,
      zIndex: 5,
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.3)',
    }} />
  );
}

export const CARD_W = 300;
const PHOTO_H = 250;

export default function ClotheslineCard({ src, title, caption, rotate, isActive, seqIdx }: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const { openViewer } = useImageViewer();

  const handleImgClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openViewer(imgSrc, (newSrc) => setImgSrc(newSrc));
  };

  return (
    // 전체 카드를 clip 상단 기준으로 회전 + 스케일 (집게가 줄 위에 유지됨)
    <motion.div
      animate={{
        scale: isActive ? 1.5 : 0.84,
        opacity: isActive ? 1 : 0.52,
        rotate: rotate,
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        transformOrigin: 'top center', // 집게 위치를 기준으로 변환
      }}
    >
      {/* 집게 */}
      <ClipSVG color={isActive ? '#c8905a' : '#8a6540'} size={28} />

      {/* 폴라로이드 프레임 */}
      <motion.div
        whileHover={isActive ? { scale: 1.03, y: -5 } : {}}
        style={{
          background: '#fffdf8',
          padding: '10px 10px 52px',
          width: CARD_W,
          boxShadow: isActive
            ? '0 18px 50px rgba(0,0,0,0.5), 0 6px 16px rgba(200,144,90,0.28)'
            : '0 6px 20px rgba(0,0,0,0.28)',
          position: 'relative',
          cursor: 'default',
          transition: 'box-shadow 0.4s',
        }}
      >
        {isActive && (
          <div style={{
            position: 'absolute',
            top: -18, left: -22, right: -22, bottom: -18,
            borderRadius: 6,
            boxShadow: '0 0 32px rgba(255,200,80,0.65), 0 0 72px rgba(255,60,180,0.45), 0 0 130px rgba(100,200,255,0.28)',
            zIndex: -1,
            pointerEvents: 'none',
          }} />
        )}
        <MaskingTape rotate={-7} side="left" />
        <MaskingTape rotate={6} side="right" />

        {/* 사진 */}
        <div
          style={{ position: 'relative', overflow: 'hidden', cursor: 'zoom-in' }}
          onClick={handleImgClick}
        >
          <img
            src={imgSrc}
            alt={title}
            style={{ width: '100%', height: PHOTO_H, objectFit: 'cover', display: 'block' }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, color: '#fff', pointerEvents: 'none',
            }}
          >
            ⊕
          </motion.div>
        </div>

        {/* 하단 텍스트 */}
        <div
          style={{ paddingTop: 12, textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 18, color: '#6a4e35', lineHeight: 1.25, marginBottom: 4 }}>
            <EditableText style={{ color: '#6a4e35', fontFamily: "'Dancing Script', cursive", fontSize: 18 }}>
              {title}
            </EditableText>
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: 8, color: 'rgba(120,90,60,0.35)', letterSpacing: '1.5px' }}>
            {String(seqIdx + 1).padStart(2, '0')} / 12
          </div>
        </div>
      </motion.div>

      {/* 외부 캡션 */}
      <div
        style={{ marginTop: 12, textAlign: 'center', maxWidth: CARD_W + 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <EditableText
          style={{
            color: isActive ? 'rgba(255,220,180,0.9)' : 'rgba(180,150,110,0.3)',
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 12,
            letterSpacing: '1.2px',
            lineHeight: '1.6',
            transition: 'color 0.4s',
          }}
        >
          {caption}
        </EditableText>
      </div>
    </motion.div>
  );
}
