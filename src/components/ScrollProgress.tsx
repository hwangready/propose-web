import { useScroll, useSpring, motion } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9990,
        background: 'linear-gradient(to right, #7db8a0, #a8d5bf)',
        scaleX, transformOrigin: '0%',
      }}
    />
  )
}
