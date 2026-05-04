import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'

interface HexFrameProps {
  src: string; size: number
  patchColor?: string; patchOffset?: number
  showPin?: boolean; style?: React.CSSProperties
}

const CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

export default function HexFrame({ src, size, patchColor = '#a8d5bf', patchOffset = 7, showPin = true, style }: HexFrameProps) {
  const { rotateX, rotateY, onMove, onLeave } = use3DTilt(8)
  const total = size + patchOffset * 2
  return (
    <motion.div
      style={{ position: 'relative', width: total, height: total, flexShrink: 0, perspective: 600, ...style }}
      onMouseMove={onMove} onMouseLeave={onLeave}
    >
      <motion.div style={{ width: '100%', height: '100%', rotateX, rotateY, transformStyle: 'preserve-3d' }}>
        {/* 색 패치 */}
        <div style={{ position: 'absolute', inset: 0, clipPath: CLIP, background: patchColor }} />
        {/* 사진 */}
        <div style={{ position: 'absolute', top: patchOffset, left: patchOffset, width: size, height: size, clipPath: CLIP, overflow: 'hidden' }}>
          {/* 📷 사진 교체: src="원하는파일명.jpg" 로 변경 */}
          <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
        {/* 핀 */}
        {showPin && (
          <div style={{ position: 'absolute', top: patchOffset - 7, left: '50%', transform: 'translateX(-50%)', width: 15, height: 15, borderRadius: '50%', background: '#4a9e7a', border: '2.5px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.22)', zIndex: 10 }} />
        )}
      </motion.div>
    </motion.div>
  )
}
