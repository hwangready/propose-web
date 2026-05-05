import { useState } from 'react';
import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';
import { useImageViewer } from '../context/ImageContext';

interface Props { isActive: boolean; step: number }

const GRID_PHOTOS = [
  { src: 'https://picsum.photos/seed/couple9/300/300',  delay: 0    },
  { src: 'https://picsum.photos/seed/couple10/300/300', delay: 0.12 },
  { src: 'https://picsum.photos/seed/couple11/300/300', delay: 0.24 },
  { src: 'https://picsum.photos/seed/couple12/300/300', delay: 0.36 },
];

export default function DailySection({ isActive, step }: Props) {
  const { openViewer } = useImageViewer();
  const [srcs, setSrcs] = useState(GRID_PHOTOS.map(p => p.src));
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        {/* 2×2 사진 격자 */}
        <motion.div
          animate={{ opacity: show(0) ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {GRID_PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(0) ? 1 : 0, scale: show(0) ? 1 : 0.88 }}
              transition={{ duration: 0.3, delay: show(0) ? p.delay : 0, type: 'spring', stiffness: 180, damping: 16 }}
              whileHover={{ scale: 1.03, zIndex: 2 }}
              style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.35)', cursor: 'zoom-in' }}
              onClick={(e) => { e.stopPropagation(); openViewer(srcs[i], newSrc => setSrcs(prev => prev.map((s, j) => j === i ? newSrc : s))); }}
            >
              {/* breathe 아이들 모션 */}
              <motion.div
                animate={show(0) ? { scale: [1, 1.015, 1] } : {}}
                transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.7 }}
              >
                <img src={srcs[i]} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate={{ opacity: show(1) ? 1 : 0, x: show(1) ? 0 : 50 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리의 일상" title="평범한 매일" editable>
            <p><EditableText>특별한 게 없어도</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>네가 옆에 있으면 충분해.</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>그 평범함이 제일 좋아.</EditableText></p>
          </TextCard>
        </motion.div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
