import { useState } from 'react'
import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'
import { useImageViewer } from '../context/ImageContext'

interface HexFrameProps {
  src: string; size: number
  patchColor?: string; patchOffset?: number
  showPin?: boolean; style?: React.CSSProperties
  idleIndex?: number
}

const CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

export default function HexFrame({ src, size, patchColor = '#a8d5bf', patchOffset = 7, showPin = true, style, idleIndex = 0 }: HexFrameProps) {
  const { rotateX, rotateY, onMove, onLeave } = use3DTilt(8)
  const total = size + patchOffset * 2
  const [imgSrc, setImgSrc] = useState(src)
  const { openViewer } = useImageViewer()

  const bobY = 3 + idleIndex * 2

  return (
    <motion.div
      style={{ position: 'relative', width: total, height: total, flexShrink: 0, perspective: 600, cursor: 'zoom-in', ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
      onClick={(e) => { e.stopPropagation(); openViewer(imgSrc, (newSrc) => setImgSrc(newSrc)); }}
      whileHover={{ scale: 1.05 }}
      animate={{ y: [0, -bobY, 0] }}
      transition={{ duration: 4 + idleIndex * 0.6, repeat: Infinity, ease: 'easeInOut', delay: idleIndex * 1.0, repeatType: 'mirror' }}
    >
      <motion.div style={{ width: '100%', height: '100%', rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        <div style={{ position: 'absolute', inset: 0, clipPath: CLIP, background: patchColor }} />
        <div style={{ position: 'absolute', top: patchOffset, left: patchOffset, width: size, height: size, clipPath: CLIP, overflow: 'hidden' }}>
          <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        {showPin && (
          <div style={{ position: 'absolute', top: patchOffset - 7, left: '50%', transform: 'translateX(-50%)', width: 15, height: 15, borderRadius: '50%', background: '#4a9e7a', border: '2.5px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', zIndex: 10 }} />
        )}
      </motion.div>
    </motion.div>
  )
}
