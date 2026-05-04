import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextCard from '../components/TextCard';
import PolaroidFrame from '../components/PolaroidFrame';

interface Props { isActive: boolean }

export default function MeetingSection({ isActive }: Props) {
  const [dragged, setDragged] = useState(false);

  return (
    <section style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      background: '#1a1208',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : -50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.1 : 0, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리의 시작" title="처음 만난 날">
            <p>처음 네 얼굴을 봤을 때,</p>
            <p style={{ marginTop: 8 }}>이상하게 마음이 설렜어.</p>
            <p style={{ marginTop: 8 }}>그날이 우리의 시작이었지.</p>
          </TextCard>
        </motion.div>

        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 50 }}
          transition={{ duration: isActive ? 0.7 : 0, delay: isActive ? 0.2 : 0, type: 'spring', stiffness: 100 }}
          style={{ position: 'relative', height: 340, display: 'flex', justifyContent: 'center' }}
          onMouseDown={() => setDragged(true)}
        >
          <AnimatePresence>
            {!dragged && (
              <motion.div
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#c8955a', whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none' }}
              >
                잡아서 옮겨봐 ✨
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ position: 'absolute', left: '8%', top: 40 }}>
            <PolaroidFrame src="사진4.jpg" caption="그 날의 기억" rotate={-6} width={195} photoHeight={170} showRope ropeLength={36} draggable />
          </div>
          <div style={{ position: 'absolute', left: '38%', top: 60 }}>
            <PolaroidFrame src="사진5.jpg" caption="함께였던 우리" rotate={5} width={195} photoHeight={170} showRope ropeLength={36} draggable />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
