import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useCallback } from 'react'

export function use3DTilt(maxDeg = 10) {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [maxDeg, -maxDeg]), { stiffness: 280, damping: 22 })
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-maxDeg, maxDeg]), { stiffness: 280, damping: 22 })

  const onMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2)
    rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2)
  }, [rawX, rawY])

  const onLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
  }, [rawX, rawY])

  return { rotateX, rotateY, onMove, onLeave }
}
