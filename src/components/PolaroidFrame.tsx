import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { use3DTilt } from '../hooks/use3DTilt'
import { useImageViewer } from '../context/ImageContext'

interface Props {
  src: string; caption?: string; rotate?: number
  width?: number; photoHeight?: number
  showRope?: boolean; ropeLength?: number
  draggable?: boolean; idleIndex?: number
}

export default function PolaroidFrame({ src, caption, rotate = 0, width = 200, photoHeight = 180, showRope = false, ropeLength = 36, draggable = false, idleIndex = 0 }: Props) {
  const { rotateX, rotateY, onMove, onLeave } = use3DTilt(7)
  const constraintRef = useRef<HTMLDivElement>(null)
  const didDrag = useRef(false)
  const [imgSrc, setImgSrc] = useState(src)
  const [cap, setCap] = useState(caption ?? '')
  const { openViewer } = useImageViewer()

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (didDrag.current) return
    openViewer(imgSrc, (newSrc) => setImgSrc(newSrc))
  }

  const bobY = 3 + idleIndex * 1.5
  const idleAnimate = !draggable ? { y: [0, -bobY, 0] } : undefined
  const idleTransition = !draggable ? { duration: 3.5 + idleIndex * 0.6, repeat: Infinity, ease: 'easeInOut' as const, delay: idleIndex * 0.9 } : undefined

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
        onDragStart={() => { didDrag.current = true }}
        onDragEnd={() => { setTimeout(() => { didDrag.current = false }, 80) }}
        onClick={handleClick}
        onMouseMove={onMove} onMouseLeave={onLeave}
        animate={idleAnimate}
        transition={idleTransition}
        style={{
          rotate, rotateX, rotateY,
          background: '#fff',
          padding: '10px 10px 44px',
          width,
          boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
          perspective: 600,
          cursor: draggable ? 'grab' : 'zoom-in',
          position: 'relative', zIndex: 2,
          userSelect: 'none',
        }}
        whileHover={{ boxShadow: '0 18px 50px rgba(0,0,0,0.28)', zIndex: 10 }}
      >
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <img src={imgSrc} alt="" style={{ width: '100%', height: photoHeight, objectFit: 'cover', display: 'block' }} />
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fff', pointerEvents: 'none' }}
          >
            ⊕
          </motion.div>
        </div>
        {caption !== undefined && (
          <div
            style={{ textAlign: 'center', paddingTop: 8, fontFamily: "'Dancing Script',cursive", fontSize: 18, color: '#6a8a7a', lineHeight: 1.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              contentEditable
              suppressContentEditableWarning
              data-editable="true"
              style={{ outline: 'none', cursor: 'text', borderBottom: '1px dashed rgba(93,202,165,0.3)', display: 'inline-block', minWidth: 20 }}
              onBlur={(e) => setCap(e.currentTarget.innerText)}
            >
              {cap}
            </span>
          </div>
        )}
      </motion.div>
    </div>
  )
}
