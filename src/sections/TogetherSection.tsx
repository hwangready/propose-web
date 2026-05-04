import { motion } from 'framer-motion';
import HexFrame from '../components/HexFrame';
import TextCard from '../components/TextCard';

interface Props { isActive: boolean }

const HEX_DATA = [
  { src: 'https://picsum.photos/seed/couple13/400/400', size: 135, patchColor: '#a8d5bf', top: 30,  left: 20  },
  { src: 'https://picsum.photos/seed/couple14/400/400', size: 105, patchColor: '#c9e8db', top: 130, left: 145 },
  { src: 'https://picsum.photos/seed/couple15/400/400', size: 90,  patchColor: '#b5d9c9', top: 15,  left: 192 },
];

export default function TogetherSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 60px', background: 'transparent',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <div style={{ position: 'relative', height: 300 }}>
          {HEX_DATA.map((h, i) => (
            <motion.div
              key={i}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.5, y: isActive ? 0 : 20 }}
              transition={{ duration: isActive ? 0.6 : 0, delay: isActive ? i * 0.18 : 0, type: 'spring', stiffness: 200, damping: 16 }}
              style={{ position: 'absolute', top: h.top, left: h.left }}
            >
              <HexFrame src={h.src} size={h.size} patchColor={h.patchColor} patchOffset={7} />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.3 : 0, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="함께하는 순간" title="우리만의 시간">
            <p>아무것도 안 해도</p>
            <p style={{ marginTop: 8 }}>너랑 같이면 즐거워.</p>
            <p style={{ marginTop: 8 }}>그냥 네가 있는 게 좋아.</p>
          </TextCard>
        </motion.div>
      </div>
    </section>
  );
}
