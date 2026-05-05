import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useImageViewer } from '../context/ImageContext';
import { SCRAPBOOK_PAGES } from '../config/scrapbookData';
import type { ScrapbookPhoto, ScrapbookPage } from '../config/scrapbookData';

interface Props {
  seqIdx: number;
  nextSection: () => void;
}

const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const MIN_W = 160;
const MAX_W = 480;

// ── Seeded RNG ────────────────────────────────────────────────────────────────
function seededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── Auto-arrange ──────────────────────────────────────────────────────────────
const ZONES: Record<number, Array<{ x: number; y: number }>> = {
  1: [{ x: 34, y: 18 }],
  2: [{ x: 10, y: 14 }, { x: 50, y: 12 }],
  3: [{ x: 8, y: 10 }, { x: 46, y: 18 }, { x: 22, y: 46 }],
  4: [{ x: 8, y: 10 }, { x: 48, y: 8 }, { x: 10, y: 46 }, { x: 50, y: 44 }],
};

function autoArrange(count: number) {
  const n = Math.min(count, 4);
  const zones = ZONES[n] || ZONES[4];
  return Array.from({ length: count }, (_, i) => {
    const z = zones[i % zones.length];
    return {
      x: Math.max(4, Math.min(70, z.x + (Math.random() - 0.5) * 10)),
      y: Math.max(4, Math.min(54, z.y + (Math.random() - 0.5) * 8)),
      rotate: (Math.random() - 0.5) * 16,
    };
  });
}

// ── BGM ──────────────────────────────────────────────────────────────────────
let _bgmCtx: AudioContext | null = null;
let _bgmMaster: GainNode | null = null;
const _bgmNodes: AudioNode[] = [];

function startBGM() {
  try {
    if (!_bgmCtx) _bgmCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (_bgmCtx.state === 'suspended') _bgmCtx.resume();
    const ctx = _bgmCtx;
    _bgmMaster = ctx.createGain();
    _bgmMaster.gain.setValueAtTime(0, ctx.currentTime);
    _bgmMaster.gain.linearRampToValueAtTime(0.065, ctx.currentTime + 3);
    _bgmMaster.connect(ctx.destination);
    [261.63, 329.63, 392.0, 493.88].forEach(f => {
      [f, f * 1.004].forEach(freq => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq; g.gain.value = 0.13;
        osc.connect(g); g.connect(_bgmMaster!); osc.start();
        _bgmNodes.push(osc, g);
      });
    });
    const lfo = ctx.createOscillator();
    const lg = ctx.createGain();
    lfo.frequency.value = 0.08; lg.gain.value = 0.018;
    lfo.connect(lg); lg.connect(_bgmMaster.gain); lfo.start();
    _bgmNodes.push(lfo, lg);
  } catch { /**/ }
}

function stopBGM() {
  if (!_bgmCtx || !_bgmMaster) return;
  try {
    _bgmMaster.gain.linearRampToValueAtTime(0, _bgmCtx.currentTime + 1.5);
    setTimeout(() => {
      _bgmNodes.forEach(n => { try { (n as OscillatorNode).stop?.(); } catch { /**/ } });
      _bgmNodes.length = 0;
      _bgmMaster?.disconnect(); _bgmMaster = null;
    }, 1800);
  } catch { /**/ }
}

// ── Cute background decorations ───────────────────────────────────────────────
const DECO_COLORS = [
  'rgba(230,145,155,{a})',
  'rgba(210,168,82,{a})',
  'rgba(135,178,148,{a})',
  'rgba(178,155,210,{a})',
  'rgba(148,188,218,{a})',
];

const HEART_PATH = 'M0,-4 C-1.2,-7 -6,-4 -6,-1 C-6,3 -3,6 0,9 C3,6 6,3 6,-1 C6,-4 1.2,-7 0,-4Z';
const STAR_PATH = 'M0,-7 L1.6,-2.6 L6,-2.6 L2.8,0.4 L4,5 L0,2.4 L-4,5 L-2.8,0.4 L-6,-2.6 L-1.6,-2.6Z';
const FLOWER_PATH = 'M0,-6 C2,-3 6,-2 6,0 C6,2 2,3 0,6 C-2,3 -6,2 -6,0 C-6,-2 -2,-3 0,-6Z M0,-3 C-1,-1 -3,-1 -3,0 C-3,1 -1,1 0,3 C1,1 3,1 3,0 C3,-1 1,-1 0,-3Z';
const NOTE_PATH = 'M2,-8 L2,0 M2,-8 L6,-6 M2,0 C2,1.5 0,2.5 0,1.5 C0,0.5 2,-0.5 2,0Z';

function BackgroundDecorations({ seqIdx }: { seqIdx: number }) {
  const items = useMemo(() => {
    const rng = seededRng(seqIdx * 7919 + 1234);
    return Array.from({ length: 22 }, (_, i) => {
      const typeIdx = Math.floor(rng() * 5);
      const colorTemplate = DECO_COLORS[Math.floor(rng() * DECO_COLORS.length)];
      const alpha = (0.06 + rng() * 0.1).toFixed(2);
      return {
        x: rng() * 92 + 4,
        y: rng() * 85 + 4,
        type: typeIdx,
        size: 6 + rng() * 12,
        color: colorTemplate.replace('{a}', alpha),
        rotate: rng() * 360,
      };
    });
  }, [seqIdx]);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3, overflow: 'visible' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {items.map((d, i) => (
        <g key={i} transform={`translate(${d.x},${d.y}) rotate(${d.rotate}) scale(${d.size / 12})`}>
          {d.type === 0 && <path d={HEART_PATH} fill={d.color} />}
          {d.type === 1 && <path d={STAR_PATH} fill={d.color} />}
          {d.type === 2 && <circle r="2.5" fill={d.color} />}
          {d.type === 3 && <path d={FLOWER_PATH} fill={d.color} />}
          {d.type === 4 && <path d={NOTE_PATH} fill="none" stroke={d.color} strokeWidth="1.2" strokeLinecap="round" />}
        </g>
      ))}
    </svg>
  );
}

// ── Tape strip ────────────────────────────────────────────────────────────────
function TapeStrip({ color, style }: { color: string; style: React.CSSProperties }) {
  return (
    <div style={{
      position: 'absolute', width: 44, height: 13,
      background: color, borderRadius: 2,
      boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.35)',
      zIndex: 2, pointerEvents: 'none', ...style,
    }} />
  );
}

// ── Resize buttons ────────────────────────────────────────────────────────────
function ResizeControls({ onResize }: { onResize: (delta: number) => void }) {
  const btn: React.CSSProperties = {
    width: 26, height: 26, borderRadius: '50%', border: 'none',
    background: 'rgba(232,160,180,0.85)', color: '#fff',
    fontSize: 16, lineHeight: '26px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)', flexShrink: 0,
  };
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 7 }}
      onClick={(e) => e.stopPropagation()}>
      <button style={btn} onClick={() => onResize(-24)} title="축소">−</button>
      <button style={btn} onClick={() => onResize(24)} title="확대">＋</button>
    </div>
  );
}

// ── Polaroid card ─────────────────────────────────────────────────────────────
function Polaroid({
  photo, editMode, onMove, onResize, onTitleChange, onImageClick,
}: {
  photo: ScrapbookPhoto;
  editMode: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, delta: number) => void;
  onTitleChange: (id: string, val: string) => void;
  onImageClick: () => void;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <motion.div
      drag={editMode && !editingTitle}
      dragMomentum={false}
      dragElastic={0.04}
      style={{
        position: 'absolute', left: `${photo.x}%`, top: `${photo.y}%`,
        x: dragX, y: dragY, zIndex: 10,
        cursor: editMode ? 'grab' : 'pointer',
        transformOrigin: 'center center',
      }}
      animate={{ rotate: photo.rotate }}
      whileDrag={{ scale: 1.04, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = Math.max(2, Math.min(72, photo.x + (info.offset.x / window.innerWidth) * 100));
        const ny = Math.max(2, Math.min(58, photo.y + (info.offset.y / window.innerHeight) * 100));
        onMove(photo.id, nx, ny);
        dragX.set(0); dragY.set(0);
      }}
      onClick={(e) => { e.stopPropagation(); if (!editMode) onImageClick(); }}
    >
      <TapeStrip color="rgba(255,226,128,0.62)" style={{ top: -9, left: 14, transform: 'rotate(-4deg)' }} />
      <TapeStrip color="rgba(196,180,232,0.62)" style={{ top: -8, right: 14, transform: 'rotate(5deg)', width: 38 }} />

      <div style={{
        background: '#fffdf8',
        padding: '9px 9px 50px',
        width: photo.width,
        boxShadow: editMode
          ? '0 10px 32px rgba(232,160,180,0.5), 0 4px 12px rgba(0,0,0,0.16)'
          : '0 8px 30px rgba(0,0,0,0.24), 0 2px 8px rgba(0,0,0,0.1)',
        transition: 'box-shadow 0.3s',
        position: 'relative',
      }}>
        <img
          src={photo.src}
          alt={photo.title}
          style={{ width: '100%', height: Math.round(photo.width * 0.76), objectFit: 'cover', display: 'block' }}
          draggable={false}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px', textAlign: 'center' }}>
          {editingTitle ? (
            <input
              autoFocus
              defaultValue={photo.title}
              onBlur={(e) => { onTitleChange(photo.id, e.target.value); setEditingTitle(false); }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); e.stopPropagation(); }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '90%', border: 'none', borderBottom: '1px solid rgba(200,144,90,0.5)',
                background: 'transparent', textAlign: 'center',
                fontFamily: "'Dancing Script', cursive", fontSize: 16, color: '#6a4e35',
                outline: 'none',
              }}
            />
          ) : (
            <div
              style={{ fontFamily: "'Dancing Script', cursive", fontSize: 16, color: '#6a4e35', cursor: editMode ? 'text' : 'default', minHeight: 22 }}
              onClick={(e) => { e.stopPropagation(); if (editMode) setEditingTitle(true); }}
              title={editMode ? '클릭하여 텍스트 편집' : ''}
            >
              {photo.title || (editMode ? <span style={{ opacity: 0.3 }}>제목 입력...</span> : '')}
            </div>
          )}
        </div>
      </div>

      {editMode && <ResizeControls onResize={(d) => onResize(photo.id, d)} />}
      {editMode && (
        <div style={{
          position: 'absolute', top: -5, right: -5,
          width: 13, height: 13, borderRadius: '50%',
          background: '#e8a0b4', border: '2px solid #fff',
          zIndex: 3, pointerEvents: 'none',
        }} />
      )}
    </motion.div>
  );
}

// ── Text card ─────────────────────────────────────────────────────────────────
function TextCard({
  photo, editMode, onMove, onResize, onTextChange,
}: {
  photo: ScrapbookPhoto;
  editMode: boolean;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, delta: number) => void;
  onTextChange: (id: string, val: string) => void;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [editingText, setEditingText] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const text = photo.textContent || '';

  useEffect(() => {
    if (editMode) { setVisibleChars(text.length); return; }
    setVisibleChars(0);
    if (!text) return;
    let count = 0;
    const id = setInterval(() => {
      count++;
      setVisibleChars(count);
      if (count >= text.length) clearInterval(id);
    }, 55);
    return () => clearInterval(id);
  }, [text, editMode]);

  return (
    <motion.div
      drag={editMode && !editingText}
      dragMomentum={false}
      dragElastic={0.04}
      style={{
        position: 'absolute', left: `${photo.x}%`, top: `${photo.y}%`,
        x: dragX, y: dragY, zIndex: 12,
        cursor: editMode ? 'grab' : 'default',
        transformOrigin: 'center center',
      }}
      animate={{ rotate: photo.rotate }}
      whileDrag={{ scale: 1.03, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = Math.max(2, Math.min(72, photo.x + (info.offset.x / window.innerWidth) * 100));
        const ny = Math.max(2, Math.min(58, photo.y + (info.offset.y / window.innerHeight) * 100));
        onMove(photo.id, nx, ny);
        dragX.set(0); dragY.set(0);
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Tape strip on text card */}
      <TapeStrip color="rgba(255,200,140,0.65)" style={{ top: -9, left: '50%', marginLeft: -22, transform: 'rotate(-2deg)' }} />

      <div style={{
        background: 'rgba(255,253,240,0.94)',
        border: '1px solid rgba(200,160,100,0.2)',
        borderRadius: 4,
        padding: '22px 24px 20px',
        width: photo.width,
        minHeight: 80,
        boxShadow: editMode
          ? '0 8px 28px rgba(232,160,180,0.45), 0 3px 10px rgba(0,0,0,0.12)'
          : '0 6px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        position: 'relative',
      }}>
        {editingText ? (
          <textarea
            autoFocus
            defaultValue={text}
            rows={3}
            onBlur={(e) => { onTextChange(photo.id, e.target.value); setEditingText(false); }}
            onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Escape') e.currentTarget.blur(); }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%', border: 'none', resize: 'none',
              background: 'transparent', outline: 'none',
              fontFamily: "'Dancing Script', cursive", fontSize: 22, color: '#5a3828',
              lineHeight: 1.55,
            }}
          />
        ) : (
          <div
            style={{
              fontFamily: "'Dancing Script', cursive",
              fontSize: 22, color: '#5a3828', lineHeight: 1.55,
              cursor: editMode ? 'text' : 'default', whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
            onClick={(e) => { e.stopPropagation(); if (editMode) setEditingText(true); }}
            title={editMode ? '클릭하여 텍스트 편집' : ''}
          >
            {editMode ? text || <span style={{ opacity: 0.3 }}>텍스트 입력...</span> : (
              <>
                {text.slice(0, visibleChars)}
                {visibleChars < text.length && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                    style={{ display: 'inline-block', width: 2, height: '1.1em', background: '#c8905a', verticalAlign: 'text-bottom', marginLeft: 2 }}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      {editMode && <ResizeControls onResize={(d) => onResize(photo.id, d)} />}
    </motion.div>
  );
}

// ── Full-screen background image ──────────────────────────────────────────────
function BgImageLayer({ src }: { src?: string }) {
  if (!src) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Paper overlay so photos read well */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(242,236,224,0.55)' }} />
    </motion.div>
  );
}

// ── Upload / edit panel ───────────────────────────────────────────────────────
function EditPanel({
  seqIdx, onClose, onUpload, onAddText, onSetBgImage,
}: {
  seqIdx: number;
  onClose: () => void;
  onUpload: (files: File[]) => void;
  onAddText: () => void;
  onSetBgImage: (file: File) => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pending, setPending] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setPending(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const sectionLabel: React.CSSProperties = {
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 10, letterSpacing: '2px',
    color: 'rgba(100,65,40,0.5)', marginBottom: 8,
  };

  const actionBtn: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,248,235,0.9)',
    border: '1px solid rgba(200,144,90,0.28)',
    borderRadius: 10, cursor: 'pointer',
    fontFamily: "'Noto Sans KR', sans-serif",
    fontSize: 13, color: '#6a4022',
    textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
    transition: 'background 0.18s',
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 24, stiffness: 200 }}
      style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 280,
        background: 'rgba(248,242,230,0.97)',
        backdropFilter: 'blur(14px)',
        boxShadow: '-4px 0 28px rgba(0,0,0,0.16)',
        zIndex: 300, padding: '24px 18px',
        display: 'flex', flexDirection: 'column', gap: 20,
        overflowY: 'auto',
        borderLeft: '1px solid rgba(200,160,100,0.2)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: '#5a3828' }}>
          편집 패널
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#9a7060' }}>×</button>
      </div>
      <div style={{ fontSize: 10, color: 'rgba(100,65,40,0.5)', fontFamily: "'Noto Sans KR', sans-serif", letterSpacing: '1.5px' }}>
        페이지 {seqIdx + 1} / 12
      </div>

      {/* 사진 추가 */}
      <div>
        <div style={sectionLabel}>📷 사진 추가</div>
        <div
          onClick={() => photoRef.current?.click()}
          style={{
            border: '2px dashed rgba(200,144,90,0.38)', borderRadius: 12,
            padding: '20px', textAlign: 'center', cursor: 'pointer',
            color: 'rgba(110,72,44,0.55)', fontSize: 13,
            fontFamily: "'Noto Sans KR', sans-serif",
            background: 'rgba(255,252,242,0.8)',
          }}
        >
          클릭하여 사진 선택
          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.55 }}>여러 장 동시 선택 가능</div>
        </div>
        <input ref={photoRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleChange} />

        {previews.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {previews.map((p, i) => (
              <img key={i} src={p} style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 8, border: '2px solid rgba(200,144,90,0.28)' }} />
            ))}
          </div>
        )}
        {pending.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onUpload(pending); setPending([]); setPreviews([]); onClose(); }}
            style={{
              marginTop: 10, width: '100%',
              background: 'linear-gradient(135deg, #e8a0b4, #c8905a)',
              border: 'none', borderRadius: 20,
              color: '#fff', fontSize: 13,
              fontFamily: "'Noto Sans KR', sans-serif",
              padding: '10px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(232,160,180,0.35)',
            }}
          >
            자동 배치 ({pending.length}장)
          </motion.button>
        )}
      </div>

      {/* 텍스트 카드 */}
      <div>
        <div style={sectionLabel}>✏️ 텍스트 카드</div>
        <button
          style={actionBtn}
          onClick={() => { onAddText(); onClose(); }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,238,215,0.95)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,248,235,0.9)')}
        >
          <span style={{ fontSize: 18 }}>📝</span>
          <span>텍스트 카드 추가</span>
        </button>
      </div>

      {/* 배경 이미지 */}
      <div>
        <div style={sectionLabel}>🖼 배경 이미지</div>
        <button
          style={actionBtn}
          onClick={() => bgRef.current?.click()}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,238,215,0.95)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,248,235,0.9)')}
        >
          <span style={{ fontSize: 18 }}>🌄</span>
          <span>전체화면 배경 설정</span>
        </button>
        <input
          ref={bgRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) { onSetBgImage(f); onClose(); }
          }}
        />
      </div>

      {/* 도움말 */}
      <div style={{
        marginTop: 'auto', padding: '14px', borderRadius: 10,
        background: 'rgba(200,144,90,0.08)',
        border: '1px solid rgba(200,144,90,0.15)',
      }}>
        <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11, color: 'rgba(100,65,40,0.65)', lineHeight: 1.8, letterSpacing: '0.3px' }}>
          ✏️ 편집 모드에서:<br />
          • 폴라로이드 드래그로 이동<br />
          • ＋/− 버튼으로 크기 조절<br />
          • 제목 클릭으로 텍스트 편집
        </div>
      </div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ScrapbookCanvas({ seqIdx, nextSection }: Props) {
  const [pages, setPages] = useState<ScrapbookPage[]>(() => {
    try {
      const raw = localStorage.getItem('scrapbook_layout');
      if (raw) {
        const saved = JSON.parse(raw) as ScrapbookPage[];
        return SCRAPBOOK_PAGES.map((def, i) => ({
          ...def,
          photos: saved[i]?.photos ?? def.photos,
          bgImage: saved[i]?.bgImage,
        }));
      }
    } catch { /**/ }
    return SCRAPBOOK_PAGES.map(p => ({ ...p }));
  });

  const [editMode, setEditMode] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const { openViewer } = useImageViewer();
  const bgmStarted = useRef(false);

  const save = useCallback((next: ScrapbookPage[]) => {
    try { localStorage.setItem('scrapbook_layout', JSON.stringify(next)); } catch { /**/ }
  }, []);

  const updatePages = useCallback((updater: (prev: ScrapbookPage[]) => ScrapbookPage[]) => {
    setPages(prev => {
      const next = updater(prev);
      save(next);
      return next;
    });
  }, [save]);

  const handlePageClick = useCallback(() => {
    if (!bgmStarted.current) { bgmStarted.current = true; startBGM(); }
    if (!editMode && !panelOpen) nextSection();
  }, [editMode, panelOpen, nextSection]);

  useEffect(() => () => stopBGM(), []);

  // Photo move
  const onMove = useCallback((id: string, x: number, y: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, x, y } : p),
    }));
  }, [seqIdx, updatePages]);

  // Photo resize
  const onResize = useCallback((id: string, delta: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id
        ? { ...p, width: Math.max(MIN_W, Math.min(MAX_W, p.width + delta)) }
        : p),
    }));
  }, [seqIdx, updatePages]);

  // Title change
  const onTitleChange = useCallback((id: string, val: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, title: val } : p),
    }));
  }, [seqIdx, updatePages]);

  // Text content change
  const onTextChange = useCallback((id: string, val: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, textContent: val } : p),
    }));
  }, [seqIdx, updatePages]);

  // Upload photos
  const onUpload = useCallback((files: File[]) => {
    updatePages(prev => {
      const existing = prev[seqIdx]?.photos ?? [];
      const newPhotos: ScrapbookPhoto[] = files.map((f, i) => ({
        id: `up_${Date.now()}_${i}`, src: URL.createObjectURL(f),
        title: '', x: 10, y: 10, rotate: 0, width: 290,
      }));
      const all = [...existing, ...newPhotos];
      const pos = autoArrange(all.length);
      return prev.map((pg, pi) => pi !== seqIdx ? pg : {
        ...pg, photos: all.map((ph, i) => ({ ...ph, ...pos[i] })),
      });
    });
  }, [seqIdx, updatePages]);

  // Add text card
  const onAddText = useCallback(() => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: [...pg.photos, {
        id: `text_${Date.now()}`, src: '', title: '',
        x: 30, y: 22, rotate: (Math.random() - 0.5) * 8, width: 290,
        textContent: '여기에 텍스트를 입력하세요',
      }],
    }));
    setEditMode(true);
  }, [seqIdx, updatePages]);

  // Set background image
  const onSetBgImage = useCallback((file: File) => {
    const src = URL.createObjectURL(file);
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, bgImage: src }));
  }, [seqIdx, updatePages]);

  const currentPage = pages[seqIdx];

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: '#f2ece0', overflow: 'hidden', cursor: editMode ? 'default' : 'pointer' }}
      onClick={handlePageClick}
    >
      {/* Full-screen background image */}
      <AnimatePresence mode="wait">
        <motion.div key={`bg_${seqIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <BgImageLayer src={currentPage?.bgImage} />
        </motion.div>
      </AnimatePresence>

      {/* Paper grain */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '200px 200px',
        opacity: 0.12, mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 4,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 55%, transparent 46%, rgba(88,48,16,0.4) 100%)',
        pointerEvents: 'none', zIndex: 4,
      }} />

      {/* Cute background decorations */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}>
        <BackgroundDecorations seqIdx={seqIdx} />
      </div>

      {/* Ruled lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: '6%', right: '6%', top: `${20 + i * 12}%`,
          height: 1, background: 'rgba(155,115,65,0.055)', pointerEvents: 'none', zIndex: 4,
        }} />
      ))}

      {/* Background note */}
      {currentPage?.bgNote && (
        <div style={{
          position: 'absolute', bottom: '14%', right: '6%',
          fontFamily: "'Dancing Script', cursive",
          fontSize: 72, color: 'rgba(128,85,48,0.07)',
          pointerEvents: 'none', userSelect: 'none', zIndex: 4,
        }}>
          {currentPage.bgNote}
        </div>
      )}

      {/* Photos & text cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={seqIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.46 }}
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        >
          {currentPage?.photos.map(photo =>
            photo.src === '' ? (
              <TextCard
                key={photo.id} photo={photo} editMode={editMode}
                onMove={onMove} onResize={onResize} onTextChange={onTextChange}
              />
            ) : (
              <Polaroid
                key={photo.id} photo={photo} editMode={editMode}
                onMove={onMove} onResize={onResize}
                onTitleChange={onTitleChange}
                onImageClick={() => openViewer(photo.src, (newSrc) => {
                  updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
                    ...pg, photos: pg.photos.map(p => p.id === photo.id ? { ...p, src: newSrc } : p),
                  }));
                })}
              />
            )
          )}
        </motion.div>
      </AnimatePresence>

      {/* Subtitle */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`sub_${seqIdx}`}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            position: 'fixed', bottom: 74, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(46,26,12,0.74)',
            backdropFilter: 'blur(10px)',
            borderRadius: 24, padding: '9px 34px',
            color: 'rgba(255,238,200,0.95)',
            fontFamily: "'Dancing Script', cursive",
            fontSize: 20, letterSpacing: '0.5px',
            pointerEvents: 'none', whiteSpace: 'nowrap',
            boxShadow: '0 2px 18px rgba(0,0,0,0.22)', zIndex: 50,
          }}
        >
          {currentPage?.subtitle}
        </motion.div>
      </AnimatePresence>

      {/* Edit-mode hint */}
      <AnimatePresence>
        {editMode && (
          <motion.div
            initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
            style={{
              position: 'fixed', top: 58, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(232,160,180,0.88)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '6px 22px',
              color: '#fff', fontSize: 11,
              fontFamily: "'Noto Sans KR', sans-serif",
              letterSpacing: '1.5px', pointerEvents: 'none', zIndex: 100,
              boxShadow: '0 2px 12px rgba(232,160,180,0.38)',
            }}
          >
            드래그·＋−·제목클릭으로 편집하세요
          </motion.div>
        )}
      </AnimatePresence>

      {/* FABs */}
      <div
        style={{ position: 'fixed', right: 22, bottom: 90, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 150 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => setEditMode(m => !m)} title="편집 모드"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: editMode ? 'rgba(232,160,180,0.92)' : 'rgba(248,242,232,0.88)',
            backdropFilter: 'blur(8px)',
            boxShadow: editMode ? '0 0 20px rgba(232,160,180,0.55)' : '0 2px 10px rgba(0,0,0,0.14)',
            color: editMode ? '#fff' : '#9a7060', fontSize: 17, cursor: 'pointer',
          }}
        >
          ✏️
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => setPanelOpen(o => !o)} title="편집 패널"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: panelOpen ? 'rgba(200,144,90,0.92)' : 'rgba(248,242,232,0.88)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
            color: panelOpen ? '#fff' : '#9a7060', fontSize: 17, cursor: 'pointer',
          }}
        >
          📷
        </motion.button>
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {panelOpen && (
          <EditPanel
            seqIdx={seqIdx}
            onClose={() => setPanelOpen(false)}
            onUpload={onUpload}
            onAddText={onAddText}
            onSetBgImage={onSetBgImage}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
