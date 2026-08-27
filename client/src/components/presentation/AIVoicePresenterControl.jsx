import React, { useState, useEffect } from 'react';
import {
  FaMicrophone,
  FaPlay,
  FaPause,
  FaRedo,
  FaForward,
  FaStop,
  FaCog,
  FaVolumeUp,
  FaVolumeMute,
  FaTimes,
  FaCheck,
  FaClosedCaptioning,
  FaSlidersH
} from 'react-icons/fa';
import voiceNarrationService from '../../services/voiceNarrationService';

const AIVoicePresenterControl = ({
  isActive,
  onToggleActive,
  showControls = true,
  currentSlideIndex,
  totalSlides,
  currentSlideTitle,
  currentScript,
  onNextSlide,
  onReplaySlide,
  autoAdvanceEnabled,
  onToggleAutoAdvance,
  transitionDelay = 1800,
  onChangeTransitionDelay
}) => {
  const [voiceState, setVoiceState] = useState({
    isPlaying: false,
    isPaused: false,
    voices: [],
    selectedVoiceIndex: 0,
    rate: 1.5
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [currentSpokenCharIndex, setCurrentSpokenCharIndex] = useState(0);

  useEffect(() => {
    const unsubscribe = voiceNarrationService.subscribe(setVoiceState);
    return () => unsubscribe();
  }, []);

  const viVoices = voiceNarrationService.getVietnameseVoices();
  const allVoices = voiceState.voices;

  const handleTogglePlayPause = () => {
    if (!isActive) {
      onToggleActive(true);
      return;
    }
    if (voiceState.isPlaying && !voiceState.isPaused) {
      voiceNarrationService.pause();
    } else if (voiceState.isPaused) {
      voiceNarrationService.resume();
    } else {
      onReplaySlide();
    }
  };

  const handleStop = () => {
    voiceNarrationService.stop();
    onToggleActive(false);
  };

  const handleVoiceChange = (e) => {
    const idx = parseInt(e.target.value, 10);
    voiceNarrationService.setVoice(idx);
    // If active, replay current slide with new voice
    if (isActive) {
      setTimeout(() => onReplaySlide(), 150);
    }
  };

  const handleRateChange = (newRate) => {
    voiceNarrationService.setRate(newRate);
    if (isActive && voiceState.isPlaying) {
      setTimeout(() => onReplaySlide(), 150);
    }
  };

  return (
    <>
      {/* 1. TOP HEADER TRIGGER BUTTON (When Inactive) */}
      {!isActive ? (
        <button
          type="button"
          onClick={() => onToggleActive(true)}
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '10px',
            padding: '0.42rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.35)',
            transition: 'all 0.2s ease',
            textTransform: 'uppercase',
            letterSpacing: '0.3px'
          }}
          title="Bật giọng đọc AI thuyết minh tự động chuyển slide"
        >
          <FaMicrophone style={{ fontSize: '0.9rem', color: '#FDE047' }} />
          <span>Giao Ban AI</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleStop}
          style={{
            background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.35)',
            borderRadius: '10px',
            padding: '0.42rem 0.95rem',
            fontSize: '0.82rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
            transition: 'all 0.2s ease'
          }}
          title="Dừng chế độ AI thuyết minh"
        >
          <FaStop style={{ fontSize: '0.8rem' }} />
          <span>Dừng AI</span>
        </button>
      )}

      {/* 2. FLOATING NARRATOR CONTROL DOCK (When Active) */}
      {isActive && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: showControls ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
          opacity: showControls ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          zIndex: 999999,
          backgroundColor: 'rgba(15, 30, 60, 0.94)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1.5px solid rgba(147, 197, 253, 0.35)',
          borderRadius: '20px',
          padding: '0.6rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.9rem',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.55), 0 0 20px rgba(124, 58, 237, 0.25)',
          color: '#FFFFFF',
          animation: 'fadeInUp 0.25s ease-out'
        }}>
          {/* Soundwave Animation & State Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', paddingRight: '0.6rem', borderRight: '1px solid rgba(255,255,255,0.18)' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: voiceState.isPlaying && !voiceState.isPaused ? '#7C3AED' : 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: voiceState.isPlaying && !voiceState.isPaused ? '0 0 12px #A78BFA' : 'none'
            }}>
              <FaMicrophone style={{ color: voiceState.isPlaying && !voiceState.isPaused ? '#FDE047' : '#94A3B8', fontSize: '0.95rem' }} />
            </div>

            {/* Soundwave Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', height: '18px' }}>
              {[14, 22, 10, 26, 16, 20].map((h, i) => (
                <div
                  key={i}
                  style={{
                    width: '3px',
                    height: voiceState.isPlaying && !voiceState.isPaused ? `${h}px` : '4px',
                    backgroundColor: voiceState.isPlaying && !voiceState.isPaused ? '#38BDF8' : '#64748B',
                    borderRadius: '3px',
                    transition: 'height 0.15s ease'
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: '900', color: '#93C5FD', letterSpacing: '0.5px' }}>
                AI THUYẾT MINH
              </div>
              <div style={{ fontSize: '0.7rem', color: '#CBD5E1' }}>
                Slide {currentSlideIndex + 1}/{totalSlides}
              </div>
            </div>
          </div>

          {/* Interactive Player Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={handleTogglePlayPause}
              style={{
                backgroundColor: '#2563EB',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '50%',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.95rem',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.15s ease'
              }}
              title={voiceState.isPlaying && !voiceState.isPaused ? 'Tạm dừng thuyết minh (Phím Space)' : 'Tiếp tục thuyết minh (Phím Space)'}
            >
              {voiceState.isPlaying && !voiceState.isPaused ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
            </button>

            {/* Replay Button */}
            <button
              type="button"
              onClick={onReplaySlide}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
              title="Đọc lại slide này (Phím R)"
            >
              <FaRedo />
            </button>

            {/* Next Slide Button */}
            <button
              type="button"
              onClick={onNextSlide}
              style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
              title="Chuyển sang slide tiếp theo"
            >
              <FaForward />
            </button>

            {/* Subtitles Toggle */}
            <button
              type="button"
              onClick={() => setShowSubtitles(!showSubtitles)}
              style={{
                backgroundColor: showSubtitles ? '#059669' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                borderRadius: '10px',
                padding: '0 0.6rem',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: '700'
              }}
              title="Bật/Tắt phụ đề chữ chạy"
            >
              <FaClosedCaptioning /> {showSubtitles ? 'Phụ đề: Bật' : 'Phụ đề: Tắt'}
            </button>

            {/* Settings Toggle */}
            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              style={{
                backgroundColor: showSettings ? '#7C3AED' : 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.88rem'
              }}
              title="Cài đặt giọng đọc & tốc độ"
            >
              <FaSlidersH />
            </button>

            {/* Close / Stop */}
            <button
              type="button"
              onClick={handleStop}
              style={{
                backgroundColor: '#EF4444',
                border: 'none',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '0.85rem',
                marginLeft: '0.3rem'
              }}
              title="Dừng thuyết minh"
            >
              <FaTimes />
            </button>
          </div>

          {/* 3. SETTINGS POPOVER DRAWER */}
          {showSettings && (
            <div style={{
              position: 'absolute',
              bottom: '55px',
              right: '0',
              backgroundColor: '#0F2C59',
              border: '1.5px solid #3B82F6',
              borderRadius: '18px',
              padding: '1.1rem 1.3rem',
              width: '320px',
              boxShadow: '0 12px 35px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              color: '#FFFFFF',
              zIndex: 1000
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#93C5FD' }}>
                  ⚙️ Cài Đặt Giọng Đọc AI
                </span>
                <button
                  type="button"
                  onClick={() => setShowSettings(false)}
                  style={{ background: 'none', border: 'none', color: '#CBD5E1', cursor: 'pointer' }}
                >
                  <FaTimes />
                </button>
              </div>

              {/* Voice Selector */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: '700', color: '#CBD5E1', display: 'block', marginBottom: '0.3rem' }}>
                  Giọng Đọc Tiếng Việt:
                </label>
                <select
                  value={voiceState.selectedVoiceIndex}
                  onChange={handleVoiceChange}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.65rem',
                    backgroundColor: '#1E3A8A',
                    color: '#FFFFFF',
                    border: '1px solid #3B82F6',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {allVoices.map((v, i) => (
                    <option key={i} value={i}>
                      {v.lang?.startsWith('vi') ? `🇻🇳 ${v.name}` : `🌐 ${v.name} (${v.lang})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed / Rate */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: '700', color: '#CBD5E1', marginBottom: '0.3rem' }}>
                  <span>Tốc Độ Đọc:</span>
                  <span style={{ color: '#38BDF8', fontWeight: '900' }}>{voiceState.rate}x</span>
                </div>
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  {[1.0, 1.25, 1.5, 1.75, 2.0].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRateChange(r)}
                      style={{
                        flex: 1,
                        backgroundColor: voiceState.rate === r ? '#38BDF8' : 'rgba(255,255,255,0.1)',
                        color: voiceState.rate === r ? '#0F2C59' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.3rem 0',
                        fontSize: '0.78rem',
                        fontWeight: '800',
                        cursor: 'pointer'
                      }}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Advance Toggle & Delay */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#CBD5E1' }}>
                    Tự Động Chuyển Slide:
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleAutoAdvance(!autoAdvanceEnabled)}
                    style={{
                      backgroundColor: autoAdvanceEnabled ? '#10B981' : '#64748B',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '0.2rem 0.6rem',
                      fontSize: '0.74rem',
                      fontWeight: '800',
                      cursor: 'pointer'
                    }}
                  >
                    {autoAdvanceEnabled ? 'BẬT' : 'TẮT'}
                  </button>
                </div>

                {autoAdvanceEnabled && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                    <span>Thời gian chờ sau khi đọc xong:</span>
                    <select
                      value={transitionDelay}
                      onChange={(e) => onChangeTransitionDelay(Number(e.target.value))}
                      style={{
                        backgroundColor: '#1E3A8A',
                        color: '#FFFFFF',
                        border: '1px solid #3B82F6',
                        borderRadius: '6px',
                        padding: '0.2rem 0.4rem',
                        fontSize: '0.74rem',
                        outline: 'none'
                      }}
                    >
                      <option value={1200}>1.2 giây</option>
                      <option value={1800}>1.8 giây</option>
                      <option value={2500}>2.5 giây</option>
                      <option value={3500}>3.5 giây</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. SUBTITLES BANNER (Bottom of presentation screen when active) */}
      {isActive && showSubtitles && currentScript && (
        <div style={{
          position: 'fixed',
          bottom: '88px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 999998,
          backgroundColor: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.22)',
          borderRadius: '14px',
          padding: '0.65rem 1.4rem',
          maxWidth: '82%',
          textAlign: 'center',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            fontSize: '0.94rem',
            fontWeight: '700',
            color: '#F8FAFC',
            lineHeight: 1.4,
            textShadow: '0 1px 3px rgba(0,0,0,0.8)'
          }}>
            💬 {currentScript}
          </div>
        </div>
      )}
    </>
  );
};

export default AIVoicePresenterControl;
