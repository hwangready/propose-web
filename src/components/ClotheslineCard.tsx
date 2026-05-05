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

export default function ClotheslineCard({ src, title, caption, rotate, isActive, seqIdx }: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const { openViewer } = useImageViewer();

  const handleImgClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openViewer(imgSrc, (newSrc) => setImgSrc(newSrc));
  };

  const CARD_W = 190;
  const PHOTO_H = 160;

  return (
    <motion.div
      animate={{
        scale: isActive ? 1 : 0.82,
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      {/* 집게 */}
      <ClipSVG color={isActive ? '#c8905a' : '#8a6540'} size={24} />

      {/* 폴라로이드 프레임 */}
      <motion.div
        whileHover={isActive ? { scale: 1.04, y: -4 } : {}}
        style={{
          background: '#fffdf8',
          padding: '8px 8px 42px',
          width: CARD_W,
          boxShadow: isActive
            ? '0 14px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(200,144,90,0.25)'
            : '0 4px 16px rgba(0,0,0,0.25)',
          transform: `rotate(${rotate}deg)`,
          position: 'relative',
          cursor: 'default',
          transition: 'box-shadow 0.4s',
        }}
      >
        <MaskingTape rotate={-7} side="left" />
        <MaskingTape rotate={6} side="right" />

        {/* 사진 영역 */}
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
              background: 'rgba(0,0,0,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, color: '#fff', pointerEvents: 'none',
            }}
          >
            ⊕
          </motion.div>
        </div>

        {/* 카드 하단 텍스트 영역 */}
        <div
          style={{ paddingTop: 10, textAlign: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 15,
              color: '#6a4e35',
              lineHeight: 1.25,
              marginBottom: 4,
            }}
          >
            <EditableText
              style={{ color: '#6a4e35', fontFamily: "'Dancing Script', cursive", fontSize: 15 }}
            >
              {title}
            </EditableText>
          </div>
          <div
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 8,
              color: 'rgba(120,90,60,0.35)',
              letterSpacing: '1.5px',
            }}
          >
            {String(seqIdx + 1).padStart(2, '0')} / 12
          </div>
        </div>
      </motion.div>

      {/* 카드 외부 캡션 */}
      <div
        style={{ marginTop: 10, textAlign: 'center', maxWidth: CARD_W + 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 11,
            color: isActive ? 'rgba(255,220,180,0.88)' : 'rgba(180,150,110,0.35)',
            letterSpacing: '1px',
            lineHeight: 1.5,
            transition: 'color 0.4s',
          }}
        >
          <EditableText
            style={{
              color: isActive ? 'rgba(255,220,180,0.88)' : 'rgba(180,150,110,0.35)',
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 11,
              letterSpacing: '1px',
            }}
          >
            {caption}
          </EditableText>
        </div>
      </div>
    </motion.div>
  );
}
