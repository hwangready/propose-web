import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple6/400/300', caption: '설레던 출발', rotate: -4, width: 175, photoHeight: 150, delay: 0,    offsetY: 0  },
  { src: 'https://picsum.photos/seed/couple7/400/300', caption: '함께한 풍경', rotate:  2, width: 200, photoHeight: 175, delay: 0.18, offsetY: 30 },
  { src: 'https://picsum.photos/seed/couple8/400/300', caption: '잊지 못할 밤', rotate:  7, width: 175, photoHeight: 150, delay: 0.36, offsetY: 0  },
];

const LEFT_PCTS = ['6%', '32%', '58%'];
const ROPE_TOP = 72;

export default function FirstTripSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '0 60px', background: 'transparent',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        <div style={{ position: 'relative', height: 340, marginBottom: 28 }}>
          <div style={{ position: 'absolute', top: ROPE_TOP, left: '3%', right: '3%', height: 2, background: 'linear-gradient(to right, transparent, #5dcaa5 8%, #5dcaa5 92%, transparent)' }} />

          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -60 }}
              transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 120, damping: 14 }}
              style={{ position: 'absolute', left: LEFT_PCTS[i], top: ROPE_TOP }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid #5dcaa5' }} />
                <div style={{ width: 2, height: 32 + p.offsetY, background: '#7db8a0' }} />
                <motion.div
                  style={{ transformOrigin: 'top center' }}
                  animate={isActive ? { rotate: [p.rotate - 2, p.rotate + 2, p.rotate - 2] } : { rotate: p.rotate }}
                  transition={isActive ? { duration: 2.6 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 } : {}}
                  whileHover={{ scale: 1.04, zIndex: 10 }}
                >
                  <div style={{ background: '#fff', padding: '10px 10px 34px', width: p.width, boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
                    <img src={p.src} alt="" style={{ width: '100%', height: p.photoHeight, objectFit: 'cover', display: 'block' }} />
                    <div style={{ textAlign: 'center', paddingTop: 6, fontFamily: "'Dancing Script',cursive", fontSize: 13, color: '#5a7a6e' }}>{p.caption}</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 24 }}
          transition={{ duration: isActive ? 0.6 : 0, delay: isActive ? 0.5 : 0 }}
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          <TextCard pill="첫 여행">
            <p>처음으로 함께 떠난 여행,</p>
            <p style={{ marginTop: 8 }}>모든 게 특별하게 느껴졌어.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
