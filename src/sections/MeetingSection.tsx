import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextCard from '../components/TextCard';
import PolaroidFrame from '../components/PolaroidFrame';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

export default function MeetingSection({ isActive, step }: Props) {
  const [dragged, setDragged] = useState(false);
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>

        <motion.div
          animate={{ opacity: show(0) ? 1 : 0, x: show(0) ? 0 : -50 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100 }}
        >
          <TextCard pill="우리의 시작" title="처음 만난 날" editable>
            <p><EditableText>처음 네 얼굴을 봤을 때,</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>이상하게 마음이 설렜어.</EditableText></p>
            <p style={{ marginTop: 8 }}><EditableText>그날이 우리의 시작이었지.</EditableText></p>
          </TextCard>
        </motion.div>

        <motion.div
          animate={{ opacity: show(1) ? 1 : 0, x: show(1) ? 0 : 50 }}
          transition={{ duration: 0.35, type: 'spring', stiffness: 100 }}
          style={{ position: 'relative', height: 460, display: 'flex', justifyContent: 'center' }}
          onMouseDown={() => setDragged(true)}
        >
          <AnimatePresence>
            {!dragged && show(1) && (
              <motion.div
                exit={{ opacity: 0, y: -10 }}
                style={{ position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)', fontSize: 12, color: '#c8955a', whiteSpace: 'nowrap', zIndex: 20, pointerEvents: 'none' }}
              >
                잡아서 옮겨봐 ✨
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={{ opacity: show(1) ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'absolute', left: '4%', top: 20 }}
          >
            <PolaroidFrame src="https://picsum.photos/seed/couple4/500/500" caption="그 날의 기억" rotate={-7} width={288} photoHeight={254} draggable />
          </motion.div>
          <motion.div
            animate={{ opacity: show(2) ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            style={{ position: 'absolute', left: '38%', top: 65 }}
          >
            <PolaroidFrame src="https://picsum.photos/seed/couple5/500/500" caption="함께였던 우리" rotate={6} width={278} photoHeight={246} draggable />
          </motion.div>
        </motion.div>
      </div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
