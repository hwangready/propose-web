import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const GRID_PHOTOS = [
  { src: 'https://picsum.photos/seed/couple9/300/300',  delay: 0    },
  { src: 'https://picsum.photos/seed/couple10/300/300', delay: 0.12 },
  { src: 'https://picsum.photos/seed/couple11/300/300', delay: 0.24 },
  { src: 'https://picsum.photos/seed/couple12/300/300', delay: 0.36 },
];

export default function DailySection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 60px', background: 'transparent',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        {/* 2×2 사진 격자 */}
        <motion.div
          animate={{ opacity: isActive ? 1 : 0 }}
          transition={{ duration: isActive ? 0.5 : 0 }}
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}
        >
          {GRID_PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.88 }}
              transition={{ duration: isActive ? 0.6 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 180, damping: 16 }}
              whileHover={{ scale: 1.03, zIndex: 2 }}
              style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}
            >
              <img src={p.src} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.3 : 0, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리의 일상" title="평범한 매일">
            <p>특별한 게 없어도</p>
            <p style={{ marginTop: 8 }}>네가 옆에 있으면 충분해.</p>
            <p style={{ marginTop: 8 }}>그 평범함이 제일 좋아.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
