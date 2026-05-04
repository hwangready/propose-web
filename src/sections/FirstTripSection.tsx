import { useState } from 'react';
import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';
import { useImageViewer } from '../context/ImageContext';

interface Props { isActive: boolean; step: number }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple6/500/500', caption: '설레던 출발',  rotate: -7, top: '5%',  left: '6%',  width: 220, photoHeight: 195, delay: 0    },
  { src: 'https://picsum.photos/seed/couple7/500/500', caption: '함께한 풍경', rotate:  3, top: '20%', left: '34%', width: 245, photoHeight: 215, delay: 0.18 },
  { src: 'https://picsum.photos/seed/couple8/500/500', caption: '잊지 못할 밤', rotate:  9, top:  '3%', left: '63%', width: 218, photoHeight: 192, delay: 0.36 },
];

export default function FirstTripSection({ isActive, step }: Props) {
  const { openViewer } = useImageViewer();
  const [srcs, setSrcs] = useState(PHOTOS.map(p => p.src));
  const show = (n: number) => isActive && step >= n;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1100, width: '100%', position: 'relative' }}>

        <div style={{ position: 'relative', height: 360 }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i) ? 1 : 0, y: show(i) ? 0 : 32, scale: show(i) ? 1 : 0.88 }}
              transition={{ duration: 0.7, delay: show(i) ? p.delay : 0, type: 'spring', stiffness: 130, damping: 16 }}
              whileHover={{ scale: 1.05, zIndex: 10, rotate: p.rotate * 0.3 }}
              style={{ position: 'absolute', left: p.left, top: p.top, rotate: p.rotate, zIndex: i + 1 }}
            >
              <motion.div
                animate={show(i) ? { rotate: [p.rotate - 1.5, p.rotate + 1.5, p.rotate - 1.5] } : {}}
                transition={show(i) ? { duration: 3.2 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 } : {}}
                style={{ transformOrigin: 'top center' }}
              >
                <div
                  style={{ background: '#fff', padding: '10px 10px 38px', width: p.width, boxShadow: '0 8px 28px rgba(0,0,0,0.32)', cursor: 'zoom-in' }}
                  onClick={(e) => { e.stopPropagation(); openViewer(srcs[i], newSrc => setSrcs(prev => prev.map((s, j) => j === i ? newSrc : s))); }}
                >
                  <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <img src={srcs[i]} alt="" style={{ width: '100%', height: p.photoHeight, objectFit: 'cover', display: 'block' }} />
                    <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', pointerEvents: 'none' }}>⊕</motion.div>
                  </div>
                  <div style={{ textAlign: 'center', paddingTop: 7, fontFamily: "'Dancing Script',cursive", fontSize: 15, color: '#5a7a6e' }} onClick={e => e.stopPropagation()}>
                    <EditableText>{p.caption}</EditableText>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: show(2) ? 1 : 0, y: show(2) ? 0 : 20 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
          style={{ maxWidth: 560, margin: '0 auto' }}
        >
          <TextCard pill="첫 여행" editable>
            <p><EditableText>처음으로 함께 떠난 여행,</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>모든 게 특별하게 느껴졌어.</EditableText></p>
          </TextCard>
        </motion.div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
