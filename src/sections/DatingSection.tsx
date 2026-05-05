import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';
import PolaroidFrame from '../components/PolaroidFrame';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple4/500/500', caption: '그 날의 설렘', rotate: -8, width: 282, photoHeight: 250, delay: 0.1 },
  { src: 'https://picsum.photos/seed/couple5/500/500', caption: '우리가 된 날', rotate:  5, width: 274, photoHeight: 243, delay: 0.2 },
];

export default function DatingSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <motion.div
          animate={{ opacity: show(0) ? 1 : 0, x: show(0) ? 0 : -50 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리가 된 날" title="처음 손 잡던 날" editable>
            <p><EditableText>용기를 내서 손을 잡았던 그 순간,</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>심장이 너무 빨리 뛰었어.</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>그날부터 우리가 됐지.</EditableText></p>
          </TextCard>
        </motion.div>

        <div style={{ position: 'relative', height: 440, display: 'flex', justifyContent: 'center' }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i + 1) ? 1 : 0, y: show(i + 1) ? 0 : 40 }}
              transition={{ duration: 0.35, delay: show(i + 1) ? p.delay : 0, type: 'spring', stiffness: 110, damping: 14 }}
              style={{ position: 'absolute', left: i === 0 ? '3%' : '43%', top: i === 0 ? 15 : 50 }}
            >
              <PolaroidFrame src={p.src} caption={p.caption} rotate={p.rotate} width={p.width} photoHeight={p.photoHeight} draggable idleIndex={i} />
            </motion.div>
          ))}
        </div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
