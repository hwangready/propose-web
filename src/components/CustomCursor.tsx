import { useEffect } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const mx = useMotionValue(-200)
  const my = useMotionValue(-200)
  const dotX = useSpring(mx, { stiffness: 800, damping: 35 })
  const dotY = useSpring(my, { stiffness: 800, damping: 35 })
  const ringX = useSpring(mx, { stiffness: 180, damping: 20 })
  const ringY = useSpring(my, { stiffness: 180, damping: 20 })

  useEffect(() => {
    const move = (e: MouseEvent) => { mx.set(e.clientX); my.set(e.clientY) }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mx, my])

  return (
    <>
      <style>{`body * { cursor: none !important; }`}</style>
      {/* dot */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        x: dotX, y: dotY, translateX: '-50%', translateY: '-50%',
        width: 8, height: 8, borderRadius: '50%', background: '#7db8a0',
      }} />
      {/* ring */}
      <motion.div style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9998, pointerEvents: 'none',
        x: ringX, y: ringY, translateX: '-50%', translateY: '-50%',
        width: 32, height: 32, borderRadius: '50%',
        border: '1.5px solid #7db8a0', opacity: 0.55,
      }} />
    </>
  )
}
