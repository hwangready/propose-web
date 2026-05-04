import { motion } from 'framer-motion';
import HexFrame from '../components/HexFrame';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const HEX_DATA = [
  { src: 'https://picsum.photos/seed/couple6/400/400', size: 140, patchColor: '#a8d5bf', top: 20,  left: 30  },
  { src: 'https://picsum.photos/seed/couple7/400/400', size: 110, patchColor: '#c9e8db', top: 120, left: 155 },
  { src: 'https://picsum.photos/seed/couple8/400/400', size: 95,  patchColor: '#b5d9c9', top: 10,  left: 200 },
];

export default function MemoriesSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <div style={{ position: 'relative', height: 320 }}>
          {HEX_DATA.map((h, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i) ? 1 : 0, scale: show(i) ? 1 : 0.5, y: show(i) ? 0 : 20 }}
              transition={{ duration: 0.6, delay: show(i) ? i * 0.12 : 0, type: 'spring', stiffness: 200, damping: 16 }}
              style={{ position: 'absolute', top: h.top, left: h.left }}
            >
              <HexFrame src={h.src} size={h.size} patchColor={h.patchColor} patchOffset={7} idleIndex={i} />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: show(2) ? 1 : 0, x: show(2) ? 0 : 50 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="소중한 기억들" title="함께한 모든 순간" editable>
            <p><EditableText>너와 함께했던 평범한 날들이</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>내 삶에서 가장 빛나는 순간들이 됐어.</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>작은 것들이 전부 소중해.</EditableText></p>
          </TextCard>
        </motion.div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
