import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props { isActive: boolean }

export default function AudioUploader({ isActive }: Props) {
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!audioRef.current || !audioSrc) return;
    if (isActive) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isActive, audioSrc]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFileName(file.name.replace(/\.[^/.]+$/, ''));
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = url;
      audioRef.current.loop = true;
      audioRef.current.volume = 0.4;
      if (isActive) { audioRef.current.play().catch(() => {}); setIsPlaying(true); }
    }
    setAudioSrc(url);
  };

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioSrc) { inputRef.current?.click(); return; }
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const pickFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <div style={{ position: 'absolute', bottom: 16, right: 16, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
      <audio ref={audioRef} loop />
      <input ref={inputRef} type="file" accept="audio/*" style={{ display: 'none' }} onChange={handleFile} onClick={(e) => e.stopPropagation()} />

      <AnimatePresence>
        {audioSrc && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            style={{
              fontSize: 9, color: 'rgba(125,184,160,0.7)', letterSpacing: '1px',
              fontFamily: "'Courier New',monospace",
              maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            ♫ {fileName}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 6 }}>
        {audioSrc && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={pickFile}
            title="음악 파일 교체"
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'rgba(8,22,14,0.7)',
              border: '1px solid rgba(93,202,165,0.25)',
              color: 'rgba(125,184,160,0.6)', cursor: 'pointer',
              fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            ↑
          </motion.button>
        )}
        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={toggle}
          title={!audioSrc ? '음악 파일 선택' : isPlaying ? '정지' : '재생'}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: isPlaying ? 'rgba(93,202,165,0.2)' : 'rgba(8,22,14,0.7)',
            border: `1px solid ${isPlaying ? 'rgba(93,202,165,0.5)' : 'rgba(93,202,165,0.25)'}`,
            color: isPlaying ? '#5dcaa5' : 'rgba(125,184,160,0.6)',
            cursor: 'pointer', fontSize: 13,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
            boxShadow: isPlaying ? '0 0 12px rgba(93,202,165,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {!audioSrc ? '♪' : isPlaying ? '⏸' : '▶'}
        </motion.button>
      </div>
    </div>
  );
}
