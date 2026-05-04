import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'

interface TextCardProps { pill: string; title?: string; children: React.ReactNode; style?: React.CSSProperties }

export default function TextCard({ pill, title, children, style }: TextCardProps) {
  const { rotateX, rotateY, onMove, onLeave } = use3DTilt(4)
  return (
    <motion.div
      onMouseMove={onMove} onMouseLeave={onLeave}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(125,184,160,0.20)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: '32px 36px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
        ...style,
      }}
    >
      <div style={{ display: 'inline-block', background: '#7db8a0', color: '#fff', fontSize: 12, fontWeight: 500, letterSpacing: '1.5px', padding: '4px 14px', borderRadius: 99, marginBottom: 18 }}>{pill}</div>
      {title && <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 'clamp(28px,3vw,42px)', color: '#a8d5bf', marginBottom: 14, lineHeight: 1.3 }}>{title}</div>}
      <div style={{ fontSize: 15, lineHeight: 1.9, color: 'rgba(255,255,255,0.68)', fontWeight: 300 }}>{children}</div>
    </motion.div>
  )
}
