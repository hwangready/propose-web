import { motion } from 'framer-motion';
import EditableText from '../components/EditableText';
import AudioUploader from '../components/AudioUploader';

interface Props { isActive: boolean; step: number }

const HEARTS = ['♡', '♥', '♡', '♥', '♡'];

export default function PromiseSection({ isActive, step }: Props) {
  const show = (n: number) => isActive && step >= n + 1;

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 60px', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>

      {HEARTS.map((h, i) => (
        <motion.div
          key={i}
          animate={show(0) ? { y: [0, -18, 0], opacity: [0.15, 0.35, 0.15] } : { opacity: 0 }}
          transition={show(0) ? { duration: 2.4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.55 } : {}}
          style={{ position: 'absolute', left: `${12 + i * 18}%`, top: `${22 + (i % 2) * 44}%`, fontSize: 28 + (i % 3) * 12, color: '#e05c7a', pointerEvents: 'none', userSelect: 'none' }}
        >
          {h}
        </motion.div>
      ))}

      <motion.div
        animate={{ opacity: show(0) ? 1 : 0, scale: show(0) ? 1 : 0.92 }}
        transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
        style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '56px 80px', textAlign: 'center', maxWidth: 600, boxShadow: '0 4px 32px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1 }}
      >
        <motion.div
          animate={show(0) ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={show(0) ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.3 } : {}}
          style={{ fontSize: 52, marginBottom: 24, lineHeight: 1 }}
        >
          ♥
        </motion.div>

        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(28px,3vw,46px)', color: '#f0d4e0', lineHeight: 1.5, marginBottom: 16 }} onClick={e => e.stopPropagation()}>
          <EditableText>영원히 함께</EditableText>
        </div>

        <motion.div
          animate={{ opacity: show(1) ? 1 : 0, y: show(1) ? 0 : 16 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 120 }}
          style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, fontWeight: 300 }}
          onClick={e => e.stopPropagation()}
        >
          <p><EditableText>네 손을 잡고 걷는 모든 길이</EditableText></p>
          <p><EditableText>내 가장 소중한 기억이야.</EditableText></p>
        </motion.div>
      </motion.div>
      <AudioUploader isActive={isActive} />
    </section>
  );
}
