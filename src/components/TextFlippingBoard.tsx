import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CHARSET = '가나다라마바사아자차카타파하거너더러머버서어저처0123456789★♡●'.split('');
const randomChar = () => CHARSET[Math.floor(Math.random() * CHARSET.length)];

interface FlipCharProps { target: string; delay: number; active: boolean }

function FlipChar({ target, delay, active }: FlipCharProps) {
  const [state, setState] = useState({ ch: target, k: 0 });

  useEffect(() => {
    if (!active) { setState(s => ({ ...s, ch: target })); return; }
    let cancelled = false;
    const t = setTimeout(() => {
      if (cancelled) return;
      let count = 0;
      const id = setInterval(() => {
        if (cancelled) { clearInterval(id); return; }
        count++;
        const done = count >= 9;
        setState(prev => ({ ch: done ? target : randomChar(), k: prev.k + 1 }));
        if (done) clearInterval(id);
      }, 52);
    }, delay);
    return () => { cancelled = true; clearTimeout(t); };
  }, [target, delay, active]);

  if (target === ' ') return <span style={{ display: 'inline-block', width: '0.5em' }} />;

  return (
    <motion.span
      key={state.k}
      initial={{ rotateX: -90, opacity: 0.5 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.045, ease: 'linear' }}
      style={{
        display: 'inline-block',
        minWidth: '1.05em',
        textAlign: 'center',
        background: '#141414',
        borderRadius: 4,
        margin: '0 2px',
        padding: '2px 3px',
        position: 'relative',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06), 0 3px 6px rgba(0,0,0,0.5)',
      }}
    >
      {state.ch}
      {/* Split-flap center divider */}
      <span style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(0,0,0,0.6)', pointerEvents: 'none' }} />
    </motion.span>
  );
}

interface Props {
  messages: string[];
  interval?: number;
  isActive: boolean;
}

export default function TextFlippingBoard({ messages, interval = 6000, isActive }: Props) {
  const [msgIdx, setMsgIdx] = useState(0);
  const next = useCallback(() => setMsgIdx(i => (i + 1) % messages.length), [messages.length]);

  useEffect(() => {
    if (!isActive) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [isActive, next, interval]);

  const lines = messages[msgIdx].split('\n');

  return (
    <motion.div
      animate={{ opacity: isActive ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      style={{
        background: '#0a0a0a',
        borderRadius: 14,
        padding: '52px 64px',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 20px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        alignItems: 'center',
        perspective: 800,
        fontFamily: "'Noto Sans KR', sans-serif",
        fontSize: 'clamp(26px, 2.8vw, 42px)',
        fontWeight: 700,
        color: '#f0ede0',
        letterSpacing: '0.04em',
        userSelect: 'none',
      }}
    >
      {lines.map((line, li) => {
        const offset = lines.slice(0, li).reduce((s, l) => s + l.length + 1, 0);
        return (
          <div key={`${msgIdx}-${li}`} style={{ display: 'flex', alignItems: 'center' }}>
            {line.split('').map((ch, ci) => (
              <FlipChar
                key={`${msgIdx}-${li}-${ci}`}
                target={ch}
                delay={(offset + ci) * 40}
                active={isActive}
              />
            ))}
          </div>
        );
      })}
    </motion.div>
  );
}
