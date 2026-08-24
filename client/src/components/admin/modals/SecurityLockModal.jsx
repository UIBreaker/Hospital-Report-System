import React, { useEffect, useRef } from 'react';
import {
  FaLock,
  FaUnlockAlt,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimes,
  FaHospital,
  FaKey,
  FaUserShield,
  FaCheck
} from 'react-icons/fa';

// Web Audio API Sound Synthesizer for high-tech security sound effects
const playSecuritySound = (type) => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'lock') {
      // Metallic Heavy Snap + Cyber Bass Drop
      const now = ctx.currentTime;

      // Click transient
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(800, now);
      clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
      clickGain.gain.setValueAtTime(0.3, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.09);

      // Heavy Thud Bass
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(160, now + 0.04);
      bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.45);
      bassGain.gain.setValueAtTime(0.4, now + 0.04);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now + 0.04);
      bassOsc.stop(now + 0.55);

      // Hi-tech sci-fi shimmer
      const shimmerOsc = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmerOsc.type = 'triangle';
      shimmerOsc.frequency.setValueAtTime(520, now + 0.06);
      shimmerOsc.frequency.linearRampToValueAtTime(260, now + 0.35);
      shimmerGain.gain.setValueAtTime(0.15, now + 0.06);
      shimmerGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      shimmerOsc.connect(shimmerGain);
      shimmerGain.connect(ctx.destination);
      shimmerOsc.start(now + 0.06);
      shimmerOsc.stop(now + 0.45);
    } else {
      // Access Granted Harmonic Chord (F# - A# - C# - F#)
      const now = ctx.currentTime;
      const notes = [369.99, 466.16, 554.37, 739.99];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.65);
      });
    }
  } catch (e) {
    // Ignore audio autoplay restrictions
  }
};

const SecurityLockModal = ({
  isOpen = false,
  mode = 'confirm', // 'confirm' | 'animating'
  targetType = 'all', // 'all' | 'single'
  targetName = 'Toàn Viện',
  date = '',
  willLock = true,
  onConfirm,
  onCancel,
  onClose,
  loading = false
}) => {
  const animTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && mode === 'animating') {
      playSecuritySound(willLock ? 'lock' : 'unlock');
      animTimeoutRef.current = setTimeout(() => {
        if (onClose) onClose();
      }, 3500);
    }
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, [isOpen, mode, willLock, onClose]);

  if (!isOpen) return null;

  // Format date display (DD/MM/YYYY)
  const formatDateVN = (dStr) => {
    if (!dStr) return '';
    const p = String(dStr).split('-');
    if (p.length === 3) return `${p[2]}/${p[1]}/${p[0]}`;
    return dStr;
  };
  const dateFormatted = formatDateVN(date);

  // ================= 1. ANIMATION SUCCESS OVERLAY (CYBER LOCKDOWN / ACCESS GRANTED) =================
  if (mode === 'animating') {
    const isLock = willLock;
    const themeColor = isLock ? '#D97706' : '#10B981';
    const themeBg = isLock ? 'rgba(15, 23, 42, 0.94)' : 'rgba(6, 30, 20, 0.94)';
    const glowColor = isLock ? 'rgba(217, 119, 6, 0.5)' : 'rgba(16, 185, 129, 0.5)';

    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: themeBg,
        backdropFilter: 'blur(12px)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        boxSizing: 'border-box'
      }}>
        <style>{`
          @keyframes securityPulseRing {
            0% { transform: scale(0.6); opacity: 0.8; }
            50% { opacity: 0.4; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes securityShackleSnap {
            0% { transform: translateY(-16px) scale(1.1); }
            45% { transform: translateY(0) scale(0.95); }
            70% { transform: translateY(-4px) scale(1.02); }
            100% { transform: translateY(0) scale(1); }
          }
          @keyframes securityBadgeGlow {
            0%, 100% { box-shadow: 0 0 25px ${glowColor}, inset 0 0 15px ${glowColor}; }
            50% { box-shadow: 0 0 50px ${glowColor}, inset 0 0 25px ${glowColor}; }
          }
          @keyframes securityGridScan {
            0% { background-position: 0 0; }
            100% { background-position: 0 40px; }
          }
        `}</style>

        {/* Outer Laser Shield Box */}
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '560px',
          backgroundColor: isLock ? '#0B132B' : '#06281B',
          borderRadius: '24px',
          border: `2.5px solid ${themeColor}`,
          padding: '2.5rem 2rem',
          textAlign: 'center',
          color: '#FFFFFF',
          animation: 'securityBadgeGlow 2.5s infinite ease-in-out',
          boxShadow: `0 20px 60px rgba(0,0,0,0.6), 0 0 40px ${glowColor}`,
          overflow: 'hidden'
        }}>
          
          {/* Cyber Scanning Grid Background */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
            animation: 'securityGridScan 4s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Pulse Ripple Rings */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '280px',
            height: '280px',
            marginTop: '-140px',
            marginLeft: '-140px',
            borderRadius: '50%',
            border: `2px solid ${themeColor}`,
            animation: 'securityPulseRing 2s ease-out infinite',
            pointerEvents: 'none'
          }} />

          {/* Center Main Icon */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            margin: '0 auto 1.5rem auto',
            borderRadius: '50%',
            backgroundColor: isLock ? 'rgba(217, 119, 6, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `3px solid ${themeColor}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            color: themeColor,
            animation: isLock ? 'securityShackleSnap 0.65s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
            boxShadow: `0 0 35px ${glowColor}`
          }}>
            {isLock ? <FaLock /> : <FaUnlockAlt />}
          </div>

          {/* Security Tag Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: isLock ? 'rgba(217, 119, 6, 0.25)' : 'rgba(16, 185, 129, 0.25)',
            border: `1.5px solid ${themeColor}`,
            color: isLock ? '#FDE68A' : '#A7F3D0',
            padding: '0.35rem 1rem',
            borderRadius: '999px',
            fontSize: '0.82rem',
            fontWeight: '800',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '0.85rem'
          }}>
            <FaShieldAlt /> {isLock ? 'BẢO MẬT KHÓA SỔ TOÀN VẸN' : 'CẤP QUYỀN MỞ KHÓA CHỈNH SỬA'}
          </div>

          {/* Headline Title */}
          <h2 style={{
            fontSize: '1.65rem',
            fontWeight: '900',
            margin: '0 0 0.5rem 0',
            color: isLock ? '#FEF08A' : '#6EE7B7',
            letterSpacing: '0.3px',
            textShadow: `0 2px 10px ${glowColor}`
          }}>
            {isLock
              ? (targetType === 'all' ? 'ĐÃ KHÓA SỔ TOÀN VIỆN THÀNH CÔNG!' : `ĐÃ KHÓA SỔ KHOA ${targetName.toUpperCase()}!`)
              : (targetType === 'all' ? 'ĐÃ MỞ KHÓA TOÀN VIỆN THÀNH CÔNG!' : `ĐÃ MỞ KHÓA KHOA ${targetName.toUpperCase()}!`)}
          </h2>

          {/* Subtitle Description */}
          <p style={{
            fontSize: '0.92rem',
            color: isLock ? '#CBD5E1' : '#D1FAE5',
            lineHeight: 1.5,
            margin: '0 0 1.5rem 0',
            maxWidth: '460px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            {isLock ? (
              <>
                Toàn bộ dữ liệu ngày <strong style={{ color: '#FFFFFF' }}>{dateFormatted}</strong> đã được <strong>niêm phong toàn vẹn</strong>. Mọi thao tác chỉnh sửa từ các khoa phòng đã bị <strong>vô hiệu hóa an toàn</strong>.
              </>
            ) : (
              <>
                Quyền chỉnh sửa báo cáo ngày <strong style={{ color: '#FFFFFF' }}>{dateFormatted}</strong> đã được <strong>kích hoạt trở lại</strong>. Các khoa phòng có thể tự do cập nhật và nộp lại số liệu.
              </>
            )}
          </p>

          {/* Cyber Status Details Box */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.95rem 1.25rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem',
            textAlign: 'left',
            fontSize: '0.8rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>Trạng thái phân quyền</span>
              <strong style={{ color: isLock ? '#EF4444' : '#10B981', fontSize: '0.88rem' }}>
                {isLock ? '🔒 Đã vô hiệu hóa chỉnh sửa' : '✏️ Cho phép sửa & nộp lại'}
              </strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>Phạm vi tác vụ</span>
              <strong style={{ color: '#FFFFFF', fontSize: '0.88rem' }}>
                {targetType === 'all' ? 'Toàn bộ 12 khoa phòng' : `Khoa ${targetName}`}
              </strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>Ngày giao ban</span>
              <strong style={{ color: '#38BDF8', fontSize: '0.88rem' }}>{dateFormatted}</strong>
            </div>
            <div>
              <span style={{ color: '#94A3B8', display: 'block', fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: '700' }}>Thẩm quyền</span>
              <strong style={{ color: '#A78BFA', fontSize: '0.88rem' }}>Quản Trị Viên (Admin)</strong>
            </div>
          </div>

          {/* Close Action Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              backgroundColor: themeColor,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.8rem',
              fontWeight: '800',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: `0 4px 15px ${glowColor}`,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem'
            }}
          >
            <FaCheck /> Hoàn Tất
          </button>
        </div>
      </div>
    );
  }

  // ================= 2. ULTRA-MODERN CONFIRMATION MODAL =================
  const isLockAction = willLock;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 999990,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(15, 44, 89, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.25s ease-out'
      }}>
        {/* Header Ribbon */}
        <div style={{
          backgroundColor: isLockAction ? '#78350F' : '#065F46',
          backgroundImage: isLockAction
            ? 'linear-gradient(135deg, #92400E 0%, #D97706 100%)'
            : 'linear-gradient(135deg, #065F46 0%, #10B981 100%)',
          padding: '1.25rem 1.5rem',
          color: '#FFFFFF',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem'
            }}>
              {isLockAction ? <FaLock /> : <FaUnlockAlt />}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', opacity: 0.9 }}>
                QUẢN TRỊ BẢO MẬT CA TRỰC
              </div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', lineHeight: 1.2 }}>
                {isLockAction
                  ? (targetType === 'all' ? 'Xác Nhận Khóa Sổ Toàn Viện' : `Khóa Sổ Báo Cáo: ${targetName}`)
                  : (targetType === 'all' ? 'Xác Nhận Mở Khóa Toàn Viện' : `Mở Khóa Báo Cáo: ${targetName}`)}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <FaTimes size={13} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem 1.65rem' }}>
          {/* Target Info Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <FaHospital style={{ color: '#2563EB', fontSize: '1.1rem' }} />
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Đối tượng áp dụng</div>
                <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0F2C59' }}>
                  {targetType === 'all' ? 'Tất cả khoa phòng đã nộp' : `Khoa: ${targetName}`}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Ngày giao ban</div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#1E40AF' }}>
                {dateFormatted}
              </div>
            </div>
          </div>

          {/* Explanation Alert */}
          <div style={{
            backgroundColor: isLockAction ? '#FFFBEB' : '#F0FDF4',
            border: `1.5px solid ${isLockAction ? '#FDE68A' : '#BBF7D0'}`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                color: isLockAction ? '#D97706' : '#16A34A',
                fontSize: '1.2rem',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {isLockAction ? <FaShieldAlt /> : <FaCheckCircle />}
              </div>
              <div style={{ fontSize: '0.86rem', color: isLockAction ? '#78350F' : '#14532D', lineHeight: 1.5 }}>
                {isLockAction ? (
                  <>
                    <strong>Khóa sổ toàn vẹn:</strong> Dữ liệu báo cáo sẽ được niêm phong để chuẩn bị giao ban chuyên môn. Sau khi khóa, <strong>các khoa phòng sẽ không thể chỉnh sửa, thêm bớt số liệu hay xóa ca bệnh</strong>.
                  </>
                ) : (
                  <>
                    <strong>Mở khóa chỉnh sửa:</strong> Quyền truy cập sẽ được cấp lại cho các khoa phòng để <strong>tiếp tục cập nhật, bổ sung số liệu hoặc hoàn thiện các ca bệnh</strong>.
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              style={{
                backgroundColor: '#F1F5F9',
                color: '#475569',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '0.65rem 1.25rem',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Hủy Bỏ
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              style={{
                backgroundColor: isLockAction ? '#D97706' : '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.65rem 1.5rem',
                fontWeight: '800',
                fontSize: '0.88rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: isLockAction ? '0 4px 12px rgba(217, 119, 6, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : isLockAction ? (
                <><FaLock /> Tiến Hành Khóa Sổ</>
              ) : (
                <><FaUnlockAlt /> Mở Khóa Chỉnh Sửa</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLockModal;
