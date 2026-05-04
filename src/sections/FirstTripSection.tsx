import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple6/500/500', caption: '설레던 출발',  rotate: -7,  top: '5%',  left: '6%',  width: 220, photoHeight: 195, delay: 0    },
  { src: 'https://picsum.photos/seed/couple7/500/500', caption: '함께한 풍경', rotate:  3,  top: '20%', left: '34%', width: 245, photoHeight: 215, delay: 0.18 },
  { src: 'https://picsum.photos/seed/couple8/500/500', caption: '잊지 못할 밤', rotate:  9,  top:  '3%', left: '63%', width: 218, photoHeight: 192, delay: 0.36 },
];

export default function FirstTripSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 60px',
      background: 'transparent',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1100, width: '100%', position: 'relative' }}>

        <div style={{ position: 'relative', height: 360 }}>
          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 32, scale: isActive ? 1 : 0.88 }}
              transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 130, damping: 16 }}
              whileHover={{ scale: 1.05, zIndex: 10, rotate: p.rotate * 0.3 }}
              style={{
                position: 'absolute',
                left: p.left, top: p.top,
                rotate: p.rotate,
                cursor: 'grab',
                zIndex: i + 1,
              }}
            >
              <motion.div
                animate={isActive ? { rotate: [p.rotate - 1.5, p.rotate + 1.5, p.rotate - 1.5] } : {}}
                transition={isActive ? { duration: 3.2 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 } : {}}
                style={{ transformOrigin: 'top center' }}
              >
                <div style={{
                  background: '#fff',
                  padding: '10px 10px 38px',
                  width: p.width,
                  boxShadow: '0 8px 28px rgba(0,0,0,0.32)',
                }}>
                  <img src={p.src} alt="" style={{ width: '100%', height: p.photoHeight, objectFit: 'cover', display: 'block' }} />
                  <div style={{ textAlign: 'center', paddingTop: 7, fontFamily: "'Dancing Script',cursive", fontSize: 13, color: '#5a7a6e' }}>
                    {p.caption}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 20 }}
          transition={{ duration: isActive ? 0.6 : 0, delay: isActive ? 0.45 : 0 }}
          style={{ maxWidth: 560, margin: '0 auto' }}
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
