import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple9/400/400',  caption: '여행의 시작',   rotate: -5, width: 185, photoHeight: 160, delay: 0,   offsetY: 0  },
  { src: 'https://picsum.photos/seed/couple10/400/400', caption: '가장 좋았던 날', rotate:  1, width: 215, photoHeight: 190, delay: 0.18, offsetY: 38 },
  { src: 'https://picsum.photos/seed/couple11/400/400', caption: '또 가고 싶어',   rotate:  6, width: 185, photoHeight: 160, delay: 0.36, offsetY: 0  },
];

const LEFT_PCTS = ['8%', '34%', '60%'];
const ROPE_TOP = 80;

export default function TravelSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      background: 'transparent',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%' }}>
        {/* 폴라로이드 줄 */}
        <div style={{ position: 'relative', height: 360, marginBottom: 32 }}>
          {/* 가로 줄 */}
          <div style={{ position: 'absolute', top: ROPE_TOP, left: '3%', right: '3%', height: 2, background: 'linear-gradient(to right, transparent, #5dcaa5 8%, #5dcaa5 92%, transparent)' }} />

          {PHOTOS.map((p, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : -60 }}
              transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? p.delay : 0, type: 'spring', stiffness: 120, damping: 14 }}
              style={{ position: 'absolute', left: LEFT_PCTS[i], top: ROPE_TOP }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #5dcaa5' }} />
                <div style={{ width: 2, height: 36 + p.offsetY, background: '#7db8a0' }} />
                {/* 진자 흔들림 */}
                <motion.div
                  style={{ transformOrigin: 'top center' }}
                  animate={isActive ? { rotate: [p.rotate - 2.5, p.rotate + 2.5, p.rotate - 2.5] } : { rotate: p.rotate }}
                  transition={isActive ? { duration: 2.8 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.6 } : {}}
                  whileHover={{ scale: 1.04, zIndex: 10 }}
                >
                  <div style={{ background: '#fff', padding: '10px 10px 36px', width: p.width, boxShadow: '0 6px 24px rgba(0,0,0,0.25)' }}>
                    <img src={p.src} alt="" style={{ width: '100%', height: p.photoHeight, objectFit: 'cover', display: 'block' }} />
                    <div style={{ textAlign: 'center', paddingTop: 6, fontFamily: "'Dancing Script',cursive", fontSize: 14, color: '#5a7a6e' }}>{p.caption}</div>
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
          <TextCard pill="모든 여행에서">
            <p>어디를 가든 네가 옆에 있으면 충분했어.</p>
            <p style={{ marginTop: 8 }}>앞으로도 같이 많은 곳을 다니고 싶어.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
