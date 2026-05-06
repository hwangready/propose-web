import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useImageViewer } from '../context/ImageContext';
import { SCRAPBOOK_PAGES } from '../config/scrapbookData';
import type { ScrapbookPhoto, ScrapbookPage, ScrapbookSticker } from '../config/scrapbookData';

interface Props {
  seqIdx: number;
  nextSection: () => void;
  setAutoPlay?: React.Dispatch<React.SetStateAction<boolean>>;
  goToFirst?: () => void;
  onPageCountChange?: (count: number) => void;
  onSlideIdxChange?: (idx: number) => void;
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


// ── Cute background decorations ───────────────────────────────────────────────
// Pastel palette from reference images (image 2)
const DECO_PALETTE = [
  { fill: 'rgba(255,182,193,{a})' },   // soft pink (heart, flower)
  { fill: 'rgba(255,218,80,{a})' },    // yellow (star, sparkle)
  { fill: 'rgba(140,200,160,{a})' },   // sage green (leaf, tulip)
  { fill: 'rgba(135,200,230,{a})' },   // sky blue (cloud, circle)
  { fill: 'rgba(200,175,230,{a})' },   // lavender (flower, triangle)
  { fill: 'rgba(255,185,140,{a})' },   // peach (flower, swirl)
  { fill: 'rgba(160,210,185,{a})' },   // mint (zigzag, leaf)
  { fill: 'rgba(255,160,170,{a})' },   // rose (heart, tulip)
];

// Deco shape renderers
function renderDeco(type: number, color: string, strokeColor: string) {
  switch (type) {
    // Heart (filled, chunky)
    case 0: return <path d="M0,5 C-5,1 -7,-4 -4,-6 C-2,-8 0,-6 0,-4 C0,-6 2,-8 4,-6 C7,-4 5,1 0,5Z" fill={color} />;
    // 4-pointed sparkle ✦
    case 1: return <path d="M0,-8 L1.6,-1.6 L8,0 L1.6,1.6 L0,8 L-1.6,1.6 L-8,0 L-1.6,-1.6Z" fill={color} />;
    // Rounded 5-petal flower
    case 2: return (
      <g>
        {[0,72,144,216,288].map(a => (
          <ellipse key={a} cx={Math.sin(a*Math.PI/180)*4} cy={-Math.cos(a*Math.PI/180)*4} rx="2.5" ry="3.5"
            transform={`rotate(${a})`} fill={color} />
        ))}
        <circle r="2.2" fill="rgba(255,245,200,0.9)" />
      </g>
    );
    // Chunky star
    case 3: return <path d="M0,-7 L1.7,-2.4 L6.7,-2.2 L2.8,1.0 L4.1,6.2 L0,3.4 L-4.1,6.2 L-2.8,1.0 L-6.7,-2.2 L-1.7,-2.4Z" fill={color} />;
    // Simple tulip
    case 4: return (
      <g>
        <line x1="0" y1="8" x2="0" y2="0" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0,0 C-4,-1 -5,-6 -3,-7 C-1,-8 0,-5 0,-3 C0,-5 1,-8 3,-7 C5,-6 4,-1 0,0Z" fill={color} />
      </g>
    );
    // Rainbow arc (3 colored arcs)
    case 5: return (
      <g>
        <path d="M-7,1 A7,7 0 0 1 7,1" fill="none" stroke="rgba(255,130,130,0.7)" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M-5.2,1 A5.2,5.2 0 0 1 5.2,1" fill="none" stroke="rgba(255,210,80,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M-3.5,1 A3.5,3.5 0 0 1 3.5,1" fill="none" stroke="rgba(130,200,170,0.7)" strokeWidth="1.4" strokeLinecap="round" />
      </g>
    );
    // Zigzag line
    case 6: return <polyline points="-7,2 -3.5,-2 0,2 3.5,-2 7,2" fill="none" stroke={strokeColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />;
    // Swirl
    case 7: return <path d="M4,0 C4,-5 -4,-5 -4,0 C-4,4 0,5 2,4 C4,3 4,1 3,0" fill="none" stroke={strokeColor} strokeWidth="1.3" strokeLinecap="round" />;
    // Cloud
    case 8: return <path d="M-6,1 C-7,-1 -5,-4 -3,-4 C-3,-6 0,-7 2,-5 C4,-7 7,-5 6,-3 C8,-2 7,1 5,1Z" fill={color} />;
    // Leaf / sprig
    case 9: return (
      <g>
        <line x1="0" y1="7" x2="0" y2="-6" stroke={strokeColor} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M0,-2 C3,-5 5,-3 3,0 C5,3 3,5 0,2 C-3,5 -5,3 -3,0 C-5,-3 -3,-5 0,-2Z" fill={color} />
      </g>
    );
    // Circle (dot)
    case 10: return <circle r="4.5" fill={color} />;
    // Plus / cross
    case 11: return (
      <g>
        <rect x="-1.4" y="-6" width="2.8" height="12" rx="1.4" fill={color} />
        <rect x="-6" y="-1.4" width="12" height="2.8" rx="1.4" fill={color} />
      </g>
    );
    // Small triangle
    case 12: return <path d="M0,-7 L6.5,5 L-6.5,5Z" fill={color} style={{ borderRadius: '2px' }} />;
    // ── New types from reference images ──────────────────────────────────────
    // Rainbow with clouds
    case 14: return (
      <g>
        <path d="M-9,3 A9,9 0 0 1 9,3" fill="none" stroke="rgba(255,90,90,0.88)" strokeWidth="2.2" strokeLinecap="round"/>
        <path d="M-7,3 A7,7 0 0 1 7,3" fill="none" stroke="rgba(255,190,50,0.88)" strokeWidth="2" strokeLinecap="round"/>
        <path d="M-5,3 A5,5 0 0 1 5,3" fill="none" stroke="rgba(80,200,130,0.88)" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M-3,3 A3,3 0 0 1 3,3" fill="none" stroke="rgba(80,160,255,0.88)" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M-11,2 C-11,-1 -8,-2 -8,2 C-9,3 -11,3 -11,2Z" fill="rgba(255,255,255,0.92)"/>
        <path d="M-9,2 C-9,0 -7,-0.5 -7,2Z" fill="rgba(255,255,255,0.92)"/>
        <path d="M11,2 C11,-1 8,-2 8,2 C9,3 11,3 11,2Z" fill="rgba(255,255,255,0.92)"/>
        <path d="M9,2 C9,0 7,-0.5 7,2Z" fill="rgba(255,255,255,0.92)"/>
      </g>
    );
    // Smiley face
    case 15: return (
      <g>
        <circle r="7.5" fill={color}/>
        <circle cx="-2.5" cy="-1.5" r="1.3" fill="rgba(50,30,10,0.72)"/>
        <circle cx="2.5" cy="-1.5" r="1.3" fill="rgba(50,30,10,0.72)"/>
        <path d="M-3.5,2.5 Q0,5.5 3.5,2.5" fill="none" stroke="rgba(50,30,10,0.72)" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="-6" cy="-3" r="1.8" fill={color} opacity="0.4"/>
        <circle cx="6" cy="-3" r="1.8" fill={color} opacity="0.4"/>
      </g>
    );
    // Sun with rays
    case 16: return (
      <g>
        {[0,45,90,135,180,225,270,315].map(a => (
          <line key={a}
            x1={+(Math.cos(a*Math.PI/180)*5.5).toFixed(2)} y1={+(Math.sin(a*Math.PI/180)*5.5).toFixed(2)}
            x2={+(Math.cos(a*Math.PI/180)*8).toFixed(2)} y2={+(Math.sin(a*Math.PI/180)*8).toFixed(2)}
            stroke={strokeColor} strokeWidth="1.6" strokeLinecap="round"/>
        ))}
        <circle r="4.5" fill={color}/>
        <circle cx="-1.5" cy="-1" r="1" fill="rgba(255,255,255,0.4)"/>
      </g>
    );
    // Cherries
    case 17: return (
      <g>
        <path d="M0,-1 C-1,-5 -3,-8 -5,-7" fill="none" stroke="rgba(90,140,70,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M0,-1 C1,-5 3,-7 5,-6" fill="none" stroke="rgba(90,140,70,0.85)" strokeWidth="1.3" strokeLinecap="round"/>
        <ellipse cx="0" cy="-5.5" rx="2.2" ry="1.1" transform="rotate(-15)" fill="rgba(100,165,75,0.85)"/>
        <circle cx="-5" cy="-5" r="3.2" fill={color}/>
        <circle cx="5" cy="-4" r="3.2" fill={color}/>
        <circle cx="-6" cy="-6.2" r="0.9" fill="rgba(255,255,255,0.45)"/>
        <circle cx="4" cy="-5.2" r="0.9" fill="rgba(255,255,255,0.45)"/>
      </g>
    );
    // Ribbon / bow
    case 18: return (
      <g>
        <path d="M0,0 C-2,-4 -8,-5 -7,-1.5 C-6,1 -2,1.5 0,0Z" fill={color} opacity="0.9"/>
        <path d="M0,0 C2,-4 8,-5 7,-1.5 C6,1 2,1.5 0,0Z" fill={color} opacity="0.9"/>
        <path d="M0,0 C-2,3 -4,6 -3,7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <path d="M0,0 C2,3 4,6 3,7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <circle r="2" fill={strokeColor}/>
      </g>
    );
    // Cactus
    case 19: return (
      <g>
        <rect x="-2.2" y="-3" width="4.4" height="10" rx="2.2" fill={color}/>
        <rect x="-5.5" y="-1.5" width="3.5" height="2" rx="1" fill={color}/>
        <rect x="-6.5" y="-4.5" width="2.2" height="3.5" rx="1.1" fill={color}/>
        <rect x="2" y="0.5" width="3.5" height="2" rx="1" fill={color}/>
        <rect x="4.3" y="-2.5" width="2.2" height="3.5" rx="1.1" fill={color}/>
        <rect x="-3" y="6.5" width="6" height="1.5" rx="0.75" fill={strokeColor} opacity="0.6"/>
      </g>
    );
    // Smiling flower (sunflower with face)
    case 20: return (
      <g>
        {[0,36,72,108,144,180,216,252,288,324].map(a => (
          <ellipse key={a}
            cx={+(Math.sin(a*Math.PI/180)*5.2).toFixed(2)} cy={+(-Math.cos(a*Math.PI/180)*5.2).toFixed(2)}
            rx="1.8" ry="3.2" transform={`rotate(${a})`} fill={color}/>
        ))}
        <circle r="4" fill="rgba(255,235,100,0.97)"/>
        <circle cx="-1.3" cy="-0.8" r="0.85" fill="rgba(50,30,10,0.7)"/>
        <circle cx="1.3" cy="-0.8" r="0.85" fill="rgba(50,30,10,0.7)"/>
        <path d="M-2,1.5 Q0,3.5 2,1.5" fill="none" stroke="rgba(50,30,10,0.7)" strokeWidth="0.9" strokeLinecap="round"/>
      </g>
    );
    // Pencil
    case 21: return (
      <g transform="rotate(-35)">
        <rect x="-1.8" y="-8.5" width="3.6" height="2" rx="0.7" fill="rgba(255,175,175,0.92)"/>
        <rect x="-1.8" y="-7" width="3.6" height="10" rx="0.7" fill={color}/>
        <line x1="-1.8" y1="-4.5" x2="1.8" y2="-4.5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.6"/>
        <path d="M-1.8,3 L0,7.5 L1.8,3Z" fill="rgba(245,225,190,0.88)"/>
        <path d="M-1,3.5 L0,6 L1,3.5Z" fill="rgba(180,130,70,0.75)"/>
      </g>
    );
    // Apple
    case 22: return (
      <g>
        <path d="M0.5,-8 C1.5,-10 4.5,-10 3.5,-7.5" fill="rgba(100,175,75,0.85)"/>
        <line x1="0.2" y1="-6.5" x2="0.5" y2="-8" stroke="rgba(110,75,35,0.75)" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M0,-6 C-7,-5.5 -8,0 -6.5,4 C-5.5,7 -3,8 0,7.5 C3,8 5.5,7 6.5,4 C8,0 7,-5.5 0,-6Z" fill={color}/>
        <ellipse cx="-2.5" cy="-1.5" rx="1.3" ry="2" transform="rotate(-20)" fill="rgba(255,255,255,0.28)"/>
      </g>
    );
    // Speech bubble with heart
    case 23: return (
      <g>
        <path d="M-8,-7 L7,-7 Q9,-7 9,-5 L9,2 Q9,4 7,4 L1,4 L-0.5,8 L-2.5,4 L-8,4 Q-10,4 -10,2 L-10,-5 Q-10,-7 -8,-7Z"
          fill={color} stroke={strokeColor} strokeWidth="0.4"/>
        <path d="M0.5,0.5 C-2.5,-1 -4,-3.5 -2,-4.5 C-0.8,-5 0.5,-3.5 0.5,-2.5 C0.5,-3.5 1.8,-5 3,-4.5 C5,-3.5 3.5,-1 0.5,0.5Z"
          fill="rgba(255,255,255,0.75)"/>
      </g>
    );
    // Bunting / pennant flags
    case 24: return (
      <g>
        <path d="M-10,-5 Q-5,-2.5 0,-4 Q5,-2.5 10,-5" fill="none" stroke={strokeColor} strokeWidth="0.9" strokeLinecap="round"/>
        <polygon points="-9,-5 -5,-5 -7,0" fill="rgba(255,100,100,0.82)"/>
        <polygon points="-2,-4.3 2,-4.3 0,0.5" fill="rgba(255,200,60,0.82)"/>
        <polygon points="5,-5 9,-5 7,0" fill="rgba(90,180,255,0.82)"/>
      </g>
    );
    // Smiley cloud
    case 25: return (
      <g>
        <path d="M-7,3 C-9,1 -8,-3 -5.5,-3.5 C-5.5,-6 -2,-8 1,-6.5 C3,-8.5 7.5,-6.5 7,-3 C9,-2 8.5,3 6,3Z" fill={color}/>
        <circle cx="-1.5" cy="0" r="1" fill="rgba(50,30,10,0.62)"/>
        <circle cx="2.2" cy="0" r="1" fill="rgba(50,30,10,0.62)"/>
        <path d="M-2.5,2 Q0.5,4.5 3.5,2" fill="none" stroke="rgba(50,30,10,0.62)" strokeWidth="1" strokeLinecap="round"/>
      </g>
    );
    // Daisy (simple 6-petal)
    default: return (
      <g>
        {[0,60,120,180,240,300].map(a => (
          <ellipse key={a} cx={Math.sin(a*Math.PI/180)*3.8} cy={-Math.cos(a*Math.PI/180)*3.8} rx="2" ry="3.2"
            transform={`rotate(${a})`} fill={color} />
        ))}
        <circle r="2" fill="rgba(255,240,180,0.95)" />
      </g>
    );
  }
}

const DECO_REGIONS = [
  { x0: 4, x1: 21, y0: 4, y1: 28 },
  { x0: 73, x1: 95, y0: 4, y1: 28 },
  { x0: 4, x1: 21, y0: 62, y1: 88 },
  { x0: 73, x1: 95, y0: 62, y1: 88 },
];

// ── Subtitle presets ─────────────────────────────────────────────────────────
const SUBTITLE_COLORS = [
  { preview: '#2e1a0c', value: 'rgba(46,26,12,0.78)' },
  { preview: '#0a0604', value: 'rgba(10,6,4,0.84)' },
  { preview: '#b43050', value: 'rgba(180,48,80,0.82)' },
  { preview: '#5a32a0', value: 'rgba(90,50,160,0.82)' },
  { preview: '#287850', value: 'rgba(40,120,80,0.82)' },
  { preview: '#1a3c8c', value: 'rgba(26,60,140,0.82)' },
  { preview: '#a05a10', value: 'rgba(160,90,16,0.82)' },
  { preview: '#c83878', value: 'rgba(200,56,120,0.82)' },
];
const SUBTITLE_DESIGNS = [
  { key: 'pill',    label: '●' },
  { key: 'flat',    label: '■' },
  { key: 'outline', label: '□' },
  { key: 'shadow',  label: 'T' },
];
function getSubtitleBoxStyle(design: string, bg: string): React.CSSProperties {
  const base: React.CSSProperties = { background: 'transparent', padding: '11px 38px', border: 'none', boxShadow: 'none' };
  switch (design) {
    case 'flat':    return { ...base, background: bg, backdropFilter: 'blur(12px)', borderRadius: 8, boxShadow: '0 3px 22px rgba(0,0,0,0.22)' };
    case 'outline': return { ...base, border: `2.5px solid ${bg}`, borderRadius: 28 };
    case 'shadow':  return { ...base };
    default:        return { ...base, background: bg, backdropFilter: 'blur(12px)', borderRadius: 28, boxShadow: '0 3px 22px rgba(0,0,0,0.25)' };
  }
}

// ── Subtitle font options ─────────────────────────────────────────────────────
const SUBTITLE_FONTS = [
  { label: '가에구', value: "'Gaegu', cursive" },
  { label: '남펜', value: "'Nanum Pen Script', cursive" },
  { label: '뿌어', value: "'Poor Story', cursive" },
  { label: '연성', value: "'Yeon Sung', cursive" },
  { label: 'Gochi', value: "'Gochi Hand', cursive" },
  { label: 'Dance', value: "'Dancing Script', cursive" },
];

// ── Sticker constants ─────────────────────────────────────────────────────────
const STICKER_COLORS = [
  '#ff9eb5', '#ffce47', '#a8d8a8', '#87c8e6',
  '#c8aff0', '#ffb88c', '#ff7eb0', '#ffffff',
  '#f8e4b0', '#b0d4e8', '#d4f0c0', '#f0c8e0',
];
const STICKER_STROKE_MAP: Record<string, string> = {
  '#ffffff': 'rgba(180,180,180,0.8)',
  '#f8e4b0': 'rgba(160,130,60,0.6)',
};
function stickerStroke(color: string): string {
  return STICKER_STROKE_MAP[color] ?? color;
}

// ── Decoration theme type filter ─────────────────────────────────────────────
const DECO_THEME_TYPES: Record<string, number[]> = {
  all:     [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
  hearts:  [0,2,13,10,1],
  stars:   [1,3,11,12,10],
  nature:  [2,4,9,13,5],
  minimal: [10,11,1,12,6],
};
const DECO_THEMES = [
  { key: 'all',     label: '전체' },
  { key: 'hearts',  label: '❤️' },
  { key: 'stars',   label: '✨' },
  { key: 'nature',  label: '🌸' },
  { key: 'minimal', label: '◦' },
  { key: 'off',     label: '없음' },
];

// ── Background themes ─────────────────────────────────────────────────────────
const BG_THEMES = [
  { key: 'cream',    label: '크림',   bg: '#f7f4ef', grain: 0.12, vignette: 'rgba(88,48,16,0.38)' },
  { key: 'white',    label: '흰종이', bg: '#fdfcfa', grain: 0.07, vignette: 'rgba(88,48,16,0.22)' },
  { key: 'pink',     label: '핑크',   bg: '#fff0f3', grain: 0.10, vignette: 'rgba(160,60,80,0.22)' },
  { key: 'mint',     label: '민트',   bg: '#eef8f3', grain: 0.10, vignette: 'rgba(30,100,70,0.22)' },
  { key: 'lavender', label: '라벤더', bg: '#f5f0ff', grain: 0.10, vignette: 'rgba(80,50,140,0.22)' },
  { key: 'linen',    label: '리넨',   bg: '#f0e8d2', grain: 0.18, vignette: 'rgba(88,48,16,0.40)' },
  { key: 'kraft',    label: '크래프트', bg: '#c9a87a', grain: 0.20, vignette: 'rgba(60,30,0,0.45)' },
  { key: 'dark',     label: '블랙보드', bg: '#282e2b', grain: 0.05, vignette: 'rgba(0,0,0,0.55)' },
];
function getBgTheme(key?: string) {
  return BG_THEMES.find(t => t.key === key) ?? BG_THEMES[0];
}

// Shapes that look wrong at arbitrary rotation get constrained angles
const DECO_ROTATE_RANGE: Partial<Record<number, [number, number]>> = {
  4: [-15, 15],   // tulip: upright
  5: [-8, 8],     // rainbow arc: always arching upward
  6: [-18, 18],   // zigzag: mostly horizontal
  8: [-10, 10],   // cloud: mostly horizontal
  9: [-25, 25],   // leaf sprig: mostly upright
};

function BackgroundDecorations({ seqIdx, theme = 'all' }: { seqIdx: number; theme?: string }) {
  const items = useMemo(() => {
    const allowedTypes = DECO_THEME_TYPES[theme] ?? DECO_THEME_TYPES.all;
    const rng = seededRng(seqIdx * 7919 + 1234);
    const regionPlaced: Array<Array<{ x: number; y: number }>> = [[], [], [], []];
    const MIN_DIST = 8;

    return Array.from({ length: 20 }, (_, i) => {
      const ri = i % 4;
      const region = DECO_REGIONS[ri];
      const typeIdx = allowedTypes[Math.floor(rng() * allowedTypes.length)];
      const pal = DECO_PALETTE[Math.floor(rng() * DECO_PALETTE.length)];
      const alpha = (0.18 + rng() * 0.14).toFixed(2);
      const color = pal.fill.replace('{a}', alpha);
      const strokeAlpha = (parseFloat(alpha) + 0.04).toFixed(2);
      const strokeColor = pal.fill.replace('{a}', strokeAlpha);

      // Place with overlap rejection (max 10 tries)
      let x = 0, y = 0;
      for (let t = 0; t < 10; t++) {
        x = region.x0 + rng() * (region.x1 - region.x0);
        y = region.y0 + rng() * (region.y1 - region.y0);
        if (regionPlaced[ri].every(p => Math.hypot(p.x - x, p.y - y) >= MIN_DIST)) break;
      }
      regionPlaced[ri].push({ x, y });

      // Constrain rotation for directional shapes
      const rotRange = DECO_ROTATE_RANGE[typeIdx];
      const rotate = rotRange
        ? rotRange[0] + rng() * (rotRange[1] - rotRange[0])
        : rng() * 360;

      return {
        x, y, typeIdx, color, strokeColor,
        size: 1.8 + rng() * 2,
        rotate,
      };
    });
  }, [seqIdx, theme]);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 3, overflow: 'visible' }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {items.map((d, i) => (
        <g key={i} transform={`translate(${d.x},${d.y}) rotate(${d.rotate}) scale(${d.size / 10})`}>
          {renderDeco(d.typeIdx, d.color, d.strokeColor)}
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

// ── Edit controls (resize + rotate + duplicate + format copy) ────────────────
function EditControls({
  onResize, onRotate, onDuplicate, onFormatCopy, onBringForward, onSendBackward, isFormatSource,
}: {
  onResize: (delta: number) => void;
  onRotate: (delta: number) => void;
  onDuplicate: () => void;
  onFormatCopy: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  isFormatSource?: boolean;
}) {
  const btn: React.CSSProperties = {
    width: 26, height: 26, borderRadius: '50%', border: 'none',
    background: 'rgba(232,160,180,0.85)', color: '#fff',
    fontSize: 12, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(0,0,0,0.18)', flexShrink: 0,
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 7 }}
      onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        <button style={btn} onClick={() => onRotate(-8)} title="반시계">↺</button>
        <button style={btn} onClick={() => onResize(-24)} title="축소">−</button>
        <button style={btn} onClick={() => onResize(24)} title="확대">＋</button>
        <button style={btn} onClick={() => onRotate(8)} title="시계">↻</button>
      </div>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        <button style={{ ...btn, background: 'rgba(120,170,220,0.85)', fontSize: 13 }}
          onClick={onDuplicate} title="복사">⧉</button>
        <button style={{ ...btn, background: isFormatSource ? 'rgba(255,190,40,0.92)' : 'rgba(150,195,140,0.85)', fontSize: 13 }}
          onClick={onFormatCopy} title="서식복사">🖌</button>
        <button style={{ ...btn, background: 'rgba(180,140,100,0.85)', fontSize: 11 }}
          onClick={onBringForward} title="앞으로">↑</button>
        <button style={{ ...btn, background: 'rgba(180,140,100,0.85)', fontSize: 11 }}
          onClick={onSendBackward} title="뒤로">↓</button>
      </div>
    </div>
  );
}

// ── Polaroid card ─────────────────────────────────────────────────────────────
function Polaroid({
  photo, editMode, zIndex, isSelected, onSelect, onMove, onResize, onRotate, onTitleChange, onImageClick,
  onDuplicate, onFormatCopy, onFormatPaste, onBringForward, onSendBackward, onDelete, isFormatSource, formatPainterActive,
}: {
  photo: ScrapbookPhoto;
  editMode: boolean;
  zIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, delta: number) => void;
  onRotate: (id: string, delta: number) => void;
  onTitleChange: (id: string, val: string) => void;
  onImageClick: () => void;
  onDuplicate: () => void;
  onFormatCopy: () => void;
  onFormatPaste: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  isFormatSource: boolean;
  formatPainterActive: boolean;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [editingTitle, setEditingTitle] = useState(false);
  const idleOffset = useMemo(() => {
    let h = 0;
    for (let i = 0; i < photo.id.length; i++) h = (h * 31 + photo.id.charCodeAt(i)) & 0xffffff;
    return (h % 1000) / 1000;
  }, [photo.id]);

  return (
    <motion.div
      drag={editMode && !editingTitle && !formatPainterActive}
      dragMomentum={false}
      dragElastic={0.04}
      style={{
        position: 'absolute', left: `${photo.x}%`, top: `${photo.y}%`,
        x: dragX, y: dragY, zIndex,
        cursor: formatPainterActive && !isFormatSource ? 'crosshair' : editMode ? 'grab' : 'pointer',
        transformOrigin: 'center center',
      }}
      animate={editMode
        ? { rotate: photo.rotate, y: 0 }
        : { y: [0, -(2 + idleOffset * 4), 0], rotate: [photo.rotate - 0.5, photo.rotate + 0.7, photo.rotate - 0.5] }
      }
      transition={editMode
        ? { rotate: { duration: 0.2 }, y: { duration: 0.2 } }
        : {
            y: { duration: 2.2 + idleOffset * 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: idleOffset * 1.5 },
            rotate: { duration: 3 + idleOffset * 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: idleOffset },
          }
      }
      whileDrag={{ scale: 1.04, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = Math.max(2, Math.min(72, photo.x + (info.offset.x / window.innerWidth) * 100));
        const ny = Math.max(2, Math.min(58, photo.y + (info.offset.y / window.innerHeight) * 100));
        onMove(photo.id, nx, ny);
        dragX.set(0); dragY.set(0);
      }}
      onPointerDown={(e) => {
        if (editMode) { e.stopPropagation(); onSelect(); }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (formatPainterActive && !isFormatSource) { onFormatPaste(); return; }
        if (editMode) return;
        onImageClick();
      }}
    >
      <TapeStrip color="rgba(255,226,128,0.62)" style={{ top: -9, left: 14, transform: 'rotate(-4deg)' }} />
      <TapeStrip color="rgba(196,180,232,0.62)" style={{ top: -8, right: 14, transform: 'rotate(5deg)', width: 38 }} />

      <div style={{
        background: '#fffdf8',
        padding: '9px 9px 50px',
        width: photo.width,
        boxShadow: formatPainterActive && !isFormatSource
          ? '0 0 0 2.5px rgba(200,140,60,0.9), 0 8px 30px rgba(0,0,0,0.18)'
          : editMode && isSelected
          ? '0 10px 32px rgba(232,160,180,0.7), 0 0 0 2px rgba(232,160,180,0.5), 0 4px 12px rgba(0,0,0,0.16)'
          : editMode
          ? '0 4px 14px rgba(0,0,0,0.13)'
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
                fontFamily: "'Dancing Script', cursive",
                fontSize: Math.max(12, Math.round(photo.width * 0.056)),
                color: '#6a4e35', outline: 'none',
              }}
            />
          ) : (
            <div
              style={{
                fontFamily: "'Dancing Script', cursive",
                fontSize: Math.max(12, Math.round(photo.width * 0.056)),
                color: '#6a4e35', cursor: editMode ? 'text' : 'default', minHeight: 22,
              }}
              onClick={(e) => { e.stopPropagation(); if (editMode) setEditingTitle(true); }}
              title={editMode ? '클릭하여 텍스트 편집' : ''}
            >
              {photo.title || (editMode ? <span style={{ opacity: 0.3 }}>제목 입력...</span> : '')}
            </div>
          )}
        </div>
      </div>

      {editMode && isSelected && (
        <EditControls
          onResize={(d) => onResize(photo.id, d)}
          onRotate={(d) => onRotate(photo.id, d)}
          onDuplicate={onDuplicate}
          onFormatCopy={onFormatCopy}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          isFormatSource={isFormatSource}
        />
      )}
      {editMode && isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: -10, left: -10,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(220,60,60,0.9)', color: '#fff',
            border: '2px solid #fff', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
          }}
        >×</button>
      )}
      {editMode && (
        <div style={{
          position: 'absolute', top: -5, right: -5,
          width: 13, height: 13, borderRadius: '50%',
          background: isSelected ? (isFormatSource ? '#f0c030' : '#e8a0b4') : 'rgba(180,150,130,0.4)',
          border: '2px solid #fff', zIndex: 3, pointerEvents: 'none',
        }} />
      )}
    </motion.div>
  );
}

// ── Text card ─────────────────────────────────────────────────────────────────
function TextCard({
  photo, editMode, zIndex, isSelected, onSelect, onMove, onResize, onRotate, onTextChange,
  onDuplicate, onFormatCopy, onFormatPaste, onBringForward, onSendBackward, onDelete, isFormatSource, formatPainterActive,
}: {
  photo: ScrapbookPhoto;
  editMode: boolean;
  zIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, delta: number) => void;
  onRotate: (id: string, delta: number) => void;
  onTextChange: (id: string, val: string) => void;
  onDuplicate: () => void;
  onFormatCopy: () => void;
  onFormatPaste: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  isFormatSource: boolean;
  formatPainterActive: boolean;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const [editingText, setEditingText] = useState(false);
  const [visibleChars, setVisibleChars] = useState(0);
  const text = photo.textContent || '';
  const idleOffset = useMemo(() => {
    let h = 0;
    for (let i = 0; i < photo.id.length; i++) h = (h * 31 + photo.id.charCodeAt(i)) & 0xffffff;
    return (h % 1000) / 1000;
  }, [photo.id]);

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
      drag={editMode && !editingText && !formatPainterActive}
      dragMomentum={false}
      dragElastic={0.04}
      style={{
        position: 'absolute', left: `${photo.x}%`, top: `${photo.y}%`,
        x: dragX, y: dragY, zIndex,
        cursor: formatPainterActive && !isFormatSource ? 'crosshair' : editMode ? 'grab' : 'default',
        transformOrigin: 'center center',
      }}
      animate={editMode
        ? { rotate: photo.rotate, y: 0 }
        : { y: [0, -(1.5 + idleOffset * 3), 0], rotate: [photo.rotate - 0.4, photo.rotate + 0.5, photo.rotate - 0.4] }
      }
      transition={editMode
        ? { rotate: { duration: 0.2 }, y: { duration: 0.2 } }
        : {
            y: { duration: 2.5 + idleOffset * 1.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: idleOffset * 1.2 },
            rotate: { duration: 3.5 + idleOffset * 1.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: idleOffset * 0.9 },
          }
      }
      whileDrag={{ scale: 1.03, zIndex: 60, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = Math.max(2, Math.min(72, photo.x + (info.offset.x / window.innerWidth) * 100));
        const ny = Math.max(2, Math.min(58, photo.y + (info.offset.y / window.innerHeight) * 100));
        onMove(photo.id, nx, ny);
        dragX.set(0); dragY.set(0);
      }}
      onPointerDown={(e) => {
        if (editMode) { e.stopPropagation(); onSelect(); }
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (formatPainterActive && !isFormatSource) { onFormatPaste(); return; }
      }}
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
        boxShadow: formatPainterActive && !isFormatSource
          ? '0 0 0 2.5px rgba(200,140,60,0.9), 0 6px 24px rgba(0,0,0,0.14)'
          : editMode && isSelected
          ? '0 8px 28px rgba(232,160,180,0.6), 0 0 0 2px rgba(232,160,180,0.4), 0 3px 10px rgba(0,0,0,0.12)'
          : editMode
          ? '0 3px 10px rgba(0,0,0,0.1)'
          : '0 6px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s',
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

      {editMode && isSelected && (
        <EditControls
          onResize={(d) => onResize(photo.id, d)}
          onRotate={(d) => onRotate(photo.id, d)}
          onDuplicate={onDuplicate}
          onFormatCopy={onFormatCopy}
          onBringForward={onBringForward}
          onSendBackward={onSendBackward}
          isFormatSource={isFormatSource}
        />
      )}
      {editMode && isSelected && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: -10, left: -10,
            width: 24, height: 24, borderRadius: '50%',
            background: 'rgba(220,60,60,0.9)', color: '#fff',
            border: '2px solid #fff', fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 5, boxShadow: '0 2px 6px rgba(0,0,0,0.22)',
          }}
        >×</button>
      )}
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
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      {/* Paper overlay so photos read well */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(242,236,224,0.55)' }} />
    </motion.div>
  );
}

// ── Sticker item ──────────────────────────────────────────────────────────────
function StickerItem({
  sticker, editMode, idx, isSelected, onSelect, onMove, onResize, onRotate, onColor, onDelete,
}: {
  sticker: ScrapbookSticker;
  editMode: boolean;
  idx: number;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, delta: number) => void;
  onRotate: (id: string, delta: number) => void;
  onColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
}) {
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);
  const s = sticker;

  const ctrlBtn: React.CSSProperties = {
    width: 22, height: 22, borderRadius: '50%', border: 'none',
    background: 'rgba(232,160,180,0.85)', color: '#fff',
    fontSize: 11, cursor: 'pointer', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  return (
    <motion.div
      drag={editMode}
      dragMomentum={false}
      dragElastic={0.04}
      style={{
        position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
        x: dragX, y: dragY, zIndex: 15,
        cursor: editMode ? 'grab' : 'default',
        transformOrigin: 'center center',
        pointerEvents: 'auto',
      }}
      animate={{ rotate: s.rotate }}
      whileDrag={{ scale: 1.1, zIndex: 80, cursor: 'grabbing' }}
      onDragEnd={(_, info) => {
        const nx = Math.max(0, Math.min(92, s.x + (info.offset.x / window.innerWidth) * 100));
        const ny = Math.max(0, Math.min(88, s.y + (info.offset.y / window.innerHeight) * 100));
        onMove(s.id, nx, ny);
        dragX.set(0); dragY.set(0);
      }}
      onClick={(e) => { e.stopPropagation(); if (editMode) onSelect(); }}
    >
      <svg
        viewBox="-12 -12 24 24"
        width={s.size} height={s.size}
        style={{
          display: 'block', overflow: 'visible',
          filter: editMode && isSelected ? 'drop-shadow(0 0 6px rgba(232,160,180,0.7))' : 'none',
        }}
      >
        <g>
          {renderDeco(s.type, s.color, stickerStroke(s.color))}
        </g>
      </svg>

      {editMode && isSelected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}
          onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
            <button style={ctrlBtn} onClick={() => onRotate(s.id, -8)}>↺</button>
            <button style={ctrlBtn} onClick={() => onResize(s.id, -8)}>−</button>
            <button style={ctrlBtn} onClick={() => onResize(s.id, 8)}>＋</button>
            <button style={ctrlBtn} onClick={() => onRotate(s.id, 8)}>↻</button>
            <button style={{ ...ctrlBtn, background: 'rgba(200,80,80,0.8)' }}
              onClick={() => onDelete(s.id)}>×</button>
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 130 }}>
            {STICKER_COLORS.map(c => (
              <button key={c} onClick={() => onColor(s.id, c)}
                style={{
                  width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: c,
                  outline: s.color === c ? '2px solid rgba(100,60,30,0.7)' : '1px solid rgba(150,120,80,0.3)',
                  outlineOffset: 1,
                }} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Upload / edit panel ───────────────────────────────────────────────────────
function EditPanel({
  seqIdx, onClose, onAddText, onSetBgImage, bgTheme, onBgThemeChange,
  globalDecoTheme, onGlobalDecoThemeChange, onStickerPointerDown,
  photoLibrary, selectedLibraryIds, onLibraryAdd, onLibraryDelete, onLibraryToggle,
  onLibraryPlace, onLibrarySelectAllToggle,
  pendingStickerTypes, onStickerTypeToggle, onStickerTypeSelectAll, onPlaceStickers, onStickerReshuffle,
  allPages, currentPageIdx, onPageAdd, onPageDelete, onPageMoveUp, onPageMoveDown, onPageGoTo,
}: {
  seqIdx: number;
  onClose: () => void;
  onAddText: () => void;
  onSetBgImage: (file: File) => void;
  bgTheme: string;
  onBgThemeChange: (key: string) => void;
  globalDecoTheme: string;
  onGlobalDecoThemeChange: (key: string) => void;
  onStickerPointerDown: (type: number, e: React.PointerEvent) => void;
  photoLibrary: Array<{id: string; src: string; name: string}>;
  selectedLibraryIds: Set<string>;
  onLibraryAdd: (files: File[]) => void;
  onLibraryDelete: (id: string) => void;
  onLibraryToggle: (id: string) => void;
  onLibraryPlace: () => void;
  onLibrarySelectAllToggle: () => void;
  pendingStickerTypes: Set<number>;
  onStickerTypeToggle: (type: number) => void;
  onStickerTypeSelectAll: () => void;
  onPlaceStickers: () => void;
  onStickerReshuffle: () => void;
  allPages: ScrapbookPage[];
  currentPageIdx: number;
  onPageAdd: () => void;
  onPageDelete: (idx: number) => void;
  onPageMoveUp: (idx: number) => void;
  onPageMoveDown: (idx: number) => void;
  onPageGoTo: (idx: number) => void;
}) {
  const photoRef = useRef<HTMLInputElement>(null);
  const bgRef = useRef<HTMLInputElement>(null);

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

      {/* 사진 라이브러리 */}
      <div>
        <div style={sectionLabel}>📷 사진 라이브러리</div>
        <div
          onClick={() => photoRef.current?.click()}
          style={{
            border: '2px dashed rgba(200,144,90,0.38)', borderRadius: 12,
            padding: '14px', textAlign: 'center', cursor: 'pointer',
            color: 'rgba(110,72,44,0.55)', fontSize: 13,
            fontFamily: "'Noto Sans KR', sans-serif",
            background: 'rgba(255,252,242,0.8)',
          }}
        >
          + 사진 추가
          <div style={{ fontSize: 10, marginTop: 2, opacity: 0.55 }}>라이브러리에 저장됩니다</div>
        </div>
        <input ref={photoRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length) { onLibraryAdd(files); e.target.value = ''; }
          }} />

        {photoLibrary.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(100,65,40,0.5)', fontFamily: "'Noto Sans KR', sans-serif" }}>
                {selectedLibraryIds.size > 0 ? `${selectedLibraryIds.size}장 선택` : `${photoLibrary.length}장`}
              </span>
              <button onClick={onLibrarySelectAllToggle}
                style={{
                  fontSize: 10, padding: '3px 10px', borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: 'rgba(200,144,90,0.18)', color: '#6a4022',
                  fontFamily: "'Noto Sans KR', sans-serif",
                }}>
                {selectedLibraryIds.size === photoLibrary.length ? '전체 해제' : '전체 선택'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {photoLibrary.map(p => (
                <div key={p.id} style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => onLibraryToggle(p.id)}>
                  <img src={p.src} style={{
                    width: 68, height: 68, objectFit: 'cover', borderRadius: 8,
                    border: selectedLibraryIds.has(p.id) ? '2.5px solid rgba(232,160,180,0.9)' : '2px solid rgba(200,144,90,0.28)',
                    opacity: selectedLibraryIds.has(p.id) ? 1 : 0.72,
                    transition: 'all 0.18s',
                  }} />
                  {selectedLibraryIds.has(p.id) && (
                    <div style={{
                      position: 'absolute', bottom: 3, right: 3,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(232,160,180,0.95)', color: '#fff',
                      fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>✓</div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onLibraryDelete(p.id); }}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'rgba(200,60,60,0.82)', color: '#fff',
                      border: 'none', fontSize: 12, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}>×</button>
                </div>
              ))}
            </div>
            {selectedLibraryIds.size > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => { onLibraryPlace(); onClose(); }}
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
                보드에 배치 ({selectedLibraryIds.size}장)
              </motion.button>
            )}
          </>
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

      {/* 배경 테마 */}
      <div>
        <div style={sectionLabel}>🎨 배경 테마</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {BG_THEMES.map(t => (
            <button key={t.key} onClick={() => onBgThemeChange(t.key)}
              style={{
                width: 60, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: t.bg,
                outline: bgTheme === t.key ? '2.5px solid rgba(200,144,90,0.9)' : '1.5px solid rgba(180,140,90,0.2)',
                outlineOffset: 1,
                fontFamily: "'Noto Sans KR', sans-serif", fontSize: 10,
                color: t.key === 'dark' || t.key === 'kraft' ? 'rgba(255,255,255,0.85)' : 'rgba(80,50,20,0.75)',
                boxShadow: bgTheme === t.key ? '0 2px 8px rgba(200,144,90,0.4)' : 'none',
                transition: 'all 0.18s',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* 전체 배경 꾸밈요소 */}
      <div>
        <div style={sectionLabel}>✨ 배경 꾸밈요소 (전체 적용)</div>
        <div style={{ fontSize: 10, color: 'rgba(100,65,40,0.45)', fontFamily: "'Noto Sans KR',sans-serif", marginBottom: 8 }}>
          모든 페이지 배경에 공통으로 나타납니다
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[
            { key: 'off', label: '없음' },
            { key: 'all', label: '전체' },
            { key: 'hearts', label: '❤️' },
            { key: 'stars', label: '✨' },
            { key: 'nature', label: '🌸' },
            { key: 'minimal', label: '◦' },
          ].map(t => (
            <button key={t.key} onClick={() => onGlobalDecoThemeChange(t.key)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                background: globalDecoTheme === t.key
                  ? 'rgba(232,160,180,0.85)' : 'rgba(255,248,235,0.9)',
                color: globalDecoTheme === t.key ? '#fff' : '#6a4022',
                fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11,
                outline: globalDecoTheme === t.key ? '2px solid rgba(232,160,180,0.6)' : 'none',
                outlineOffset: 1,
                transition: 'all 0.18s',
                boxShadow: globalDecoTheme === t.key ? '0 2px 8px rgba(232,160,180,0.35)' : 'none',
              }}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* 스티커 / 꾸밈요소 추가 */}
      <div>
        <div style={sectionLabel}>🎀 스티커 · 꾸밈요소</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 10, color: 'rgba(100,65,40,0.45)', fontFamily: "'Noto Sans KR',sans-serif" }}>
            {pendingStickerTypes.size > 0
              ? `${pendingStickerTypes.size}개 선택 → 배치 버튼 or 드래그`
              : '클릭 선택 후 배치 · 드래그로 바로 배치'}
          </span>
          <button onClick={onStickerTypeSelectAll}
            style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: 'rgba(200,144,90,0.18)', color: '#6a4022',
              fontFamily: "'Noto Sans KR', sans-serif",
            }}>
            {pendingStickerTypes.size === 26 ? '해제' : '전체'}
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {Array.from({ length: 26 }, (_, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <button
                onClick={() => onStickerTypeToggle(i)}
                onPointerDown={(e) => { e.stopPropagation(); if (!pendingStickerTypes.size) onStickerPointerDown(i, e); }}
                style={{
                  width: 38, height: 38, borderRadius: 8, cursor: pendingStickerTypes.size ? 'pointer' : 'grab',
                  background: pendingStickerTypes.has(i) ? 'rgba(232,160,180,0.28)' : 'rgba(255,248,235,0.9)',
                  border: pendingStickerTypes.has(i) ? '2px solid rgba(232,160,180,0.7)' : '1px solid rgba(200,144,90,0.28)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 0, touchAction: 'none',
                  transition: 'all 0.15s',
                }}>
                <svg viewBox="-12 -12 24 24" width={24} height={24} style={{ overflow: 'visible', pointerEvents: 'none' }}>
                  {renderDeco(i, pendingStickerTypes.has(i) ? '#e870a0' : '#ffb0c8', pendingStickerTypes.has(i) ? '#c85080' : '#e890a8')}
                </svg>
              </button>
              {pendingStickerTypes.has(i) && (
                <div style={{
                  position: 'absolute', bottom: 1, right: 1,
                  width: 13, height: 13, borderRadius: '50%',
                  background: 'rgba(232,160,180,0.92)', color: '#fff',
                  fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none',
                }}>✓</div>
              )}
            </div>
          ))}
        </div>
        {pendingStickerTypes.size > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { onPlaceStickers(); onClose(); }}
            style={{
              marginTop: 10, width: '100%',
              background: 'linear-gradient(135deg, rgba(232,160,180,0.9), rgba(200,144,90,0.9))',
              border: 'none', borderRadius: 20,
              color: '#fff', fontSize: 13,
              fontFamily: "'Noto Sans KR', sans-serif",
              padding: '10px', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(232,160,180,0.35)',
            }}
          >
            스티커 배치 ({pendingStickerTypes.size}개)
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={onStickerReshuffle}
          style={{
            marginTop: 8, width: '100%',
            background: 'rgba(255,248,235,0.9)',
            border: '1px solid rgba(200,144,90,0.35)',
            borderRadius: 20, color: '#6a4022', fontSize: 12,
            fontFamily: "'Noto Sans KR', sans-serif",
            padding: '8px', cursor: 'pointer',
          }}
        >
          🔀 현재 스티커 위치·크기·색상 랜덤 재배치
        </motion.button>
      </div>

      {/* 슬라이드 관리 */}
      <div>
        <div style={sectionLabel}>📑 슬라이드 관리</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
          {allPages.map((pg, i) => {
            const smallBtn: React.CSSProperties = {
              width: 22, height: 22, borderRadius: 4, border: 'none', cursor: 'pointer',
              background: 'rgba(200,144,90,0.25)', color: '#6a4022',
              fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            };
            return (
              <div key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: i === currentPageIdx ? 'rgba(232,160,180,0.18)' : 'rgba(255,248,235,0.8)',
                  border: `1px solid ${i === currentPageIdx ? 'rgba(232,160,180,0.5)' : 'rgba(200,144,90,0.2)'}`,
                  borderRadius: 8, padding: '5px 7px', cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => { onPageGoTo(i); onClose(); }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'rgba(100,65,40,0.5)', minWidth: 20, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{
                  flex: 1, fontSize: 11, color: '#6a4022',
                  fontFamily: "'Noto Sans KR', sans-serif",
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {pg.subtitle || '(제목 없음)'}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onPageMoveUp(i); }}
                  style={{ ...smallBtn, opacity: i === 0 ? 0.3 : 1 }}
                  disabled={i === 0}>↑</button>
                <button onClick={(e) => { e.stopPropagation(); onPageMoveDown(i); }}
                  style={{ ...smallBtn, opacity: i === allPages.length - 1 ? 0.3 : 1 }}
                  disabled={i === allPages.length - 1}>↓</button>
                <button onClick={(e) => { e.stopPropagation(); onPageDelete(i); }}
                  style={{ ...smallBtn, background: allPages.length <= 1 ? 'rgba(180,180,180,0.3)' : 'rgba(220,60,60,0.75)', color: '#fff' }}
                  disabled={allPages.length <= 1}>×</button>
              </div>
            );
          })}
        </div>
        <button onClick={onPageAdd}
          style={{
            marginTop: 8, width: '100%', padding: '8px',
            background: 'rgba(255,248,235,0.9)', border: '1px dashed rgba(200,144,90,0.4)',
            borderRadius: 10, cursor: 'pointer',
            fontFamily: "'Noto Sans KR', sans-serif", fontSize: 12, color: '#6a4022',
          }}>
          + 새 슬라이드 추가
        </button>
      </div>

      {/* 도움말 */}
      <div style={{
        padding: '14px', borderRadius: 10,
        background: 'rgba(200,144,90,0.08)',
        border: '1px solid rgba(200,144,90,0.15)',
      }}>
        <div style={{ fontFamily: "'Noto Sans KR', sans-serif", fontSize: 11, color: 'rgba(100,65,40,0.65)', lineHeight: 1.8, letterSpacing: '0.3px' }}>
          ✏️ 편집 모드에서:<br />
          • 폴라로이드 드래그로 이동<br />
          • ＋/− 버튼으로 크기 조절<br />
          • ⧉복사·🖌서식복사 활용
        </div>
      </div>

      {/* 저장 완료 버튼 */}
      <motion.button
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
        onClick={onClose}
        style={{
          marginTop: 'auto', width: '100%', padding: '13px',
          background: 'linear-gradient(135deg, rgba(93,201,165,0.92), rgba(60,170,130,0.92))',
          border: 'none', borderRadius: 22,
          color: '#fff', fontSize: 14, fontWeight: 700,
          fontFamily: "'Noto Sans KR', sans-serif",
          cursor: 'pointer', letterSpacing: '1px',
          boxShadow: '0 4px 16px rgba(60,170,130,0.35)',
        }}
      >
        ✅ 저장 완료
      </motion.button>
    </motion.div>
  );
}

const BLANK_PAGE: ScrapbookPage = { photos: [], subtitle: '새 페이지', stickers: [] };

// ── Main component ────────────────────────────────────────────────────────────
export default function ScrapbookCanvas({ seqIdx, nextSection, setAutoPlay, goToFirst, onPageCountChange, onSlideIdxChange }: Props) {
  const [pages, setPages] = useState<ScrapbookPage[]>(() => {
    try {
      const raw = localStorage.getItem('scrapbook_layout');
      if (raw) {
        const saved = JSON.parse(raw) as ScrapbookPage[];
        // Use saved length as-is (supports variable page count)
        return saved.map((sp, i) => {
          const def: Partial<ScrapbookPage> = SCRAPBOOK_PAGES[i] ?? {};
          const merged: ScrapbookPage = { photos: [], subtitle: '', stickers: [], ...def };
          return { ...merged, ...sp, stickers: sp.stickers ?? merged.stickers };
        });
      }
    } catch { /**/ }
    return SCRAPBOOK_PAGES.map(p => ({ ...p, stickers: p.stickers ?? [] }));
  });

  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [globalDecoTheme, setGlobalDecoTheme] = useState<string>(() => localStorage.getItem('scrapbook_deco_theme') ?? 'off');
  const [panelOpen, setPanelOpen] = useState(false);
  const [photoLibrary, setPhotoLibrary] = useState<Array<{id: string; src: string; name: string}>>([]);
  const [selectedLibraryIds, setSelectedLibraryIds] = useState<Set<string>>(new Set());
  const [pendingStickerTypes, setPendingStickerTypes] = useState<Set<number>>(new Set());
  const [editingSubtitle, setEditingSubtitle] = useState(false);
  const [formatPainter, setFormatPainter] = useState<{ id: string; width: number; rotate: number } | null>(null);
  const [dragCursorPos, setDragCursorPos] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{ type: number; startX: number; startY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [bgmSrc, setBgmSrc] = useState<string | null>(null);
  const [bgmVolume, setBgmVolume] = useState<number>(() => {
    try { return parseFloat(localStorage.getItem('scrapbook_bgm_volume') ?? '0.6'); } catch { return 0.6; }
  });
  const [bgmPlaying, setBgmPlaying] = useState(false);
  const [bgmOpen, setBgmOpen] = useState(false);
  const bgmRef = useRef<HTMLAudioElement>(null);
  const bgmFileRef = useRef<HTMLInputElement>(null);
  const { openViewer } = useImageViewer();
  const bgmStarted = useRef(false);

  // Sync volume to audio element + persist
  useEffect(() => {
    if (bgmRef.current) bgmRef.current.volume = bgmVolume;
    try { localStorage.setItem('scrapbook_bgm_volume', String(bgmVolume)); } catch { /**/ }
  }, [bgmVolume]);

  // Sync audio element play/pause state
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;
    const onPlay = () => setBgmPlaying(true);
    const onPause = () => setBgmPlaying(false);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => { audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause); };
  }, []);

  // Stop BGM on unmount
  useEffect(() => () => { bgmRef.current?.pause(); }, []);

  // Notify App.tsx whenever page count changes
  useEffect(() => {
    onPageCountChange?.(pages.length);
  }, [pages.length, onPageCountChange]);

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
    if (formatPainter) { setFormatPainter(null); return; }
    if (editMode) { setSelectedId(null); setEditingSubtitle(false); return; }
    if (!bgmStarted.current && bgmSrc) {
      bgmStarted.current = true;
      bgmRef.current?.play().catch(() => {});
    }
    if (!editMode && !panelOpen) nextSection();
  }, [editMode, panelOpen, nextSection, formatPainter, bgmSrc]);

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

  // Rotate
  const onRotate = useCallback((id: string, delta: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, rotate: p.rotate + delta } : p),
    }));
  }, [seqIdx, updatePages]);

  // Subtitle change
  const onSubtitleChange = useCallback((val: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, subtitle: val }));
  }, [seqIdx, updatePages]);

  // Text content change
  const onTextChange = useCallback((id: string, val: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, textContent: val } : p),
    }));
  }, [seqIdx, updatePages]);

  // Subtitle styling changes
  const onSubtitleBgChange = useCallback((color: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, subtitleBg: color }));
  }, [seqIdx, updatePages]);

  const onSubtitleFontSizeChange = useCallback((delta: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, subtitleFontSize: Math.max(22, Math.min(84, (pg.subtitleFontSize ?? 45) + delta)),
    }));
  }, [seqIdx, updatePages]);

  const onSubtitleDesignChange = useCallback((design: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, subtitleDesign: design }));
  }, [seqIdx, updatePages]);

  const onDecoThemeChange = useCallback((theme: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, decoTheme: theme }));
  }, [seqIdx, updatePages]);

  const onGlobalDecoThemeChange = useCallback((theme: string) => {
    setGlobalDecoTheme(theme);
    localStorage.setItem('scrapbook_deco_theme', theme);
  }, []);

  const onBgThemeChange = useCallback((key: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, bgTheme: key }));
  }, [seqIdx, updatePages]);

  const onSubtitleFontChange = useCallback((font: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, subtitleFont: font }));
  }, [seqIdx, updatePages]);

  const onSubtitleApplyAll = useCallback(() => {
    const cur = pages[seqIdx];
    const bg = cur?.subtitleBg ?? SUBTITLE_COLORS[0].value;
    const fontSize = cur?.subtitleFontSize ?? 45;
    const design = cur?.subtitleDesign ?? 'pill';
    const font = cur?.subtitleFont ?? SUBTITLE_FONTS[0].value;
    updatePages(prev => prev.map(pg => ({ ...pg, subtitleBg: bg, subtitleFontSize: fontSize, subtitleDesign: design, subtitleFont: font })));
  }, [seqIdx, pages, updatePages]);

  // Duplicate photo
  const onDuplicate = useCallback((id: string) => {
    updatePages(prev => prev.map((pg, pi) => {
      if (pi !== seqIdx) return pg;
      const src = pg.photos.find(p => p.id === id);
      if (!src) return pg;
      const clone = { ...src, id: `dup_${Date.now()}`, x: Math.min(68, src.x + 5), y: Math.min(55, src.y + 5) };
      return { ...pg, photos: [...pg.photos, clone] };
    }));
  }, [seqIdx, updatePages]);

  // Format copy (capture format)
  const onFormatCopy = useCallback((id: string) => {
    const photo = pages[seqIdx]?.photos.find(p => p.id === id);
    if (photo) setFormatPainter({ id, width: photo.width, rotate: photo.rotate });
  }, [seqIdx, pages]);

  // Z-order
  const onBringForward = useCallback((id: string) => {
    updatePages(prev => prev.map((pg, pi) => {
      if (pi !== seqIdx) return pg;
      const arr = [...pg.photos];
      const idx = arr.findIndex(p => p.id === id);
      if (idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]; }
      return { ...pg, photos: arr };
    }));
  }, [seqIdx, updatePages]);

  const onSendBackward = useCallback((id: string) => {
    updatePages(prev => prev.map((pg, pi) => {
      if (pi !== seqIdx) return pg;
      const arr = [...pg.photos];
      const idx = arr.findIndex(p => p.id === id);
      if (idx > 0) { [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]; }
      return { ...pg, photos: arr };
    }));
  }, [seqIdx, updatePages]);

  // Format paste (apply captured format)
  const onFormatPaste = useCallback((id: string) => {
    if (!formatPainter) return;
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.map(p => p.id === id ? { ...p, width: formatPainter.width, rotate: formatPainter.rotate } : p),
    }));
    setFormatPainter(null);
  }, [seqIdx, formatPainter, updatePages]);

  // Photo library
  const onLibraryAdd = useCallback((files: File[]) => {
    Promise.all(files.map(f => new Promise<{id:string;src:string;name:string}>((res, rej) => {
      const r = new FileReader();
      const uid = `lib_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      r.onload = () => res({ id: uid, src: r.result as string, name: f.name });
      r.onerror = rej;
      r.readAsDataURL(f);
    }))).then(items => setPhotoLibrary(prev => [...prev, ...items]));
  }, []);

  const onLibraryDelete = useCallback((id: string) => {
    setPhotoLibrary(prev => prev.filter(p => p.id !== id));
    setSelectedLibraryIds(prev => { const s = new Set(prev); s.delete(id); return s; });
  }, []);

  const onLibraryToggle = useCallback((id: string) => {
    setSelectedLibraryIds(prev => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id); else s.add(id);
      return s;
    });
  }, []);

  const onLibrarySelectAllToggle = useCallback(() => {
    setSelectedLibraryIds(prev =>
      prev.size === photoLibrary.length ? new Set() : new Set(photoLibrary.map(p => p.id))
    );
  }, [photoLibrary]);

  const onLibraryPlace = useCallback(() => {
    const selected = photoLibrary.filter(p => selectedLibraryIds.has(p.id));
    if (!selected.length) return;
    const positions = autoArrange(selected.length);
    updatePages(prev => {
      const existing = prev[seqIdx]?.photos ?? [];
      const newPhotos: ScrapbookPhoto[] = selected.map((p, i) => ({
        id: `up_${Date.now()}_${i}`, src: p.src, title: '',
        x: positions[i].x, y: positions[i].y, rotate: positions[i].rotate, width: 280,
      }));
      return prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, photos: [...existing, ...newPhotos] });
    });
    setSelectedLibraryIds(new Set());
    setEditMode(true);
  }, [photoLibrary, selectedLibraryIds, seqIdx, updatePages]);

  // Delete photo/textcard from board
  const onPhotoDelete = useCallback((id: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, photos: pg.photos.filter(p => p.id !== id),
    }));
    setSelectedId(null);
  }, [seqIdx, updatePages]);

  // Sticker multi-select
  const onStickerTypeToggle = useCallback((type: number) => {
    setPendingStickerTypes(prev => {
      const s = new Set(prev);
      if (s.has(type)) s.delete(type); else s.add(type);
      return s;
    });
  }, []);

  const onStickerTypeSelectAll = useCallback(() => {
    setPendingStickerTypes(prev =>
      prev.size === 26 ? new Set() : new Set(Array.from({ length: 26 }, (_, i) => i))
    );
  }, []);

  const onPlaceStickers = useCallback(() => {
    if (!pendingStickerTypes.size) return;
    const types = Array.from(pendingStickerTypes);
    updatePages(prev => prev.map((pg, pi) => {
      if (pi !== seqIdx) return pg;
      const newStickers = types.map(type => {
        const color = STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)];
        return {
          id: `stk_${Date.now()}_${type}_${Math.random().toString(36).slice(2)}`,
          type,
          x: 20 + Math.random() * 55,
          y: 15 + Math.random() * 55,
          rotate: (Math.random() - 0.5) * 30,
          size: 56 + Math.floor(Math.random() * 24),
          color,
          strokeColor: stickerStroke(color),
        };
      });
      return { ...pg, stickers: [...(pg.stickers ?? []), ...newStickers] };
    }));
    setPendingStickerTypes(new Set());
    setEditMode(true);
  }, [pendingStickerTypes, seqIdx, updatePages]);

  // ── Page management ──────────────────────────────────────────────────────────
  const onPageAdd = useCallback(() => {
    updatePages(prev => [...prev, { ...BLANK_PAGE }]);
    onSlideIdxChange?.(pages.length); // navigate to new last page
  }, [pages.length, updatePages, onSlideIdxChange]);

  const onPageDelete = useCallback((idx: number) => {
    if (pages.length <= 1) return;
    const newIdx = idx <= seqIdx ? Math.max(0, seqIdx - 1) : seqIdx;
    updatePages(prev => prev.filter((_, i) => i !== idx));
    onSlideIdxChange?.(newIdx);
  }, [pages.length, seqIdx, updatePages, onSlideIdxChange]);

  const onPageMoveUp = useCallback((idx: number) => {
    if (idx === 0) return;
    updatePages(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
    if (idx === seqIdx) onSlideIdxChange?.(idx - 1);
    else if (idx - 1 === seqIdx) onSlideIdxChange?.(idx);
  }, [seqIdx, updatePages, onSlideIdxChange]);

  const onPageMoveDown = useCallback((idx: number) => {
    updatePages(prev => {
      if (idx >= prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
    if (idx === seqIdx) onSlideIdxChange?.(idx + 1);
    else if (idx + 1 === seqIdx) onSlideIdxChange?.(idx);
  }, [seqIdx, updatePages, onSlideIdxChange]);

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

  // Set background image — base64 for persistence
  const onSetBgImage = useCallback((file: File) => {
    const r = new FileReader();
    r.onload = () => {
      const src = r.result as string;
      updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : { ...pg, bgImage: src }));
    };
    r.readAsDataURL(file);
  }, [seqIdx, updatePages]);

  // Sticker handlers
  const onAddStickerAt = useCallback((type: number, xPct: number, yPct: number) => {
    const halfW = (32 / window.innerWidth) * 100;
    const halfH = (32 / window.innerHeight) * 100;
    const newId = `stk_${Date.now()}`;
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: [...(pg.stickers ?? []), {
        id: newId, type,
        x: Math.max(0, Math.min(90, xPct - halfW)),
        y: Math.max(0, Math.min(85, yPct - halfH)),
        rotate: (Math.random() - 0.5) * 20, size: 64,
        color: STICKER_COLORS[0], strokeColor: stickerStroke(STICKER_COLORS[0]),
      }],
    }));
    setEditMode(true);
    setSelectedId(newId);
  }, [seqIdx, updatePages]);

  // Keep ref always up-to-date to avoid stale closure in drag effect
  const onAddStickerAtRef = useRef(onAddStickerAt);
  onAddStickerAtRef.current = onAddStickerAt;

  const handleStickerPointerDown = useCallback((type: number, e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = { type, startX: e.clientX, startY: e.clientY };
    setDragCursorPos({ x: e.clientX, y: e.clientY });
    setPanelOpen(false);
  }, []);

  useEffect(() => {
    if (!dragCursorPos) return;
    const onMove = (e: PointerEvent) => setDragCursorPos({ x: e.clientX, y: e.clientY });
    const onUp = (e: PointerEvent) => {
      const drag = dragRef.current;
      if (drag) {
        const canvas = canvasRef.current;
        let xPct = 40, yPct = 40;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          xPct = ((e.clientX - rect.left) / rect.width) * 100;
          yPct = ((e.clientY - rect.top) / rect.height) * 100;
        }
        onAddStickerAtRef.current(drag.type, xPct, yPct);
        dragRef.current = null;
      }
      setDragCursorPos(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { dragRef.current = null; setDragCursorPos(null); }
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('keydown', onKey);
    };
  }, [!!dragCursorPos]); // eslint-disable-line react-hooks/exhaustive-deps

  const onStickerMove = useCallback((id: string, x: number, y: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: (pg.stickers ?? []).map(s => s.id === id ? { ...s, x, y } : s),
    }));
  }, [seqIdx, updatePages]);

  const onStickerResize = useCallback((id: string, delta: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: (pg.stickers ?? []).map(s => s.id === id ? { ...s, size: Math.max(24, Math.min(200, s.size + delta)) } : s),
    }));
  }, [seqIdx, updatePages]);

  const onStickerRotate = useCallback((id: string, delta: number) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: (pg.stickers ?? []).map(s => s.id === id ? { ...s, rotate: s.rotate + delta } : s),
    }));
  }, [seqIdx, updatePages]);

  const onStickerColor = useCallback((id: string, color: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: (pg.stickers ?? []).map(s => s.id === id ? { ...s, color, strokeColor: stickerStroke(color) } : s),
    }));
  }, [seqIdx, updatePages]);

  const onStickerDelete = useCallback((id: string) => {
    updatePages(prev => prev.map((pg, pi) => pi !== seqIdx ? pg : {
      ...pg, stickers: (pg.stickers ?? []).filter(s => s.id !== id),
    }));
  }, [seqIdx, updatePages]);

  const onStickerReshuffle = useCallback(() => {
    updatePages(prev => prev.map((pg, pi) => {
      if (pi !== seqIdx) return pg;
      const stickers = pg.stickers ?? [];
      if (!stickers.length) return pg;
      const reshuffled = stickers.map(s => {
        const color = STICKER_COLORS[Math.floor(Math.random() * STICKER_COLORS.length)];
        return {
          ...s,
          x: 10 + Math.random() * 70,
          y: 10 + Math.random() * 65,
          rotate: (Math.random() - 0.5) * 40,
          size: 36 + Math.floor(Math.random() * 80),
          color,
          strokeColor: stickerStroke(color),
        };
      });
      return { ...pg, stickers: reshuffled };
    }));
  }, [seqIdx, updatePages]);

  const currentPage = pages[seqIdx];

  return (
    <div
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, background: getBgTheme(currentPage?.bgTheme).bg, overflow: 'hidden', cursor: dragCursorPos ? 'grabbing' : editMode ? 'default' : 'pointer' }}
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
        opacity: getBgTheme(currentPage?.bgTheme).grain, mixBlendMode: 'multiply', pointerEvents: 'none', zIndex: 4,
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 55%, transparent 46%, ${getBgTheme(currentPage?.bgTheme).vignette} 100%)`,
        pointerEvents: 'none', zIndex: 4,
      }} />


      {/* Global background decorations */}
      {globalDecoTheme !== 'off' && (
        <BackgroundDecorations seqIdx={seqIdx} theme={globalDecoTheme} />
      )}

      {/* Ruled lines */}
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{
          position: 'absolute', left: '6%', right: '6%', top: `${20 + i * 12}%`,
          height: 1, background: 'rgba(155,115,65,0.055)', pointerEvents: 'none', zIndex: 4,
        }} />
      ))}


      {/* Photos & text cards */}
      <AnimatePresence>
        <motion.div
          key={seqIdx}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0, zIndex: 10 }}
        >
          {currentPage?.photos.map((photo, idx) =>
            photo.src === '' ? (
              <TextCard
                key={photo.id} photo={photo} editMode={editMode} zIndex={10 + idx}
                isSelected={selectedId === photo.id}
                onSelect={() => setSelectedId(photo.id)}
                onMove={onMove} onResize={onResize} onRotate={onRotate} onTextChange={onTextChange}
                onDuplicate={() => onDuplicate(photo.id)}
                onFormatCopy={() => onFormatCopy(photo.id)}
                onFormatPaste={() => onFormatPaste(photo.id)}
                onBringForward={() => onBringForward(photo.id)}
                onSendBackward={() => onSendBackward(photo.id)}
                onDelete={() => onPhotoDelete(photo.id)}
                isFormatSource={formatPainter?.id === photo.id}
                formatPainterActive={!!formatPainter}
              />
            ) : (
              <Polaroid
                key={photo.id} photo={photo} editMode={editMode} zIndex={10 + idx}
                isSelected={selectedId === photo.id}
                onSelect={() => setSelectedId(photo.id)}
                onMove={onMove} onResize={onResize} onRotate={onRotate}
                onTitleChange={onTitleChange}
                onDuplicate={() => onDuplicate(photo.id)}
                onFormatCopy={() => onFormatCopy(photo.id)}
                onFormatPaste={() => onFormatPaste(photo.id)}
                onBringForward={() => onBringForward(photo.id)}
                onSendBackward={() => onSendBackward(photo.id)}
                onDelete={() => onPhotoDelete(photo.id)}
                isFormatSource={formatPainter?.id === photo.id}
                formatPainterActive={!!formatPainter}
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

      {/* Stickers */}
      <AnimatePresence>
        <motion.div
          key={`stk_${seqIdx}`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none' }}
        >
          {currentPage?.stickers?.map((s, idx) => (
            <StickerItem
              key={s.id} sticker={s} editMode={editMode} idx={idx}
              isSelected={selectedId === s.id}
              onSelect={() => setSelectedId(s.id)}
              onMove={onStickerMove} onResize={onStickerResize} onRotate={onStickerRotate}
              onColor={onStickerColor} onDelete={onStickerDelete}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Subtitle + toolbar */}
      <div style={{
        position: 'fixed', bottom: 148, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        zIndex: 50, pointerEvents: 'none',
      }}>
        {/* Subtitle toolbar — 자막 선택 시만 표시 */}
        {editMode && selectedId === 'subtitle' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: 'rgba(20,10,4,0.82)', backdropFilter: 'blur(10px)',
              borderRadius: 20, padding: '5px 12px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.28)',
            }}>
              {/* Font size */}
              <button onClick={() => onSubtitleFontSizeChange(-4)}
                style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>−</button>
              <span style={{ color: 'rgba(255,220,160,0.7)', fontSize: 10, fontFamily: 'monospace', minWidth: 28, textAlign: 'center' }}>
                {currentPage?.subtitleFontSize ?? 45}
              </span>
              <button onClick={() => onSubtitleFontSizeChange(4)}
                style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.12)', color: '#fff', fontSize: 14, cursor: 'pointer' }}>＋</button>

              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Color swatches */}
              {SUBTITLE_COLORS.map(c => (
                <button key={c.value} onClick={() => onSubtitleBgChange(c.value)}
                  style={{
                    width: 18, height: 18, borderRadius: '50%', border: 'none', cursor: 'pointer',
                    background: c.preview,
                    outline: (currentPage?.subtitleBg ?? SUBTITLE_COLORS[0].value) === c.value ? '2.5px solid #fff' : '2px solid transparent',
                    outlineOffset: '2px',
                  }} />
              ))}

              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Design buttons */}
              {SUBTITLE_DESIGNS.map(d => (
                <button key={d.key} onClick={() => onSubtitleDesignChange(d.key)}
                  style={{
                    width: 26, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: (currentPage?.subtitleDesign ?? 'pill') === d.key ? 'rgba(200,144,90,0.82)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                  }}>{d.label}</button>
              ))}

              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Font selector */}
              {SUBTITLE_FONTS.map(f => (
                <button key={f.value} onClick={() => onSubtitleFontChange(f.value)}
                  style={{
                    height: 24, padding: '0 8px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    fontFamily: f.value, fontSize: 12,
                    background: (currentPage?.subtitleFont ?? SUBTITLE_FONTS[0].value) === f.value
                      ? 'rgba(200,144,90,0.82)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', whiteSpace: 'nowrap',
                  }}>{f.label}</button>
              ))}

              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Apply to all pages */}
              <button onClick={onSubtitleApplyAll}
                style={{
                  padding: '0 10px', height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
                  background: 'rgba(93,201,165,0.78)', color: '#fff',
                  fontSize: 10, fontFamily: "'Noto Sans KR', sans-serif",
                  letterSpacing: '0.5px', whiteSpace: 'nowrap',
                }}>전체 적용</button>

              <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 2px' }} />

              {/* Close / save */}
              <button
                onClick={(e) => { e.stopPropagation(); setEditingSubtitle(false); setSelectedId(null); }}
                style={{
                  width: 26, height: 26, borderRadius: '50%', border: 'none', cursor: 'pointer',
                  background: 'rgba(232,160,180,0.85)', color: '#fff', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="저장 후 닫기"
              >✓</button>
            </div>
          </div>
        )}

        {/* Subtitle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`sub_${seqIdx}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              ...getSubtitleBoxStyle(currentPage?.subtitleDesign ?? 'pill', currentPage?.subtitleBg ?? SUBTITLE_COLORS[0].value),
              color: 'rgba(255,242,210,0.97)',
              fontFamily: currentPage?.subtitleFont ?? "'Gaegu', cursive",
              fontSize: currentPage?.subtitleFontSize ?? 45,
              fontWeight: 700, letterSpacing: '1px',
              whiteSpace: 'nowrap',
              ...(( currentPage?.subtitleDesign ?? 'pill') === 'shadow'
                ? { textShadow: '0 2px 18px rgba(0,0,0,0.92), 0 0 40px rgba(0,0,0,0.7)' }
                : {}),
              cursor: editMode ? 'text' : 'default',
              pointerEvents: editMode ? 'auto' : 'none',
            }}
            onClick={(e) => { e.stopPropagation(); if (editMode) { setSelectedId('subtitle'); setEditingSubtitle(true); } }}
          >
            {editingSubtitle ? (
              <input
                autoFocus
                defaultValue={currentPage?.subtitle}
                onBlur={(e) => { onSubtitleChange(e.target.value); setEditingSubtitle(false); }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); e.stopPropagation(); }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: 'rgba(255,242,210,0.97)',
                  fontFamily: currentPage?.subtitleFont ?? "'Gaegu', cursive",
                  fontSize: currentPage?.subtitleFontSize ?? 45,
                  fontWeight: 700, letterSpacing: '1px',
                  textAlign: 'center', minWidth: 200,
                }}
              />
            ) : (
              currentPage?.subtitle
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Format painter active banner */}
      <AnimatePresence>
        {formatPainter && (
          <motion.div
            initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}
            style={{
              position: 'fixed', top: 58, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(200,140,40,0.92)', backdropFilter: 'blur(8px)',
              borderRadius: 20, padding: '6px 22px',
              color: '#fff', fontSize: 11,
              fontFamily: "'Noto Sans KR', sans-serif",
              letterSpacing: '1.5px', pointerEvents: 'none', zIndex: 101,
              boxShadow: '0 2px 12px rgba(200,140,40,0.4)',
            }}
          >
            🖌 서식복사 중 — 적용할 객체를 클릭하세요 (배경 클릭으로 취소)
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit-mode hint */}
      <AnimatePresence>
        {editMode && !formatPainter && (
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
            드래그·＋−·⧉복사·🖌서식복사로 편집하세요
          </motion.div>
        )}
      </AnimatePresence>

      {/* 마지막 씬 — 처음으로 가기 */}
      <AnimatePresence>
        {seqIdx === pages.length - 1 && !editMode && (
          <motion.button
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            onClick={(e) => { e.stopPropagation(); goToFirst?.(); }}
            style={{
              position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
              zIndex: 160, background: 'rgba(232,160,180,0.18)',
              border: '1px solid rgba(232,160,180,0.45)', borderRadius: 28,
              color: 'rgba(255,220,230,0.85)', fontSize: 14,
              fontFamily: "'Gaegu', cursive", letterSpacing: '1.5px',
              padding: '10px 32px', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 18px rgba(232,160,180,0.2)',
            }}
          >
            ↩ 처음으로
          </motion.button>
        )}
      </AnimatePresence>

      {/* FABs */}
      <div
        style={{ position: 'fixed', right: 22, bottom: 90, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 150 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => {
            const entering = editMode === false;
            setEditMode(m => !m);
            if (entering) setAutoPlay?.(false);
            else setSelectedId(null);
          }} title="편집 모드"
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
          onClick={() => { setPanelOpen(o => !o); setAutoPlay?.(false); }} title="편집 패널"
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
        <motion.button
          whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.93 }}
          onClick={() => { setBgmOpen(o => !o); setAutoPlay?.(false); }} title="BGM"
          style={{
            width: 44, height: 44, borderRadius: '50%', border: 'none',
            background: bgmOpen ? 'rgba(100,150,240,0.92)' : bgmSrc ? 'rgba(100,150,240,0.22)' : 'rgba(248,242,232,0.88)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.14)',
            color: bgmOpen ? '#fff' : bgmSrc ? '#5090e0' : '#9a7060', fontSize: 17, cursor: 'pointer',
          }}
        >
          🎵
        </motion.button>
      </div>

      {/* BGM mini panel */}
      <AnimatePresence>
        {bgmOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed', right: 76, bottom: 90,
              background: 'rgba(248,242,230,0.97)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(200,160,100,0.2)', borderRadius: 16,
              padding: '16px 18px', zIndex: 151, width: 220,
              boxShadow: '-2px 4px 18px rgba(0,0,0,0.14)',
              display: 'flex', flexDirection: 'column', gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontFamily: "'Dancing Script',cursive", fontSize: 17, color: '#5a3828' }}>🎵 BGM</div>

            <div style={{ fontSize: 10, color: 'rgba(100,65,40,0.5)', fontFamily: "'Noto Sans KR',sans-serif", lineHeight: 1.6 }}>
              {bgmSrc ? '음악 로드됨 ✓' : '음악 파일을 선택하세요'}
              {!bgmSrc && <><br /><span style={{ opacity: 0.7 }}>(새로고침 시 초기화)</span></>}
            </div>

            <button onClick={() => bgmFileRef.current?.click()}
              style={{
                width: '100%', padding: '8px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(255,248,235,0.9)', border: '1px solid rgba(200,144,90,0.3)',
                fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: '#6a4022',
              }}>
              📁 {bgmSrc ? '음악 교체' : '음악 파일 선택'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14 }}>🔊</span>
              <input type="range" min={0} max={1} step={0.02}
                value={bgmVolume}
                onChange={(e) => setBgmVolume(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#c8905a' }}
              />
              <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(100,65,40,0.5)', minWidth: 30, textAlign: 'right' }}>
                {Math.round(bgmVolume * 100)}%
              </span>
            </div>

            {bgmSrc && (
              <button
                onClick={() => {
                  if (bgmPlaying) bgmRef.current?.pause();
                  else bgmRef.current?.play().catch(() => {});
                }}
                style={{
                  width: '100%', padding: '8px', borderRadius: 10, cursor: 'pointer',
                  background: bgmPlaying ? 'rgba(200,144,90,0.15)' : 'rgba(100,150,240,0.15)',
                  border: `1px solid ${bgmPlaying ? 'rgba(200,144,90,0.35)' : 'rgba(100,150,240,0.35)'}`,
                  fontFamily: "'Noto Sans KR',sans-serif", fontSize: 12, color: '#6a4022',
                }}>
                {bgmPlaying ? '⏸ 정지' : '▶ 재생'}
              </button>
            )}

            <input ref={bgmFileRef} type="file" accept="audio/*" style={{ display: 'none' }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                if (bgmSrc) URL.revokeObjectURL(bgmSrc);
                const url = URL.createObjectURL(f);
                setBgmSrc(url);
                bgmStarted.current = true;
                setTimeout(() => {
                  if (bgmRef.current) {
                    bgmRef.current.src = url;
                    bgmRef.current.volume = bgmVolume;
                    bgmRef.current.play().catch(() => {});
                  }
                }, 50);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element */}
      <audio ref={bgmRef} loop style={{ display: 'none' }} />

      {/* Edit panel */}
      <AnimatePresence>
        {panelOpen && (
          <EditPanel
            seqIdx={seqIdx}
            onClose={() => setPanelOpen(false)}
            onAddText={onAddText}
            onSetBgImage={onSetBgImage}
            bgTheme={currentPage?.bgTheme ?? 'cream'}
            onBgThemeChange={onBgThemeChange}
            globalDecoTheme={globalDecoTheme}
            onGlobalDecoThemeChange={onGlobalDecoThemeChange}
            onStickerPointerDown={handleStickerPointerDown}
            photoLibrary={photoLibrary}
            selectedLibraryIds={selectedLibraryIds}
            onLibraryAdd={onLibraryAdd}
            onLibraryDelete={onLibraryDelete}
            onLibraryToggle={onLibraryToggle}
            onLibraryPlace={onLibraryPlace}
            onLibrarySelectAllToggle={onLibrarySelectAllToggle}
            pendingStickerTypes={pendingStickerTypes}
            onStickerTypeToggle={onStickerTypeToggle}
            onStickerTypeSelectAll={onStickerTypeSelectAll}
            onPlaceStickers={onPlaceStickers}
            onStickerReshuffle={onStickerReshuffle}
            allPages={pages}
            currentPageIdx={seqIdx}
            onPageAdd={onPageAdd}
            onPageDelete={onPageDelete}
            onPageMoveUp={onPageMoveUp}
            onPageMoveDown={onPageMoveDown}
            onPageGoTo={(idx) => onSlideIdxChange?.(idx)}
          />
        )}
      </AnimatePresence>

      {/* Drag-to-place sticker floating preview */}
      {dragCursorPos && dragRef.current && (
        <div style={{
          position: 'fixed',
          left: dragCursorPos.x - 32,
          top: dragCursorPos.y - 32,
          width: 64, height: 64,
          pointerEvents: 'none',
          zIndex: 9998,
          filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.28))',
          transform: 'scale(1.18)',
          transformOrigin: 'center center',
        }}>
          <svg viewBox="-12 -12 24 24" width={64} height={64} style={{ overflow: 'visible' }}>
            {renderDeco(dragRef.current.type, STICKER_COLORS[0], stickerStroke(STICKER_COLORS[0]))}
          </svg>
        </div>
      )}
    </div>
  );
}
