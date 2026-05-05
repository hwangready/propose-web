// SEQUENCE 순서 기준 (seqIdx 0~11)
// [0,0]→[0,1]→[0,2]→[1,2]→[1,1]→[1,0]→[2,0]→[2,1]→[2,2]→[3,2]→[3,1]→[3,0]

export interface ClotheslineCardData {
  src: string;
  title: string;
  caption: string;
  rotate: number;
}

export const CLOTHESLINE_CARDS: ClotheslineCardData[] = [
  { src: 'https://picsum.photos/seed/cl_hero/400/520',     title: '우리 ♡',           caption: '우리의 이야기',          rotate: -4 },
  { src: 'https://picsum.photos/seed/cl_meet/400/520',     title: '처음 만난 날',     caption: '그날, 네가 나타났어',    rotate:  3 },
  { src: 'https://picsum.photos/seed/cl_date/400/520',     title: '우리가 된 날',     caption: '설레었던 그 순간',       rotate: -6 },
  { src: 'https://picsum.photos/seed/cl_trip/400/520',     title: '첫 여행',           caption: '둘이서 떠난 첫 여행',   rotate:  5 },
  { src: 'https://picsum.photos/seed/cl_mem/400/520',      title: '소중한 기억',       caption: '잊을 수 없는 그날들',   rotate: -3 },
  { src: 'https://picsum.photos/seed/cl_trav/400/520',     title: '여행의 기억',       caption: '함께라면 어디든',       rotate:  7 },
  { src: 'https://picsum.photos/seed/cl_daily/400/520',    title: '우리의 일상',       caption: '평범한 날들이 빛나',    rotate: -5 },
  { src: 'https://picsum.photos/seed/cl_together/400/520', title: '함께한 순간들',     caption: '네 옆에 있는 모든 순간', rotate:  4 },
  { src: 'https://picsum.photos/seed/cl_climax/400/520',   title: '매일 네 곁에',      caption: '사랑한다, 언제나',      rotate: -2 },
  { src: 'https://picsum.photos/seed/cl_future/400/520',   title: '앞으로의 우리',     caption: '함께 만들어갈 이야기',  rotate:  6 },
  { src: 'https://picsum.photos/seed/cl_promise/400/520',  title: '영원히 함께',       caption: '약속할게, 평생',        rotate: -4 },
  { src: 'https://picsum.photos/seed/cl_finale/400/520',   title: '나랑 결혼해 줄래?', caption: '♡ Will you marry me? ♡', rotate:  2 },
];
