import { motion } from 'framer-motion';
import PolaroidFrame from '../components/PolaroidFrame';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple13/400/400', caption: '우리만의 시간',   rotate: -8, top: 0,   left: 10,  width: 282, photoHeight: 250 },
  { src: 'https://picsum.photos/seed/couple14/400/400', caption: '함께라서 행복해', rotate:  5, top: 95,  left: 192, width: 264, photoHeight: 234 },
  { src: 'https://picsum.photos/seed/couple15/400/400', caption: '그냥 네가 좋아',  rotate: -3, top: 220, left: 55,  width: 274, photoHeight: 244 },
];

export default function TogetherSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <div style={{ position: 'relative', height: 530 }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i) ? 1 : 0, scale: show(i) ? 1 : 0.55, y: show(i) ? 0 : 24 }}
              transition={{ duration: 0.33, delay: show(i) ? i * 0.1 : 0, type: 'spring', stiffness: 200, damping: 18 }}
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
          <TextCard pill="함께하는 순간" title="우리만의 시간" editable>
            <p><EditableText>아무것도 안 해도</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>너랑 같이면 즐거워.</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>그냥 네가 있는 게 좋아.</EditableText></p>
          </TextCard>
        </motion.div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
