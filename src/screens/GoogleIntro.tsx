import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IntroConfig } from '../config/introConfig';

interface Props {
  config: IntroConfig;
  onNext: () => void;
}

const LOGO_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];

export default function GoogleIntro({ config, onNext }: Props) {
  const [typed, setTyped] = useState('');
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    if (!showButton) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showButton, onNext]);

  useEffect(() => {
    const name = config.name;
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setTyped(name.slice(0, i));
        if (i >= name.length) {
          clearInterval(intervalId);
          setTimeout(() => setShowButton(true), 500);
        }
      }, 80);
    }, 300);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [config.name]);

  return (
    <div style={{
      width: '100vw', height: '100vh', background: '#1a1a1a',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 28, fontFamily: 'Arial, "Noto Sans KR", sans-serif',
    }}>
      {/* Google logo */}
      <div style={{ fontSize: 'clamp(52px, 8vw, 76px)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, userSelect: 'none' }}>
        {'Google'.split('').map((ch, i) => (
          <span key={i} style={{ color: LOGO_COLORS[i] }}>{ch}</span>
        ))}
      </div>

      {/* Search bar */}
      <div style={{
        width: 'min(580px, 85vw)',
        background: '#303134',
        border: '1px solid #5f6368',
        borderRadius: 24,
        padding: '13px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        <span style={{ fontSize: 18, color: '#9aa0a6', lineHeight: 1 }}>🔍</span>
        <span style={{
          flex: 1, fontSize: 17, color: '#e8eaed',
          letterSpacing: '0.01em', minHeight: '1.4em',
        }}>
          {typed}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{
              display: 'inline-block', width: 2, height: '1em',
              background: '#e8eaed', verticalAlign: 'text-bottom', marginLeft: 2,
            }}
          />
        </span>
      </div>

      {/* Search button */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onNext}
            style={{
              background: '#303134', color: '#e8eaed',
              border: '1px solid #5f6368', borderRadius: 6,
              padding: '10px 22px', fontSize: 14,
              cursor: 'pointer', letterSpacing: '0.01em',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#3c4043')}
            onMouseLeave={e => (e.currentTarget.style.background = '#303134')}
          >
            Google 검색
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
