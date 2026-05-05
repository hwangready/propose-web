import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IntroConfig } from '../config/introConfig';

interface Props {
  config: IntroConfig;
  onStart: () => void;
}

export default function ChatGPTIntro({ config, onStart }: Props) {
  const [response, setResponse] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!done) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onStart(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [done, onStart]);

  useEffect(() => {
    const text = config.chatResponse;
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setResponse(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(intervalId);
          setTimeout(() => setDone(true), 400);
        }
      }, 25);
    }, 700);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [config.chatResponse]);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#212121',
      display: 'flex', fontFamily: "'Noto Sans KR', 'Segoe UI', Arial, sans-serif",
    }}>
      {/* Sidebar */}
      <div style={{
        width: 240, background: '#171717',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        padding: '16px 12px', flexShrink: 0,
      }}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: '#ececec',
          padding: '8px 12px', marginBottom: 12, letterSpacing: '-0.3px',
        }}>
          ChatGPT
        </div>
        <div style={{
          fontSize: 11, color: '#6e6e6e', padding: '4px 12px',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}>
          새 대화
        </div>
      </div>

      {/* Chat area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 32px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* User message */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <div style={{
              background: '#2f2f2f', color: '#ececec',
              borderRadius: '18px 18px 4px 18px',
              padding: '12px 18px', maxWidth: '70%',
              fontSize: 15, lineHeight: 1.6,
            }}>
              {config.name}
            </div>
          </motion.div>

          {/* AI response */}
          <AnimatePresence>
            {response.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #10a37f, #1a7f64)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, color: '#fff',
                }}>
                  ✦
                </div>
                <div style={{ color: '#ececec', fontSize: 15, lineHeight: 1.85, flex: 1, paddingTop: 6 }}>
                  {response}
                  {!done && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 0.7, repeat: Infinity }}
                      style={{
                        display: 'inline-block', width: 2, height: '1em',
                        background: '#ececec', verticalAlign: 'text-bottom', marginLeft: 2,
                      }}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Start button */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onStart}
                  style={{
                    background: 'linear-gradient(135deg, #10a37f, #1a7f64)',
                    color: '#fff', border: 'none',
                    borderRadius: 99, padding: '14px 40px',
                    fontSize: 16, fontWeight: 500,
                    fontFamily: "'Noto Sans KR', sans-serif",
                    cursor: 'pointer', letterSpacing: '0.5px',
                    boxShadow: '0 4px 24px rgba(16,163,127,0.35)',
                  }}
                >
                  이야기 시작하기 →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
