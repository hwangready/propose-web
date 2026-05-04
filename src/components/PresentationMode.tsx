'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Slide {
  id: number
  chapter: string
  title: string
  body: string[]
  emoji: string
  accent: string
}

const SLIDES: Slide[] = [
  {
    id: 0,
    chapter: 'Prologue',
    title: 'Everyone smiles\nin the same language',
    body: ['그리고 나는 네가 웃을 때', '세상에서 가장 아름다운 언어를 봤어.'],
    emoji: '🌿',
    accent: '#7db8a0',
  },
  {
    id: 1,
    chapter: 'Chapter 01',
    title: '처음 만난 날',
    body: ['처음 네 얼굴을 봤을 때,', '이상하게 마음이 설렜어.', '그날이 우리의 시작이었지.'],
    emoji: '💚',
    accent: '#5a9e82',
  },
  {
    id: 2,
    chapter: 'Chapter 02',
    title: '함께한 모든 순간',
    body: ['너와 함께했던 평범한 날들이', '내 삶에서 가장 빛나는 순간들이 됐어.', '작은 것들이 전부 소중해.'],
    emoji: '🍀',
    accent: '#7db8a0',
  },
  {
    id: 3,
    chapter: 'Chapter 03',
    title: '모든 여행에서',
    body: ['어디를 가든 네가 옆에 있으면 충분했어.', '앞으로도 같이 많은 곳을 다니고 싶어.'],
    emoji: '✈️',
    accent: '#9ecfba',
  },
  {
    id: 4,
    chapter: 'Chapter 04',
    title: '내가 원하는 미래',
    body: ['매일 아침 네 얼굴 보고 싶고', '매일 밤 네 옆에서 자고 싶어', '그 모든 내일을 같이 맞이하고 싶어.'],
    emoji: '🌙',
    accent: '#7db8a0',
  },
  {
    id: 5,
    chapter: 'Finale',
    title: '나랑 결혼해 줄래?',
    body: ['네가 있어서 매일이 행복해.', '평생 네 옆에 있고 싶어.'],
    emoji: '💍',
    accent: '#e05c7a',
  },
]

const slideVariants = {
  enter: (d: number) => ({ opacity: 0, x: d * 70, filter: 'blur(8px)' }),
  center: { opacity: 1, x: 0, filter: 'blur(0px)' },
  exit: (d: number) => ({ opacity: 0, x: d * -70, filter: 'blur(8px)' }),
}

export default function PresentationMode({ onClose }: { onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const [auto, setAuto] = useState(true)
  const [dir, setDir] = useState(1)

  const goNext = useCallback(() => {
    if (idx < SLIDES.length - 1) { setDir(1); setIdx(i => i + 1) }
  }, [idx])

  const goPrev = useCallback(() => {
    if (idx > 0) { setDir(-1); setIdx(i => i - 1) }
  }, [idx])

  // 자동 진행
  useEffect(() => {
    if (!auto || idx === SLIDES.length - 1) return
    const t = setTimeout(() => { setDir(1); setIdx(i => i + 1) }, 4500)
    return () => clearTimeout(t)
  }, [auto, idx])

  // 키보드
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev, onClose])

  const slide = SLIDES[idx]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#06100a',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 상단 자동 진행 바 */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.08)' }}>
        {auto && idx < SLIDES.length - 1 && (
          <motion.div
            key={`bar-${idx}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 4.5, ease: 'linear' }}
            style={{ height: '100%', background: slide.accent }}
          />
        )}
      </div>

      {/* 수직 점선 — 배경 장식 */}
      <div style={{
        position: 'absolute', left: '50%', top: 0, bottom: 0, width: 0,
        borderLeft: '2px dashed rgba(125,184,160,0.12)',
        transform: 'translateX(-50%)', pointerEvents: 'none',
      }} />

      {/* 상단 컨트롤 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 36px', zIndex: 2 }}>
        <div style={{ fontFamily: "'Courier New',monospace", fontSize: 11, color: 'rgba(158,207,186,0.45)', letterSpacing: '3px' }}>
          PROPOSAL · {String(idx + 1).padStart(2, '0')} / {String(SLIDES.length).padStart(2, '0')}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setAuto(a => !a)}
            style={{
              background: auto ? 'rgba(125,184,160,0.12)' : 'transparent',
              border: `1px solid ${auto ? 'rgba(125,184,160,0.35)' : 'rgba(255,255,255,0.12)'}`,
              color: auto ? '#7db8a0' : 'rgba(255,255,255,0.3)',
              padding: '6px 16px', borderRadius: 20, fontSize: 11,
              cursor: 'pointer', fontFamily: "'Courier New',monospace", letterSpacing: '1px',
            }}
          >
            {auto ? '⚡ 자동' : '◈ 수동'}
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.35)', padding: '6px 16px', borderRadius: 20,
              fontSize: 11, cursor: 'pointer', fontFamily: "'Courier New',monospace",
            }}
          >
            ✕ 닫기
          </button>
        </div>
      </div>

      {/* 슬라이드 점 인디케이터 */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, zIndex: 2 }}>
        {SLIDES.map((s, i) => (
          <motion.button
            key={i}
            onClick={() => { setDir(i > idx ? 1 : -1); setIdx(i) }}
            animate={{ width: i === idx ? 22 : 6, background: i === idx ? slide.accent : 'rgba(255,255,255,0.18)' }}
            transition={{ duration: 0.3 }}
            style={{ height: 6, borderRadius: 3, border: 'none', cursor: 'pointer', padding: 0 }}
          />
        ))}
      </div>

      {/* 메인 슬라이드 */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>

        {/* 좌우 클릭 영역 */}
        <div onClick={goPrev} style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '20%', zIndex: 5, cursor: idx > 0 ? 'w-resize' : 'default' }} />
        <div onClick={goNext} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '20%', zIndex: 5, cursor: idx < SLIDES.length - 1 ? 'e-resize' : 'default' }} />

        <AnimatePresence custom={dir} mode="wait">
          <motion.div
            key={idx}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', maxWidth: 720, padding: '0 80px', position: 'absolute', width: '100%' }}
          >
            {/* Chapter 레이블 */}
            <motion.div
              initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Courier New',monospace", fontSize: 10, letterSpacing: '5px',
                color: slide.accent, marginBottom: 40, textTransform: 'uppercase', opacity: 0.75,
              }}
            >
              — {slide.chapter} —
            </motion.div>

            {/* 이모지 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.18, type: 'spring', stiffness: 280, damping: 14 }}
              style={{ fontSize: 60, marginBottom: 36, display: 'block', lineHeight: 1 }}
            >
              {slide.emoji}
            </motion.div>

            {/* 타이틀 */}
            <motion.div
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
              style={{
                fontFamily: "'Dancing Script',cursive",
                fontSize: 'clamp(34px,4vw,62px)',
                color: '#dff0e8',
                lineHeight: 1.35,
                marginBottom: 36,
                whiteSpace: 'pre-line',
              }}
            >
              {slide.title}
            </motion.div>

            {/* 본문 */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
            >
              {slide.body.map((line, i) => (
                <div key={i} style={{
                  fontFamily: "'Noto Sans KR',sans-serif", fontSize: 15,
                  color: 'rgba(210,240,225,0.55)', fontWeight: 300, lineHeight: 1.9,
                }}>
                  {line}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 하단 네비 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 52px', zIndex: 2 }}>
        <motion.button
          onClick={goPrev} disabled={idx === 0}
          whileHover={idx > 0 ? { x: -4 } : {}}
          style={{
            background: 'transparent', border: 'none',
            color: idx === 0 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
            fontSize: 26, cursor: idx === 0 ? 'default' : 'pointer',
          }}
        >←</motion.button>

        {/* 점선 구분선 */}
        <div style={{ flex: 1, borderTop: '1px dashed rgba(125,184,160,0.2)', margin: '0 28px' }} />

        <motion.button
          onClick={goNext} disabled={idx === SLIDES.length - 1}
          whileHover={idx < SLIDES.length - 1 ? { x: 4 } : {}}
          style={{
            background: 'transparent', border: 'none',
            color: idx === SLIDES.length - 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.45)',
            fontSize: 26, cursor: idx === SLIDES.length - 1 ? 'default' : 'pointer',
          }}
        >→</motion.button>
      </div>
    </motion.div>
  )
}
