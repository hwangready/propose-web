import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { IntroConfig } from '../config/introConfig';

interface Props {
  config: IntroConfig;
  onNext: () => void;
}

const LOGO_COLORS = ['#4285F4', '#EA4335', '#FBBC05', '#4285F4', '#34A853', '#EA4335'];

// 공유 AudioContext
let _audioCtx: AudioContext | null = null;
function getAudioCtx() {
  if (!_audioCtx || _audioCtx.state === 'closed') {
    _audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function playTypingSound() {
  try {
    const ctx = getAudioCtx();
    const len = Math.floor(ctx.sampleRate * 0.042);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.18));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 1800 + Math.random() * 600;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.038);

    src.connect(hpf); hpf.connect(gain); gain.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.04);
  } catch { /* ignore */ }
}

function playEnterSound() {
  try {
    const ctx = getAudioCtx();

    // 노이즈 클릭 (타이핑보다 강하게)
    const len = Math.floor(ctx.sampleRate * 0.07);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.12));
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass';
    bpf.frequency.value = 1600; bpf.Q.value = 0.7;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.38, ctx.currentTime);
    g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.065);
    src.connect(bpf); bpf.connect(g1); g1.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.07);

    // 저음 쿵
    const osc = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, ctx.currentTime + 0.09);
    g2.gain.setValueAtTime(0.28, ctx.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
    osc.connect(g2); g2.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.1);
  } catch { /* ignore */ }
}

export default function GoogleIntro({ config, onNext }: Props) {
  const [ready, setReady] = useState(false);
  const [typed, setTyped] = useState('');
  const [showButton, setShowButton] = useState(false);

  const handleStart = () => {
    // 유저 제스처 시점에 AudioContext 잠금 해제
    getAudioCtx();
    setReady(true);
  };

  const handleNext = () => {
    playEnterSound();
    onNext();
  };

  useEffect(() => {
    if (!showButton) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showButton]);

  useEffect(() => {
    if (!ready) return;
    const name = config.name;
    let i = 0;
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        i++;
        setTyped(name.slice(0, i));
        playTypingSound();
        if (i >= name.length) {
          clearInterval(intervalId);
          setTimeout(() => setShowButton(true), 500);
        }
      }, 82);
    }, 320);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [ready, config.name]);

  return (
    <div
      style={{
        width: '100vw', height: '100vh', background: '#1a1a1a',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 28, fontFamily: 'Arial, "Noto Sans KR", sans-serif',
        cursor: ready ? 'default' : 'pointer',
      }}
      onClick={!ready ? handleStart : undefined}
    >
      {!ready && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 12, zIndex: 10,
          }}
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{ fontSize: 13, color: 'rgba(160,160,160,0.7)', letterSpacing: '3px' }}
          >
            화면을 클릭하세요
          </motion.div>
        </motion.div>
      )}
      {/* Google 로고 */}
      <div style={{ fontSize: 'clamp(52px, 8vw, 76px)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1, userSelect: 'none' }}>
        {'Google'.split('').map((ch, i) => (
          <span key={i} style={{ color: LOGO_COLORS[i] }}>{ch}</span>
        ))}
      </div>

      {/* 검색창 */}
      <div style={{
        width: 'min(580px, 85vw)', background: '#303134',
        border: '1px solid #5f6368', borderRadius: 24,
        padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
      }}>
        <span style={{ fontSize: 18, color: '#9aa0a6', lineHeight: 1 }}>🔍</span>
        <span style={{ flex: 1, fontSize: 17, color: '#e8eaed', letterSpacing: '0.01em', minHeight: '1.4em' }}>
          {typed}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.9, repeat: Infinity }}
            style={{ display: 'inline-block', width: 2, height: '1em', background: '#e8eaed', verticalAlign: 'text-bottom', marginLeft: 2 }}
          />
        </span>
      </div>

      {/* 검색 버튼 */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onClick={handleNext}
            style={{
              background: '#303134', color: '#e8eaed',
              border: '1px solid #5f6368', borderRadius: 6,
              padding: '10px 22px', fontSize: 14, cursor: 'pointer',
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
