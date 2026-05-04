import { motion } from 'framer-motion';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

// 사진들을 섹션 중앙(path 통과 지점) 기준으로 배치
const PHOTOS = [
  { src: 'https://picsum.photos/seed/couple9/500/500',  caption: '여행의 시작',   rotate: -9, top: '5%',  left: '6%',  width: 220, photoHeight: 195, delay: 0    },
  { src: 'https://picsum.photos/seed/couple10/500/500', caption: '가장 좋았던 날', rotate:  4, top: '22%', left: '34%', width: 245, photoHeight: 215, delay: 0.18 },
  { src: 'https://picsum.photos/seed/couple11/500/500', caption: '또 가고 싶어',   rotate:  8, top:  '3%', left: '62%', width: 215, photoHeight: 190, delay: 0.36 },
];

export default function TravelSection({ isActive }: Props) {
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

        {/* 사진 클러스터 — 섹션 중앙에 흩어진 배치 */}
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
                animate={isActive ? { rotate: [p.rotate - 1.8, p.rotate + 1.8, p.rotate - 1.8] } : {}}
                transition={isActive ? { duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 } : {}}
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
          <TextCard pill="모든 여행에서">
            <p>어디를 가든 네가 옆에 있으면 충분했어.</p>
            <p style={{ marginTop: 8 }}>앞으로도 같이 많은 곳을 다니고 싶어.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
