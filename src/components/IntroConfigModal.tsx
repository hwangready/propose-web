import { useState } from 'react';
import { motion } from 'framer-motion';
import { loadIntroConfig, saveIntroConfig } from '../config/introConfig';

interface Props {
  onClose: () => void;
}

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'rgba(125,184,160,0.8)',
  letterSpacing: '1.5px', textTransform: 'uppercase',
  fontFamily: "'Courier New', monospace",
  marginBottom: 6, display: 'block',
};

const inputBase: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: '#e8eaed',
  padding: '10px 14px', fontSize: 14,
  fontFamily: "'Noto Sans KR', sans-serif",
  outline: 'none',
};

export default function IntroConfigModal({ onClose }: Props) {
  const [config, setConfig] = useState(() => loadIntroConfig());

  const handleSave = () => {
    saveIntroConfig(config);
    onClose();
  };

  const modeBtn = (mode: 'google' | 'chatgpt', label: string, icon: string) => {
    const active = config.introMode === mode;
    return (
      <button
        onClick={() => setConfig(c => ({ ...c, introMode: mode }))}
        style={{
          flex: 1, padding: '10px 0', borderRadius: 8, cursor: 'pointer',
          border: `1px solid ${active ? 'rgba(93,202,165,0.6)' : 'rgba(255,255,255,0.1)'}`,
          background: active ? 'rgba(93,202,165,0.15)' : 'rgba(255,255,255,0.03)',
          color: active ? '#5dcaa5' : 'rgba(255,255,255,0.4)',
          fontFamily: "'Courier New',monospace", fontSize: 11,
          letterSpacing: '1px', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 4, transition: 'all 0.15s',
        }}
      >
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0d1f17',
          border: '1px solid rgba(100,170,130,0.3)',
          borderRadius: 16, padding: '36px 40px',
          width: 'min(520px, 90vw)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{
          fontSize: 13, fontWeight: 600, color: '#9ecfba',
          fontFamily: "'Courier New',monospace", letterSpacing: '2px',
          textTransform: 'uppercase', marginBottom: 28,
        }}>
          인트로 설정
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 활성화 토글 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>인트로 활성화</label>
            <button
              onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: config.enabled ? '#5dcaa5' : 'rgba(255,255,255,0.1)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <motion.div
                animate={{ x: config.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                style={{
                  position: 'absolute', top: 3, left: 0,
                  width: 20, height: 20, borderRadius: '50%',
                  background: '#fff',
                }}
              />
            </button>
          </div>

          {/* 인트로 모드 선택 */}
          <div>
            <label style={labelStyle}>인트로 화면 선택</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {modeBtn('google', 'Google 검색', '🔍')}
              {modeBtn('chatgpt', 'ChatGPT', '✦')}
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label style={labelStyle}>
              {config.introMode === 'google' ? '검색어 (여자친구 이름)' : '이름 (ChatGPT 질문)'}
            </label>
            <input
              style={inputBase}
              value={config.name}
              onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
              placeholder="여자친구 이름"
            />
          </div>

          {/* ChatGPT 응답 — ChatGPT 모드일 때만 표시 */}
          {config.introMode === 'chatgpt' && (
            <div>
              <label style={labelStyle}>ChatGPT 응답 내용</label>
              <textarea
                style={{ ...inputBase, minHeight: 120, resize: 'vertical', lineHeight: 1.6 }}
                value={config.chatResponse}
                onChange={e => setConfig(c => ({ ...c, chatResponse: e.target.value }))}
                placeholder="이름 검색 후 표시될 ChatGPT 응답..."
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 28 }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', color: 'rgba(125,184,160,0.6)',
              border: '1px solid rgba(100,170,130,0.2)',
              borderRadius: 8, padding: '9px 20px', fontSize: 12,
              fontFamily: "'Courier New',monospace", cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{
              background: 'rgba(93,202,165,0.18)', color: '#5dcaa5',
              border: '1px solid rgba(93,202,165,0.45)',
              borderRadius: 8, padding: '9px 20px', fontSize: 12,
              fontFamily: "'Courier New',monospace", cursor: 'pointer',
              letterSpacing: '1px',
            }}
          >
            저장
          </button>
        </div>

        <div style={{
          marginTop: 16, fontSize: 10, color: 'rgba(125,184,160,0.25)',
          fontFamily: "'Courier New',monospace", textAlign: 'center',
          letterSpacing: '0.5px',
        }}>
          변경사항은 페이지 새로고침 후 적용됩니다
        </div>
      </motion.div>
    </motion.div>
  );
}
