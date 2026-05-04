import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomCursor from './components/CustomCursor';
import PresentationMode from './components/PresentationMode';
import JourneyCanvas from './components/JourneyCanvas';
import NavigationMap from './components/NavigationMap';
import DirectionArrows from './components/DirectionArrows';
import { useJourneyNav } from './hooks/useJourneyNav';

export default function App() {
  const { pos, go, goTo, canGo } = useJourneyNav();
  const [presentMode, setPresentMode] = useState(false);

  return (
    <>
      <CustomCursor />
      <JourneyCanvas pos={pos} go={go} canGo={canGo} />
      <NavigationMap pos={pos} goTo={goTo} />
      <DirectionArrows canGo={canGo} go={go} />

      {/* 연출 모드 버튼 */}
      <motion.button
        onClick={() => setPresentMode(true)}
        whileHover={{ scale: 1.06, boxShadow: '0 8px 32px rgba(93,168,128,0.3)' }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        style={{
          position: 'fixed',
          bottom: 80,
          right: 24,
          zIndex: 200,
          background: 'rgba(8,22,14,0.88)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(100,170,130,0.4)',
          color: '#9ecfba',
          padding: '10px 18px',
          borderRadius: 99,
          cursor: 'pointer',
          fontFamily: "'Courier New',monospace",
          fontSize: 10,
          letterSpacing: '2px',
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        }}
      >
        <span>▶</span>
        <span>연출 모드</span>
      </motion.button>

      <AnimatePresence>
        {presentMode && <PresentationMode onClose={() => setPresentMode(false)} />}
      </AnimatePresence>
    </>
  );
}
