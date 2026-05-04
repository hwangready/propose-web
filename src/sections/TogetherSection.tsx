import { motion } from 'framer-motion';
import HexFrame from '../components/HexFrame';
import TextCard from '../components/TextCard';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const HEX_DATA = [
  { src: 'https://picsum.photos/seed/couple13/400/400', size: 135, patchColor: '#a8d5bf', top: 30,  left: 20  },
  { src: 'https://picsum.photos/seed/couple14/400/400', size: 105, patchColor: '#c9e8db', top: 130, left: 145 },
  { src: 'https://picsum.photos/seed/couple15/400/400', size: 90,  patchColor: '#b5d9c9', top: 15,  left: 192 },
];

export default function TogetherSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <div style={{ position: 'relative', height: 300 }}>
          {HEX_DATA.map((h, i) => (
            <motion.div
              key={i}
              animate={{ opacity: show(i) ? 1 : 0, scale: show(i) ? 1 : 0.5, y: show(i) ? 0 : 20 }}
              transition={{ duration: 0.6, delay: show(i) ? i * 0.15 : 0, type: 'spring', stiffness: 200, damping: 16 }}
              style={{ position: 'absolute', top: h.top, left: h.left }}
            >
              <HexFrame src={h.src} size={h.size} patchColor={h.patchColor} patchOffset={7} idleIndex={i} />
            </motion.div>
          ))}
        </div>

        <motion.div
          animate={{ opacity: show(2) ? 1 : 0, x: show(2) ? 0 : 50 }}
          transition={{ duration: 0.7, type: 'spring', stiffness: 100 }}
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
