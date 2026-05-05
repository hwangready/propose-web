import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';
import ClotheslineCard from './ClotheslineCard';
import ClotheslineDecorations from './ClotheslineDecorations';
import { CLOTHESLINE_CARDS } from '../config/clotheslineData';

interface Props {
  seqIdx: number;
  nextSection: () => void;
}

export const CARD_W = 300;
const CARD_SPACING = 420;
const LEFT_PAD = 350;
const RIGHT_PAD = 350;
const ROPE_BASE_Y = 270;
const MAX_SAG = 65;
const NUM_CARDS = 12;
const TOTAL_W = LEFT_PAD + (NUM_CARDS - 1) * CARD_SPACING + CARD_W + RIGHT_PAD;
const PAN_EASE = [0.25, 0.46, 0.45, 0.94] as const;
const Y_DROPS = [8, 42, 18, 55, 12, 35, 48, 6, 28, 22, 50, 10];

const cardCX  = (i: number) => LEFT_PAD + i * CARD_SPACING + CARD_W / 2;
const sagAt   = (x: number) => MAX_SAG * 4 * (x / TOTAL_W) * (1 - x / TOTAL_W);
const ropeYAt = (x: number) => ROPE_BASE_Y + sagAt(x);

function buildRopePath() {
  const SAG = 28;
  const pts = [
    { x: 20, y: ROPE_BASE_Y },
    ...Array.from({ length: NUM_CARDS }, (_, i) => ({ x: cardCX(i), y: ropeYAt(cardCX(i)) })),
    { x: TOTAL_W - 20, y: ROPE_BASE_Y },
  ];
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let k = 1; k < pts.length; k++) {
    const p = pts[k - 1], q = pts[k];
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2 + SAG;
    d += ` Q ${mx},${my} ${q.x},${q.y}`;
  }
  return d;
}
const ROPE_PATH = buildRopePath();

// ── 가랜더 ──────────────────────────────────────────
const BULB_COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6baf','#a8edfe','#ffc9de'];
function buildGarland() {
  const strings = [
    { baseY: 50, sag: 22, spacing: 175, offset: 0 },
    { baseY: 78, sag: 17, spacing: 150, offset: 88 },
  ];
  const items: Array<{ type: 'path'; d: string } | { type: 'bulb'; x: number; y: number; color: string }> = [];
  strings.forEach((s) => {
    const pts: {x:number; y:number}[] = [];
    for (let x = s.offset; x <= TOTAL_W + s.spacing; x += s.spacing) pts.push({ x, y: s.baseY });
    let d = '';
    pts.forEach((p, k) => {
      if (k === 0) { d = `M ${p.x},${p.y}`; return; }
      const prev = pts[k - 1];
      const mx = (prev.x + p.x) / 2, my = (prev.y + p.y) / 2 + s.sag;
      d += ` Q ${mx},${my} ${p.x},${p.y}`;
      items.push({ type: 'bulb', x: mx, y: my + 7, color: BULB_COLORS[(k - 1) % BULB_COLORS.length] });
    });
    items.push({ type: 'path', d });
  });
  return items;
}
const GARLAND_ITEMS = buildGarland();

function GarlandSVG() {
  return (
    <svg width={TOTAL_W} height={160}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 3, overflow: 'visible' }}>
      {GARLAND_ITEMS.map((item, i) =>
        item.type === 'path'
          ? <path key={i} d={item.d} fill="none" stroke="rgba(160,130,80,0.45)" strokeWidth="1.2" />
          : (
            <g key={i}>
              <circle cx={item.x} cy={item.y} r={7} fill={item.color} opacity="0.12"
                style={{ filter: 'blur(3px)' }} />
              <circle cx={item.x} cy={item.y} r={4.5} fill={item.color} opacity="0.85"
                style={{ filter: `drop-shadow(0 0 3px ${item.color})` }} />
            </g>
          )
      )}
    </svg>
  );
}

// ── 로프 SVG ────────────────────────────────────────
function RopeSVG() {
  return (
    <svg width={TOTAL_W} height={ROPE_BASE_Y + MAX_SAG + 120}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 5, overflow: 'visible' }}>
      <path d={ROPE_PATH} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="4"
        strokeLinecap="round" transform="translate(0,3)" />
      <path d={ROPE_PATH} fill="none" stroke="rgba(185,142,85,0.92)" strokeWidth="2.5" strokeLinecap="round" />
      <path d={ROPE_PATH} fill="none" stroke="rgba(255,235,185,0.22)" strokeWidth="1" strokeLinecap="round" />
      {Array.from({ length: NUM_CARDS }, (_, i) => {
        const cx = cardCX(i), ry = ropeYAt(cx), drop = Y_DROPS[i];
        if (drop <= 1) return null;
        return <line key={i} x1={cx} y1={ry} x2={cx} y2={ry + drop}
          stroke="rgba(145,112,68,0.72)" strokeWidth="1.4" strokeLinecap="round" />;
      })}
      <line x1="20" y1={ROPE_BASE_Y-36} x2="20" y2={ROPE_BASE_Y+6} stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
      <circle cx="20" cy={ROPE_BASE_Y} r="5.5" fill="rgba(210,165,108,0.9)" />
      <line x1={TOTAL_W-20} y1={ROPE_BASE_Y-36} x2={TOTAL_W-20} y2={ROPE_BASE_Y+6} stroke="#8B5E3C" strokeWidth="5" strokeLinecap="round" />
      <circle cx={TOTAL_W-20} cy={ROPE_BASE_Y} r="5.5" fill="rgba(210,165,108,0.9)" />
      {[0, 5, 11].map(i => {
        const cx = cardCX(i), ry = ropeYAt(cx);
        return <rect key={i} x={cx-22} y={ry-7} width={44} height={14} rx="2"
          fill={['rgba(200,185,230,0.55)','rgba(255,230,140,0.55)','rgba(180,220,200,0.5)'][i % 3]}
          transform={`rotate(${i%2===0?-5:4}, ${cx}, ${ry})`} />;
      })}
    </svg>
  );
}

// ── 불꽃놀이 캔버스 ──────────────────────────────────
interface FWParticle {
  x: number; y: number; vx: number; vy: number;
  color: string; life: number; maxLife: number; size: number;
  type: 'rocket' | 'spark' | 'trail';
  targetY?: number;
}

let _fwCtx: AudioContext | null = null;
function getFWAudio() {
  if (!_fwCtx || _fwCtx.state === 'closed')
    _fwCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (_fwCtx.state === 'suspended') _fwCtx.resume();
  return _fwCtx;
}
function playPop(freq = 900) {
  try {
    const ctx = getFWAudio();
    const len = Math.floor(ctx.sampleRate * 0.09);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random()*2-1) * Math.exp(-i / (len * 0.08));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const bpf = ctx.createBiquadFilter();
    bpf.type = 'bandpass'; bpf.frequency.value = freq; bpf.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.18, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
    src.connect(bpf); bpf.connect(g); g.connect(ctx.destination);
    src.start(); src.stop(ctx.currentTime + 0.09);
  } catch { /* ignore */ }
}

const FW_COLORS = [
  '#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#ff6baf',
  '#fff','#a8edfe','#ffc9de','#ffb347','#c084fc','#f9d6df',
];

function FireworksCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<FWParticle[]>([]);
  const rafRef = useRef<number>(0);
  const frameRef = useRef(0);
  const lastPopRef = useRef(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = particlesRef.current;

    function launch() {
      const x = 50 + Math.random() * (canvas.width - 100);
      const targetY = 50 + Math.random() * canvas.height * 0.55;
      const color = FW_COLORS[Math.floor(Math.random() * FW_COLORS.length)];
      const dist = canvas.height - targetY;
      particles.push({
        x, y: canvas.height + 10,
        vx: (x - canvas.width / 2) * 0.012,
        vy: -(dist / 32),
        color, life: 60, maxLife: 60,
        size: 3, type: 'rocket', targetY,
      });
    }

    function explode(ex: number, ey: number, color: string) {
      const count = 70 + Math.floor(Math.random() * 40);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
        const speed = 1.5 + Math.random() * 5.5;
        const life = 45 + Math.floor(Math.random() * 35);
        particles.push({
          x: ex, y: ey,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          color: Math.random() > 0.25 ? color : '#fff',
          life, maxLife: life + 5,
          size: 1.5 + Math.random() * 2.2,
          type: 'spark',
        });
      }
      // pop sound (throttled)
      const now = Date.now();
      if (now - lastPopRef.current > 120) {
        lastPopRef.current = now;
        playPop(700 + Math.random() * 800);
      }
    }

    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.17)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      frameRef.current++;
      const f = frameRef.current;
      // 처음 3초 집중 발사, 이후 지속
      if (f % 20 === 0) launch();
      if (f < 90 && f % 28 === 14) launch();
      if (f < 60 && f % 40 === 0) { launch(); launch(); }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vy += p.type === 'rocket' ? 0.06 : 0.09;
        p.life--;

        if (p.type === 'rocket') {
          if (p.targetY !== undefined && p.y <= p.targetY) {
            explode(p.x, p.y, p.color);
            particles.splice(i, 1);
            continue;
          }
          // 로켓 궤적
          ctx.globalAlpha = 0.92;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.globalAlpha = 0.3;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 5, p.y - p.vy * 5);
          ctx.strokeStyle = p.color; ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          const alpha = (p.life / p.maxLife);
          ctx.globalAlpha = alpha * 0.88;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
          p.vx *= 0.96; p.vy *= 0.96;
        }
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    // 즉시 5발 발사
    for (let i = 0; i < 5; i++) setTimeout(launch, i * 180);
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      particlesRef.current = [];
      frameRef.current = 0;
    };
  }, [active]);

  if (!active) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, zIndex: 88, pointerEvents: 'none' }}
    />
  );
}

// ── 축하 최종 화면 ───────────────────────────────────
const PETAL_COLORS = ['#ffb3c6','#e05c7a','#f9d6df','#fff','#ffcad4','#ffd6e8','#c084fc','#a8edfe'];

function CelebrationScreen() {
  useEffect(() => {
    // 부드러운 BGM
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const chords = [[261,329,392],[261,311,392],[220,277,349],[261,329,440]];
      let t = ctx.currentTime + 0.3;
      const play = (repeat: number) => {
        if (repeat <= 0) return;
        chords.forEach(chord => {
          chord.forEach(freq => {
            const o = ctx.createOscillator(), g = ctx.createGain();
            o.type = 'triangle'; o.frequency.value = freq;
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(0.055, t + 0.15);
            g.gain.setValueAtTime(0.055, t + 0.75);
            g.gain.linearRampToValueAtTime(0, t + 1.0);
            o.connect(g); g.connect(ctx.destination);
            o.start(t); o.stop(t + 1.05);
          });
          t += 1.05;
        });
        play(repeat - 1);
      };
      play(2);
    } catch { /* ignore */ }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.4 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 92,
        background: 'radial-gradient(ellipse at 50% 45%, rgba(28,10,48,0.94) 0%, rgba(5,2,14,0.97) 100%)',
        backdropFilter: 'blur(3px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* 별 배경 */}
      {Array.from({ length: 60 }, (_, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.1, 0.8, 0.1] }}
          transition={{ duration: 1.5 + (i%5)*0.4, repeat: Infinity, delay: (i*0.07)%2.5 }}
          style={{
            position: 'absolute',
            left: `${(i*37+11) % 100}%`, top: `${(i*53+7) % 100}%`,
            width: i%5===0 ? 3 : 1.5, height: i%5===0 ? 3 : 1.5,
            borderRadius: '50%',
            background: i%7===0 ? 'rgba(200,180,255,0.9)' : 'rgba(255,255,255,0.7)',
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* 떨어지는 꽃잎 */}
      {Array.from({ length: 32 }, (_, i) => (
        <motion.div
          key={`petal-${i}`}
          initial={{ x: `${5 + (i*41+13) % 90}vw`, y: '-5vh', opacity: 0, rotate: 0 }}
          animate={{ y: '108vh', opacity: [0, 1, 0.9, 0], rotate: (i%2===0?1:-1)*(200+i*18) }}
          transition={{
            duration: 4.5 + (i%5)*0.7,
            delay: (i*0.22) % 4,
            repeat: Infinity, ease: 'linear',
          }}
          style={{
            position: 'fixed',
            width: 10 + (i%5)*3, height: 10 + (i%5)*3,
            borderRadius: i%3===0 ? '50%' : '50% 0 50% 0',
            background: PETAL_COLORS[i % PETAL_COLORS.length],
            pointerEvents: 'none', zIndex: 1,
            boxShadow: `0 0 6px ${PETAL_COLORS[i % PETAL_COLORS.length]}`,
          }}
        />
      ))}

      {/* 중앙 콘텐츠 */}
      <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        {/* 링 이모지 */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.4, duration: 0.9, type: 'spring', stiffness: 180 }}
          style={{ fontSize: 72, marginBottom: 28, filter: 'drop-shadow(0 0 24px rgba(255,200,100,0.6))' }}
        >
          💍
        </motion.div>

        {/* 메인 텍스트 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.25,0.46,0.45,0.94] }}
          style={{
            fontFamily: "'Dancing Script', cursive",
            fontSize: 'clamp(40px, 7vw, 88px)',
            color: 'rgba(255,220,180,0.97)',
            textShadow: '0 0 50px rgba(255,180,100,0.45), 0 0 100px rgba(255,80,180,0.25)',
            lineHeight: 1.15,
            marginBottom: 20,
          }}
        >
          사랑해,<br />영원히 ♡
        </motion.div>

        {/* 서브 텍스트 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 1 }}
          style={{
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: 14, color: 'rgba(200,180,160,0.6)',
            letterSpacing: '4px', marginTop: 12,
          }}
        >
          함께해줘서 고마워
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── 청혼 오버레이 ────────────────────────────────────
const NO_LABELS = ['음... 글쎄','정말...? 💕','한 번 더 생각해봐','나 슬퍼지잖아 😢','마지막 기회야 💍','제발... 🥺'];

function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    [523,659,784,1047].forEach((freq, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      const t = ctx.currentTime + i * 0.16;
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.18, t+0.05);
      g.gain.linearRampToValueAtTime(0, t+0.55);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t+0.6);
    });
  } catch { /* ignore */ }
}

interface FinaleOverlayProps {
  visible: boolean;
  noCount: number;
  onYes: () => void;
  onNo: () => void;
}

function FinaleOverlay({ visible, noCount, onYes, onNo }: FinaleOverlayProps) {
  const noScale = Math.max(0.38, 1 - noCount * 0.14);
  const noLabel = NO_LABELS[Math.min(noCount, NO_LABELS.length - 1)];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="finale"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.7, ease: [0.25,0.46,0.45,0.94] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
            background: 'linear-gradient(to top, rgba(5,2,12,0.97) 0%, rgba(5,2,12,0.88) 60%, transparent 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '44px 24px 56px',
          }}
        >
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 52, filter: 'drop-shadow(0 0 18px rgba(255,200,100,0.6))', marginBottom: 16 }}
          >
            💍
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 44, color: 'rgba(255,220,180,0.95)',
              textAlign: 'center',
              textShadow: '0 0 30px rgba(255,180,100,0.4)',
              lineHeight: 1.1, marginBottom: 12,
            }}
          >
            나랑 결혼해 줄래?
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              fontFamily: "'Noto Sans KR', sans-serif",
              fontSize: 13, lineHeight: 2,
              color: 'rgba(200,180,160,0.58)',
              textAlign: 'center', letterSpacing: '1px', marginBottom: 24,
            }}
          >
            우리의 모든 순간들이<br />이 한 마디를 위해 있었어
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', gap: 20, alignItems: 'center' }}
          >
            <motion.button
              whileHover={{ scale: 1.07, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => { e.stopPropagation(); onYes(); }}
              style={{
                padding: '14px 44px', borderRadius: 50, border: 'none',
                background: 'linear-gradient(135deg, #3eb489 0%, #2a9068 100%)',
                color: '#fff', fontSize: 18,
                fontFamily: "'Noto Sans KR', sans-serif", fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 28px rgba(62,180,137,0.5), 0 8px 24px rgba(0,0,0,0.4)',
                letterSpacing: '1px',
              }}
            >
              응, 할게 💕
            </motion.button>

            <motion.button
              animate={{ scale: noScale }}
              whileTap={{ scale: noScale * 0.95 }}
              onClick={(e) => { e.stopPropagation(); onNo(); }}
              style={{
                padding: '12px 24px', borderRadius: 50,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'transparent',
                color: 'rgba(200,180,160,0.48)',
                fontSize: 13, fontFamily: "'Noto Sans KR', sans-serif",
                cursor: 'pointer', letterSpacing: '0.5px',
              }}
            >
              {noLabel}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── 메인 컴포넌트 ────────────────────────────────────
export default function ClotheslineCanvas({ seqIdx, nextSection }: Props) {
  const x = useMotionValue(0);
  const [vw, setVw] = useState(1200);
  const [showFinale, setShowFinale] = useState(false);
  const [noCount, setNoCount] = useState(0);
  // 'idle' → 'fireworks' → 'final'
  const [celebPhase, setCelebPhase] = useState<'idle' | 'fireworks' | 'final'>('idle');
  const finaleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => setVw(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    animate(x, vw / 2 - cardCX(seqIdx), { duration: 0.75, ease: PAN_EASE });
  }, [seqIdx, vw, x]);

  useEffect(() => {
    if (finaleTimerRef.current) clearTimeout(finaleTimerRef.current);
    if (seqIdx === NUM_CARDS - 1) {
      finaleTimerRef.current = setTimeout(() => setShowFinale(true), 1000);
    } else {
      setShowFinale(false);
      setCelebPhase('idle');
      setNoCount(0);
    }
    return () => { if (finaleTimerRef.current) clearTimeout(finaleTimerRef.current); };
  }, [seqIdx]);

  const handleYes = () => {
    playChime();
    setShowFinale(false);
    // 잠깐 후 불꽃 시작
    setTimeout(() => setCelebPhase('fireworks'), 400);
    // 5초 후 최종 축하 화면
    setTimeout(() => setCelebPhase('final'), 5200);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, overflow: 'hidden',
        background: 'linear-gradient(160deg, #1e1208 0%, #140e06 45%, #0a0e18 100%)',
        cursor: 'pointer',
      }}
      onClick={nextSection}
    >
      <motion.div
        style={{ x, position: 'absolute', top: 0, left: 0, width: TOTAL_W, height: '100%' }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <ClotheslineDecorations />
        </div>

        <GarlandSVG />
        <RopeSVG />

        {/* 활성 카드 네온 글로우 */}
        {CLOTHESLINE_CARDS.map((_, i) => {
          if (seqIdx !== i) return null;
          const cx = cardCX(i), ry = ropeYAt(cx), drop = Y_DROPS[i];
          return (
            <motion.div
              key={`glow-${i}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                position: 'absolute',
                left: cx - CARD_W / 2 - 55, top: ry + drop + 25,
                width: CARD_W + 110, height: 340,
                background: 'radial-gradient(ellipse at 50% 30%, rgba(255,200,80,0.15) 0%, rgba(255,60,180,0.1) 45%, transparent 70%)',
                filter: 'blur(34px)', zIndex: 6, pointerEvents: 'none',
              }}
            />
          );
        })}

        {/* 카드 */}
        {CLOTHESLINE_CARDS.map((cardData, i) => {
          const cx = cardCX(i), ry = ropeYAt(cx), drop = Y_DROPS[i];
          return (
            <div key={i} style={{
              position: 'absolute',
              left: cx - CARD_W / 2,
              top: ry + drop - 8,
              zIndex: 10,
            }} onClick={(e) => e.stopPropagation()}>
              <ClotheslineCard {...cardData} isActive={seqIdx === i} seqIdx={i} />
            </div>
          );
        })}
      </motion.div>

      {/* 청혼 오버레이 */}
      <FinaleOverlay
        visible={showFinale}
        noCount={noCount}
        onYes={handleYes}
        onNo={() => setNoCount(n => n + 1)}
      />

      {/* 불꽃놀이 */}
      <FireworksCanvas active={celebPhase === 'fireworks' || celebPhase === 'final'} />

      {/* 최종 축하 화면 */}
      <AnimatePresence>
        {celebPhase === 'final' && <CelebrationScreen key="celeb" />}
      </AnimatePresence>
    </div>
  );
}
