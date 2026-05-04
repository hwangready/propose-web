import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  autoPlay: boolean;
  setAutoPlay: (v: boolean) => void;
  autoSec: number;
  setAutoSec: (s: number) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onPresentMode: () => void;
  progress: number;
  isLast: boolean;
}

const SPEED_OPTIONS = [3, 5, 8, 10];

export default function ControlsFAB({
  autoPlay, setAutoPlay, autoSec, setAutoSec,
  isFullscreen, toggleFullscreen, onPresentMode,
  progress, isLast,
}: Props) {
  const [open, setOpen] = useState(false);

  const itemStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'rgba(8,22,14,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(100,170,130,0.35)',
    color: '#9ecfba',
    padding: '10px 16px',
    borderRadius: 12,
    cursor: 'pointer',
    fontFamily: "'Courier New',monospace",
    fontSize: 11,
    letterSpacing: '1.5px',
    whiteSpace: 'nowrap',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    width: '100%',
    justifyContent: 'flex-start',
  };

  return (
    <>
      {/* 자동 재생 진행 바 */}
      <AnimatePresence>
        {autoPlay && !isLast && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 2, zIndex: 300, background: 'rgba(125,184,160,0.15)', pointerEvents: 'none' }}
          >
            <div style={{ height: '100%', background: 'linear-gradient(to right, #5dcaa5, #7db8a0)', width: `${progress * 100}%`, transition: 'none' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB 패널 */}
      <div style={{ position: 'fixed', right: 20, bottom: 20, zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{ display: 'flex', flexDirection: 'column', gap: 6, width: 200 }}
            >
              {/* 연출 모드 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); setOpen(false); onPresentMode(); }}
                style={itemStyle}
              >
                <span>▶</span><span>연출 모드</span>
              </motion.button>

              {/* 전체화면 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                style={itemStyle}
              >
                <span>⛶</span><span>{isFullscreen ? '창 모드' : '전체화면'}</span>
              </motion.button>

              {/* 자동재생 토글 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={(e) => { e.stopPropagation(); setAutoPlay(!autoPlay); }}
                style={{ ...itemStyle, color: autoPlay ? '#5dcaa5' : '#9ecfba', border: `1px solid ${autoPlay ? 'rgba(93,202,165,0.6)' : 'rgba(100,170,130,0.35)'}` }}
              >
                <span>{autoPlay ? '⏸' : '▷'}</span>
                <span>자동 재생 {autoPlay ? 'ON' : 'OFF'}</span>
              </motion.button>

              {/* 속도 선택 */}
              <div style={{ display: 'flex', gap: 5, padding: '6px 8px', background: 'rgba(8,22,14,0.88)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', border: '1px solid rgba(100,170,130,0.25)', borderRadius: 12 }}>
                <span style={{ fontFamily: "'Courier New',monospace", fontSize: 10, color: 'rgba(125,184,160,0.5)', letterSpacing: '1px', alignSelf: 'center', marginRight: 2 }}>속도</span>
                {SPEED_OPTIONS.map(s => (
                  <button
                    key={s}
                    onClick={(e) => { e.stopPropagation(); setAutoSec(s); if (!autoPlay) setAutoPlay(true); }}
                    style={{
                      flex: 1,
                      background: autoSec === s ? 'rgba(93,202,165,0.25)' : 'rgba(8,22,14,0.5)',
                      border: `1px solid ${autoSec === s ? 'rgba(93,202,165,0.6)' : 'rgba(100,170,130,0.2)'}`,
                      color: autoSec === s ? '#5dcaa5' : 'rgba(125,184,160,0.5)',
                      padding: '5px 0',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontFamily: "'Courier New',monospace",
                      fontSize: 9, letterSpacing: '0.5px',
                    }}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAB 메인 버튼 */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: open ? 'rgba(93,202,165,0.25)' : 'rgba(8,22,14,0.92)',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: `1px solid ${open ? 'rgba(93,202,165,0.6)' : 'rgba(100,170,130,0.4)'}`,
            color: open ? '#5dcaa5' : '#9ecfba',
            cursor: 'pointer', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            transition: 'all 0.2s',
          }}
        >
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'inline-block', lineHeight: 1 }}
          >
            ✦
          </motion.span>
        </motion.button>
      </div>
    </>
  );
}
