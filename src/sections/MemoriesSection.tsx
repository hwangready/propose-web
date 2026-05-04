import { motion } from 'framer-motion';
import HexFrame from '../components/HexFrame';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const HEX_DATA = [
  { src: '사진6.jpg', size: 140, patchColor: '#a8d5bf', top: 20,  left: 30  },
  { src: '사진7.jpg', size: 110, patchColor: '#c9e8db', top: 120, left: 155 },
  { src: '사진8.jpg', size: 95,  patchColor: '#b5d9c9', top: 10,  left: 200 },
];

export default function MemoriesSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      background: '#120d1f',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        {/* 육각형 허니콤 */}
        <div style={{ position: 'relative', height: 320 }}>
          {HEX_DATA.map((h, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5, y: isActive ? 0 : 20 }}
              transition={{ duration: isActive ? 0.6 : 0, delay: isActive ? i * 0.18 : 0, type: 'spring', stiffness: 200, damping: 16 }}
              style={{ position: 'absolute', top: h.top, left: h.left }}
            >
              <HexFrame src={h.src} size={h.size} patchColor={h.patchColor} patchOffset={7} />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.3 : 0, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="소중한 기억들" title="함께한 모든 순간">
            <p>너와 함께했던 평범한 날들이</p>
            <p style={{ marginTop: 8 }}>내 삶에서 가장 빛나는 순간들이 됐어.</p>
            <p style={{ marginTop: 8 }}>작은 것들이 전부 소중해.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
