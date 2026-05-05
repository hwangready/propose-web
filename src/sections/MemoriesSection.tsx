import { motion } from 'framer-motion';
import PolaroidFrame from '../components/PolaroidFrame';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple6/400/400', caption: '소중한 순간', rotate: -8, top: 0,   left: 8,   width: 268, photoHeight: 238 },
  { src: 'https://picsum.photos/seed/couple7/400/400', caption: '함께한 날',   rotate:  5, top: 90,  left: 188, width: 252, photoHeight: 224 },
  { src: 'https://picsum.photos/seed/couple8/400/400', caption: '기억할게',    rotate: -3, top: 215, left: 52,  width: 260, photoHeight: 230 },
];

export default function MemoriesSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <div style={{ position: 'relative', height: 510 }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i) ? 1 : 0, scale: show(i) ? 1 : 0.55, y: show(i) ? 0 : 24 }}
              transition={{ duration: 0.33, delay: show(i) ? i * 0.12 : 0, type: 'spring', stiffness: 200, damping: 18 }}
              style={{ position: 'absolute', top: p.top, left: p.left }}
            >
              <PolaroidFrame
                src={p.src}
                caption={p.caption}
                rotate={p.rotate}
                width={p.width}
                photoHeight={p.photoHeight}
                idleIndex={i}
              />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: show(2) ? 1 : 0, x: show(2) ? 0 : 50 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100 }}
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
