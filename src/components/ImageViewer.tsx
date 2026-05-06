import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  src: string;
  onClose: () => void;
  onReplace: (newSrc: string) => void;
}

export default function ImageViewer({ src, onClose, onReplace }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onReplace(reader.result as string); onClose(); };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <motion.div
        initial={{ scale: 0.85, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 30 }}
        transition={{ type: 'spring', stiffness: 220, damping: 18 }}
        onClick={e => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}
      >
        <img
          src={src}
          alt=""
          style={{
            maxWidth: '80vw', maxHeight: '70vh',
            borderRadius: 8,
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            objectFit: 'contain',
          }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: 'rgba(125,184,160,0.18)',
              border: '1px solid rgba(125,184,160,0.4)',
              color: '#9ecfba',
              padding: '10px 24px',
              borderRadius: 99,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: "'Noto Sans KR',sans-serif",
              letterSpacing: '0.5px',
            }}
          >
            📁 사진 교체
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.5)',
              padding: '10px 24px',
              borderRadius: 99,
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: "'Noto Sans KR',sans-serif",
            }}
          >
            닫기
          </button>
        </div>
      </motion.div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </motion.div>
  );
}
