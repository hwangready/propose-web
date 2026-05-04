import { motion } from 'framer-motion';

interface Props { isActive: boolean }

const LINES = [
  '같이 아침을 맞이하고 싶어.',
  '같이 늙어가고 싶어.',
  '그 모든 순간을 너와 함께하고 싶어.',
];

export default function FutureSection({ isActive }: Props) {
  return (
    <section style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 60px', background: 'transparent',
      overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <motion.div
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.96 }}
        transition={{ duration: isActive ? 0.5 : 0 }}
        style={{
          maxWidth: 680, width: '100%',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: '56px 72px',
          textAlign: 'center',
          boxShadow: '0 4px 32px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.04) inset',
        }}
      >
        <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(14px,1.2vw,18px)', color: '#7db8a0', letterSpacing: '3px', marginBottom: 32, textTransform: 'lowercase' }}>
          앞으로의 우리
        </div>
        {LINES.map((line, i) => (
          <motion.div
            key={i}
            initial={{ clipPath: 'inset(100% 0 0 0)', y: 12 }}
            animate={isActive ? { clipPath: 'inset(0% 0 0 0)', y: 0 } : { clipPath: 'inset(100% 0 0 0)', y: 12 }}
            transition={{
              duration: isActive ? 0.7 : 0,
              delay: isActive ? 0.2 + i * 0.3 : 0,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: 'clamp(24px,2.6vw,40px)',
              color: '#e0e0e0',
              lineHeight: 1.7,
              marginBottom: i < LINES.length - 1 ? 4 : 0,
            }}
          >
            {line}
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
