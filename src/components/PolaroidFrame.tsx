import { useRef } from 'react'
import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'

interface Props {
  src: string; caption?: string; rotate?: number
  width?: number; photoHeight?: number
  showRope?: boolean; ropeLength?: number
  draggable?: boolean
}

export default function PolaroidFrame({ src, caption, rotate = 0, width = 200, photoHeight = 180, showRope = true, ropeLength = 36, draggable = false }: Props) {
  const { rotateX, rotateY, onMove, onLeave } = use3DTilt(7)
  const constraintRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={constraintRef}>
      {showRope && (
        <div style={{ position: 'absolute', top: -(ropeLength + 12), left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid #7db8a0' }} />
          <div style={{ width: 2, height: ropeLength, background: 'linear-gradient(to bottom, #9ecfba, #7db8a0)' }} />
        </div>
      )}
      <motion.div
        drag={draggable}
        dragElastic={0.15}
        dragTransition={{ bounceStiffness: 280, bounceDamping: 20 }}
        whileDrag={{ scale: 1.06, zIndex: 50 }}
        onMouseMove={onMove} onMouseLeave={onLeave}
        style={{
          rotate, rotateX, rotateY,
          background: '#fff',
          padding: '10px 10px 38px',
          width,
          boxShadow: '0 6px 24px rgba(0,0,0,0.12)',
          perspective: 600,
          cursor: draggable ? 'grab' : 'default',
          position: 'relative', zIndex: 2,
          userSelect: 'none',
        }}
        whileHover={{ boxShadow: '0 14px 40px rgba(0,0,0,0.18)', zIndex: 10 }}
      >
        {/* 📷 사진 교체: src="원하는파일명.jpg" 로 변경 */}
        <img src={src} alt="" style={{ width: '100%', height: photoHeight, objectFit: 'cover', display: 'block' }} />
        {caption && <div style={{ textAlign: 'center', paddingTop: 6, fontFamily: "'Dancing Script',cursive", fontSize: 15, color: '#7a9a8a' }}>{caption}</div>}
      </motion.div>
    </div>
  )
}
