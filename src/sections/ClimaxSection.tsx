import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TextFlippingBoard from '../components/TextFlippingBoard';
import AudioUploader from '../components/AudioUploader';

const DEFAULT_MESSAGES = ["만난 지\n365일", "처음처럼\n설레고 싶어", "사랑해"];

interface Props { isActive: boolean; step: number }

export default function ClimaxSection({ isActive }: Props) {
  const [messages, setMessages] = useState(DEFAULT_MESSAGES);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState(DEFAULT_MESSAGES);

  const openEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDrafts([...messages]);
    setEditing(true);
  };

  const save = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages([...drafts]);
    setEditing(false);
  };

  const cancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(false);
  };

  return (
    <section style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', overflow: 'hidden', boxSizing: 'border-box' }}>
      <div style={{ position: 'relative' }}>
        <TextFlippingBoard messages={messages} interval={6000} isActive={isActive} />
        {isActive && (
          <button
            onClick={openEdit}
            title="메시지 편집"
            style={{
              position: 'absolute', top: -14, right: -14,
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
              borderRadius: 8, padding: '5px 9px', color: 'rgba(255,255,255,0.55)',
              cursor: 'pointer', fontSize: 13, zIndex: 20, lineHeight: 1,
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.16)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >✏</button>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', inset: 0, zIndex: 500,
              background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              style={{
                background: '#111', borderRadius: 18, padding: '40px 48px',
                border: '1px solid rgba(255,255,255,0.1)', minWidth: 420, maxWidth: 520,
                boxShadow: '0 24px 80px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{
                color: 'rgba(255,255,255,0.35)', fontSize: 11, letterSpacing: '2.5px',
                marginBottom: 28, fontFamily: "'Courier New', monospace", textTransform: 'uppercase',
              }}>
                Climax 메시지 편집 — 줄바꿈: Shift+Enter
              </div>

              {drafts.map((msg, i) => (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{
                    color: 'rgba(255,255,255,0.25)', fontSize: 11,
                    marginBottom: 6, letterSpacing: '1px', fontFamily: "'Courier New', monospace",
                  }}>
                    MESSAGE {i + 1}
                  </div>
                  <textarea
                    value={msg}
                    onChange={e => setDrafts(d => d.map((m, j) => j === i ? e.target.value : m))}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) e.preventDefault(); }}
                    rows={2}
                    style={{
                      width: '100%', background: '#1c1c1c',
                      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
                      color: '#f0ede0', padding: '10px 14px', fontSize: 16,
                      fontFamily: "'Noto Sans KR', sans-serif", resize: 'none',
                      outline: 'none', boxSizing: 'border-box', lineHeight: 1.6,
                    }}
                  />
                </div>
              ))}

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button
                  onClick={save}
                  style={{
                    flex: 1, padding: '12px 0', background: '#7db8a0', color: '#fff',
                    border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 15,
                    fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 500,
                  }}
                >저장</button>
                <button
                  onClick={cancel}
                  style={{
                    flex: 1, padding: '12px 0', background: 'transparent', color: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10,
                    cursor: 'pointer', fontSize: 15, fontFamily: "'Noto Sans KR', sans-serif",
                  }}
                >취소</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AudioUploader isActive={isActive} />
    </section>
  );
}
