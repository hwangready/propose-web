import { motion } from 'framer-motion';

interface Props { isActive: boolean }

const LINES = [
  '매일 아침 네 얼굴 보고 싶고',
  '매일 밤 네 옆에서 자고 싶어',
  '그 모든 내일을 같이 맞이하고 싶어.',
];

export default function ClimaxSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      background: 'transparent',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.96 }}
        transition={{ duration: isActive ? 0.5 : 0 }}
        style={{
          maxWidth: 720,
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '56px 72px',
          textAlign: 'center',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        }}
      >
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 28 }}
            transition={{
              duration: isActive ? 0.65 : 0,
              delay: isActive ? 0.2 + i * 0.32 : 0,
              type: 'spring',
              stiffness: 160,
              damping: 20,
            }}
            style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: 'clamp(26px,2.8vw,42px)',
              color: '#e0e0e0',
              lineHeight: 1.6,
              marginBottom: i < 2 ? 8 : 0,
            }}
          >
            {line}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
