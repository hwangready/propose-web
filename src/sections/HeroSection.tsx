import { motion, useTransform } from 'framer-motion';
import HexFrame from '../components/HexFrame';
import PolaroidFrame from '../components/PolaroidFrame';
import { useMouseParallax } from '../hooks/useMouseParallax';

interface Props { isActive: boolean }

const WORDS = ['Everyone', 'smiles', 'in', 'the', 'same', 'language'];

const wordVariants = {
  hidden: { opacity: 0, y: 40, rotateX: -30, transition: { duration: 0 } },
  show:   { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring' as const, stiffness: 180, damping: 16 } },
};

const containerVariants = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12, delayChildren: 0.35 } },
};

export default function HeroSection({ isActive }: Props) {
  const { x: mx, y: my } = useMouseParallax(80, 16);
  const hexX = useTransform(mx, [-1, 1], [-22, 22]);
  const hexY = useTransform(my, [-1, 1], [-14, 14]);
  const polaroidX = useTransform(mx, [-1, 1], [16, -16]);
  const polaroidY = useTransform(my, [-1, 1], [-10, 10]);

  return (
    <section style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 60px',
      background: '#0d1f14',
      overflow: 'hidden',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: 1200, width: '100%', display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 48, alignItems: 'center' }}>

        {/* 왼쪽: 육각형 클러스터 */}
        <div style={{ position: 'relative', height: 300 }}>
          <motion.div style={{ position: 'absolute', inset: 0, x: hexX, y: hexY }}>
            <motion.div
              style={{ position: 'absolute', top: 20, left: 20 }}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.7 }}
              transition={{ duration: isActive ? 0.8 : 0, delay: isActive ? 0.2 : 0, type: 'spring', stiffness: 120 }}
            >
              <HexFrame src="사진1.jpg" size={200} patchColor="#a8d5bf" patchOffset={8} />
            </motion.div>
            <motion.div
              style={{ position: 'absolute', top: 140, left: 150 }}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.7 }}
              transition={{ duration: isActive ? 0.8 : 0, delay: isActive ? 0.45 : 0, type: 'spring', stiffness: 120 }}
            >
              <HexFrame src="사진2.jpg" size={130} patchColor="#c9e8db" patchOffset={6} />
            </motion.div>
          </motion.div>
        </div>

        {/* 중앙: 단어별 스프링 등장 */}
        <div style={{ textAlign: 'center', perspective: 600 }}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isActive ? 'show' : 'hidden'}
            style={{
              fontFamily: "'Dancing Script',cursive",
              fontSize: 'clamp(30px,3.2vw,52px)',
              color: '#a8d5bf',
              lineHeight: 1.6,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0 10px',
            }}
          >
            {WORDS.map((w, i) => (
              <motion.span key={i} variants={wordVariants} style={{ display: 'inline-block', transformOrigin: 'bottom' }}>
                {w}
              </motion.span>
            ))}
          </motion.div>
        </div>

        {/* 오른쪽: 폴라로이드 */}
        <motion.div
          animate={{ opacity: isActive ? 1 : 0, x: isActive ? 0 : 60 }}
          transition={{ duration: isActive ? 0.9 : 0, delay: isActive ? 0.3 : 0, type: 'spring', stiffness: 100 }}
          style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}
        >
          <motion.div style={{ x: polaroidX, y: polaroidY }}>
            <PolaroidFrame src="사진3.jpg" caption="우리의 첫 페이지" rotate={4} width={210} photoHeight={190} showRope ropeLength={44} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
