export interface ScrapbookPhoto {
  id: string;
  src: string;           // empty string = text card
  title: string;
  x: number;
  y: number;
  rotate: number;
  width: number;
  textContent?: string;  // text-only card content
}

export interface ScrapbookSticker {
  id: string;
  type: number;        // 0-13 (same as renderDeco types)
  x: number;           // % of viewport left
  y: number;           // % of viewport top
  rotate: number;
  size: number;        // px
  color: string;       // CSS opaque color
  strokeColor: string;
}

export interface ScrapbookPage {
  photos: ScrapbookPhoto[];
  subtitle: string;
  bgNote?: string;
  bgImage?: string;
  subtitleBg?: string;         // CSS color for subtitle background
  subtitleFontSize?: number;   // default 45
  subtitleDesign?: string;     // 'pill' | 'flat' | 'outline' | 'shadow'
  subtitleFont?: string;       // font family name
  decoTheme?: string;          // kept for legacy
  bgTheme?: string;            // key from BG_THEMES
  stickers?: ScrapbookSticker[];
}

export const SCRAPBOOK_PAGES: ScrapbookPage[] = [
  {
    photos: [
      { id: 'p0_0', src: 'https://picsum.photos/seed/sc0a/600/450', title: '처음 ♡', x: 12, y: 14, rotate: -5, width: 290 },
      { id: 'p0_1', src: 'https://picsum.photos/seed/sc0b/500/400', title: '그 날의 기억', x: 52, y: 12, rotate: 4, width: 268 },
    ],
    subtitle: '처음 그 날...',
    bgNote: '♡',
  },
  {
    photos: [
      { id: 'p1_0', src: 'https://picsum.photos/seed/sc1a/600/450', title: '설레임', x: 10, y: 10, rotate: -3, width: 300 },
      { id: 'p1_1', src: 'https://picsum.photos/seed/sc1b/500/380', title: '처음 본 순간', x: 54, y: 16, rotate: 6, width: 274 },
    ],
    subtitle: '우연처럼, 운명처럼',
  },
  {
    photos: [
      { id: 'p2_0', src: 'https://picsum.photos/seed/sc2a/600/450', title: '우리가 된 날', x: 8, y: 12, rotate: -6, width: 306 },
      { id: 'p2_1', src: 'https://picsum.photos/seed/sc2b/500/400', title: '함께', x: 50, y: 10, rotate: 5, width: 280 },
    ],
    subtitle: '처음으로 우리가 되던 날',
    bgNote: '우리',
  },
  {
    photos: [
      { id: 'p3_0', src: 'https://picsum.photos/seed/sc3a/600/450', title: '첫 여행 ✈', x: 6, y: 10, rotate: -4, width: 298 },
      { id: 'p3_1', src: 'https://picsum.photos/seed/sc3b/500/400', title: '설레는 길', x: 46, y: 18, rotate: 7, width: 284 },
      { id: 'p3_2', src: 'https://picsum.photos/seed/sc3c/400/320', title: '함께라서', x: 24, y: 46, rotate: -3, width: 248 },
    ],
    subtitle: '함께라서 더 특별했던',
  },
  {
    photos: [
      { id: 'p4_0', src: 'https://picsum.photos/seed/sc4a/600/450', title: '소중한 순간', x: 10, y: 10, rotate: -2, width: 294 },
      { id: 'p4_1', src: 'https://picsum.photos/seed/sc4b/500/400', title: '잊을 수 없어', x: 52, y: 14, rotate: -7, width: 276 },
    ],
    subtitle: '잊을 수 없는 순간들',
    bgNote: '♩',
  },
  {
    photos: [
      { id: 'p5_0', src: 'https://picsum.photos/seed/sc5a/600/450', title: '그 길에서', x: 8, y: 12, rotate: -5, width: 302 },
      { id: 'p5_1', src: 'https://picsum.photos/seed/sc5b/500/400', title: '길 위의 우리', x: 48, y: 10, rotate: 4, width: 282 },
      { id: 'p5_2', src: 'https://picsum.photos/seed/sc5c/400/320', title: '새로운 곳에서', x: 26, y: 46, rotate: 8, width: 252 },
    ],
    subtitle: '함께 떠난 길에서',
  },
  {
    photos: [
      { id: 'p6_0', src: 'https://picsum.photos/seed/sc6a/600/450', title: '평범한 하루', x: 10, y: 10, rotate: -4, width: 296 },
      { id: 'p6_1', src: 'https://picsum.photos/seed/sc6b/500/400', title: '함께하는 일상', x: 52, y: 16, rotate: 6, width: 278 },
    ],
    subtitle: '평범한 하루가 특별해지는',
    bgNote: '일상',
  },
  {
    photos: [
      { id: 'p7_0', src: 'https://picsum.photos/seed/sc7a/600/450', title: '빛나는 순간', x: 8, y: 10, rotate: -3, width: 304 },
      { id: 'p7_1', src: 'https://picsum.photos/seed/sc7b/500/400', title: '네가 있어서', x: 50, y: 14, rotate: -6, width: 282 },
    ],
    subtitle: '네가 있어 빛나는',
  },
  {
    photos: [
      { id: 'p8_0', src: 'https://picsum.photos/seed/sc8a/600/450', title: '항상 함께', x: 10, y: 10, rotate: -5, width: 298 },
      { id: 'p8_1', src: 'https://picsum.photos/seed/sc8b/500/400', title: '네 곁에', x: 52, y: 10, rotate: 5, width: 276 },
      { id: 'p8_2', src: 'https://picsum.photos/seed/sc8c/400/320', title: '매일매일', x: 28, y: 46, rotate: -4, width: 250 },
    ],
    subtitle: '항상 함께이고 싶어',
    bgNote: '♡',
  },
  {
    photos: [
      { id: 'p9_0', src: 'https://picsum.photos/seed/sc9a/600/450', title: '앞으로도', x: 8, y: 10, rotate: -4, width: 300 },
      { id: 'p9_1', src: 'https://picsum.photos/seed/sc9b/500/400', title: '함께할 날들', x: 50, y: 14, rotate: 7, width: 278 },
    ],
    subtitle: '앞으로의 모든 날들',
  },
  {
    photos: [
      { id: 'p10_0', src: 'https://picsum.photos/seed/sc10a/600/450', title: '영원히', x: 10, y: 12, rotate: -6, width: 306 },
      { id: 'p10_1', src: 'https://picsum.photos/seed/sc10b/500/400', title: '네 곁에', x: 52, y: 10, rotate: 4, width: 276 },
    ],
    subtitle: '영원히 네 곁에',
    bgNote: '∞',
  },
  {
    photos: [
      { id: 'p11_0', src: 'https://picsum.photos/seed/sc11a/600/450', title: '우리의 이야기', x: 14, y: 12, rotate: -3, width: 310 },
      {
        id: 'p11_text',
        src: '',
        title: '',
        x: 52, y: 18, rotate: 2, width: 290,
        textContent: '나랑 결혼해 줄래? 💍',
      },
    ],
    subtitle: '나랑 결혼해 줄래? 💍',
    bgNote: '💍',
  },
];
