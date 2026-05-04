import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';
import PolaroidFrame from '../components/PolaroidFrame';

interface Props { isActive: boolean }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple4/400/400', caption: '그 날의 설렘', rotate: -7, width: 180, photoHeight: 160, delay: 0.1 },
  { src: 'https://picsum.photos/seed/couple5/400/400', caption: '우리가 된 날', rotate:  4, width: 190, photoHeight: 170, delay: 0.28 },
];

export default function DatingSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 60px', background: 'transparent',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.1 : 0, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리가 된 날" title="처음 손 잡던 날">
            <p>용기를 내서 손을 잡았던 그 순간,</p>
            <p style={{ marginTop: 8 }}>심장이 너무 빨리 뛰었어.</p>
            <p style={{ marginTop: 8 }}>그날부터 우리가 됐지.</p>
          </TextCard>
        </motion.div>

        <div style={{ position: 'relative', height: 320, display: 'flex', justifyContent: 'center' }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 40 }}
              transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 110, damping: 14 }}
              style={{ position: 'absolute', left: i === 0 ? '5%' : '42%', top: i === 0 ? 20 : 50 }}
            >
              <PolaroidFrame src={p.src} caption={p.caption} rotate={p.rotate} width={p.width} photoHeight={p.photoHeight} showRope ropeLength={32} draggable />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
