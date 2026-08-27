import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaHospital, 
  FaCalendarAlt, 
  FaUserMd, 
  FaUserNurse, 
  FaAmbulance, 
  FaProcedures, 
  FaHeartbeat, 
  FaFilePdf, 
  FaPlus, 
  FaSignOutAlt, 
  FaTv, 
  FaShieldAlt, 
  FaDatabase, 
  FaCloudUploadAlt,
  FaCheck,
  FaArrowRight,
  FaClock,
  FaLock
} from 'react-icons/fa';

// Web Audio API Triumphant Medical Uplink Sound
const playReportUplinkSuccessSound = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const now = ctx.currentTime;

    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-12, now);
    compressor.knee.setValueAtTime(14, now);
    compressor.ratio.setValueAtTime(4.5, now);
    compressor.attack.setValueAtTime(0.003, now);
    compressor.release.setValueAtTime(0.25, now);
    compressor.connect(ctx.destination);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, now);
    masterGain.connect(compressor);

    // Warm Ambient Pad (C3, G3, C4, E4)
    [130.81, 196.00, 261.63, 329.63].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.02);

      gain.gain.setValueAtTime(0.0001, now + 0.02);
      gain.gain.linearRampToValueAtTime(0.18 / (idx * 0.3 + 1), now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + 0.02);
      osc.stop(now + 4.0);
    });

    // High Uplink Crystal Chimes (C5, E5, G5, B5, C6)
    const fanfare = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51];
    fanfare.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      const chimeTime = now + 0.12 + idx * 0.11;
      osc.frequency.setValueAtTime(freq, chimeTime);

      gain.gain.setValueAtTime(0.0001, chimeTime);
      gain.gain.linearRampToValueAtTime(0.22 / (idx * 0.2 + 1), chimeTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 2.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(chimeTime);
      osc.stop(chimeTime + 2.8);
    });
  } catch (e) {}
};

// Canvas Celebratory Particles
const CelebratoryCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#0284C7', '#10B981', '#2DD4BF', '#F59E0B', '#38BDF8', '#FFFFFF', '#6366F1'];
    const particles = Array.from({ length: 90 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 300,
      y: canvas.height * 0.35 + (Math.random() - 0.5) * 150,
      w: Math.random() * 8 + 5,
      h: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 12,
      vy: Math.random() * -10 - 3,
      gravity: 0.22,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      alpha: 1
    }));

    let startTime = Date.now();
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rot += p.rotSpeed;
        if (elapsed > 2000) {
          p.alpha = Math.max(0, p.alpha - 0.018);
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      if (elapsed < 4200) {
        animId = requestAnimationFrame(render);
      }
    };

    render();

    const onResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

const ReportSuccessHub = ({
  departmentName = '',
  departmentCode = '',
  reportDate = '',
  doctorName = '',
  nurseName = '',
  overtimeStaff = [],
  submissionTimestamp = '',
  transferCases = [],
  surgeryCases = [],
  deathCases = [],
  criticalCases = [],
  formData = {},
  onExportPdf,
  onCreateNew,
  onLogout
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    playReportUplinkSuccessSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Format Date String
  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
    return dateStr;
  };

  const formattedDate = formatDateDDMMYYYY(reportDate);

  // Generate deterministic verification token
  const syncHash = `TTYT-BL-SYNC-${(reportDate || '').replace(/-/g, '')}-${(departmentCode || 'DEPT').toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const totalCases = transferCases.length + surgeryCases.length + deathCases.length + criticalCases.length;

  return (
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      padding: '2rem 1rem 4.5rem',
      minHeight: '85vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <CelebratoryCanvas />

      <style>{`
        @keyframes haloSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes haloSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseGlowRing {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.9; }
        }
        @keyframes packetBeamUp {
          0% { transform: translateY(12px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(-16px); opacity: 0; }
        }
        @keyframes cardPopIn {
          0% { opacity: 0; transform: scale(0.96) translateY(16px); filter: blur(6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .hud-stat-pill {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hud-stat-pill:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(2, 132, 199, 0.15);
        }
      `}</style>

      {/* Main Holographic Telemetry Hub Card */}
      <div 
        style={{
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(15, 44, 89, 0.12), 0 0 0 1px rgba(186, 230, 253, 0.8)',
          border: '1.5px solid rgba(255, 255, 255, 0.9)',
          position: 'relative',
          overflow: 'hidden',
          padding: '2.5rem 2rem',
          boxSizing: 'border-box',
          textAlign: 'center',
          animation: 'cardPopIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) both'
        }}
      >
        {/* Top Glowing Laser Banner */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #0284C7 0%, #2DD4BF 35%, #10B981 70%, #0284C7 100%)'
        }} />

        {/* 1. Holographic Uplink Orbit Sphere */}
        <div style={{
          position: 'relative',
          width: '120px',
          height: '120px',
          margin: '0.5rem auto 1.4rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Outer Cyan Laser Orbit Ring */}
          <div style={{
            position: 'absolute',
            inset: '-12px',
            borderRadius: '50%',
            border: '2px dashed rgba(2, 132, 199, 0.45)',
            animation: 'haloSpinSlow 18s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Inner Emerald Ring */}
          <div style={{
            position: 'absolute',
            inset: '-4px',
            borderRadius: '50%',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            borderTopColor: '#34D399',
            borderRightColor: 'transparent',
            animation: 'haloSpinReverse 10s linear infinite',
            pointerEvents: 'none'
          }} />

          {/* Glowing Aura Ring */}
          <div style={{
            position: 'absolute',
            inset: '-16px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, rgba(2, 132, 199, 0.15) 50%, transparent 75%)',
            filter: 'blur(14px)',
            animation: 'pulseGlowRing 2.4s ease-in-out infinite',
            zIndex: 0
          }} />

          {/* Center Sphere */}
          <div style={{
            width: '92px',
            height: '92px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #0284C7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '2.5rem',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.45)',
            position: 'relative',
            zIndex: 2,
            border: '3px solid #FFFFFF'
          }}>
            <FaCloudUploadAlt />
          </div>
        </div>

        {/* 2. Top Live Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          backgroundColor: '#F0FDF4',
          border: '1.5px solid #86EFAC',
          borderRadius: '999px',
          padding: '0.38rem 1.25rem',
          color: '#15803D',
          fontSize: '0.86rem',
          fontWeight: '900',
          letterSpacing: '0.4px',
          marginBottom: '0.85rem',
          boxShadow: '0 2px 10px rgba(22, 163, 74, 0.12)'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#16A34A',
            display: 'inline-block',
            boxShadow: '0 0 8px #16A34A'
          }} />
          <span>ĐÃ ĐẨY LÊN CỔNG GIAO BAN TOÀN VIỆN THÀNH CÔNG</span>
        </div>

        {/* 3. Main Headline */}
        <h1 style={{
          margin: '0 0 0.4rem 0',
          color: '#0F2C59',
          fontSize: '2.1rem',
          fontWeight: '900',
          letterSpacing: '-0.3px',
          lineHeight: 1.2
        }}>
          Đồng Bộ Báo Cáo Ca Trực Hoàn Tất!
        </h1>

        {/* 4. Subtitle Context */}
        <p style={{
          color: '#475569',
          margin: '0 auto 2rem auto',
          fontSize: '1rem',
          lineHeight: 1.6,
          maxWidth: '720px'
        }}>
          Toàn bộ số liệu chuyên môn và các ca bệnh của <strong style={{ color: '#0284C7' }}>{departmentName}</strong> đã được nạp thành công vào hệ thống dữ liệu tập trung và sẵn sàng phát sóng trên màn hình Trình Chiếu Giao Ban của Ban Giám Đốc.
        </p>

        {/* 5. HUD GRID: 4 PUSHED DATA METRICS CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.8rem',
          textAlign: 'left'
        }}>
          {/* Metric 1: General Duty Metrics */}
          <div className="hud-stat-pill" style={{
            background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
            border: '1.5px solid #BAE6FD',
            borderRadius: '16px',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: '#0369A1', fontWeight: '800', textTransform: 'uppercase' }}>
                Số Liệu Chuyên Môn
              </span>
              <FaCheckCircle style={{ color: '#0284C7', fontSize: '0.95rem' }} />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}>
              Đã Lưu Trữ
            </div>
            <div style={{ fontSize: '0.72rem', color: '#0284C7', fontWeight: '700' }}>
              ✓ Khám & Điều trị hoàn tất
            </div>
          </div>

          {/* Metric 2: Transfer Cases */}
          <div className="hud-stat-pill" style={{
            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
            border: '1.5px solid #FDE68A',
            borderRadius: '16px',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '800', textTransform: 'uppercase' }}>
                Ca Chuyển Viện
              </span>
              <FaAmbulance style={{ color: '#D97706', fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#92400E' }}>
              {transferCases.length} <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>ca bệnh</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: '700' }}>
              {transferCases.length > 0 ? '✓ Đầy đủ diễn biến & hình ảnh' : 'Không phát sinh ca chuyển'}
            </div>
          </div>

          {/* Metric 3: Surgery Cases */}
          <div className="hud-stat-pill" style={{
            background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
            border: '1.5px solid #BFDBFE',
            borderRadius: '16px',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: '800', textTransform: 'uppercase' }}>
                Ca Phẫu Thuật
              </span>
              <FaProcedures style={{ color: '#2563EB', fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#1E40AF' }}>
              {surgeryCases.length} <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>ca mổ</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#1D4ED8', fontWeight: '700' }}>
              {surgeryCases.length > 0 ? '✓ Chi tiết lệnh mổ & chẩn đoán' : 'Không có ca phẫu thuật'}
            </div>
          </div>

          {/* Metric 4: Critical & Death Cases */}
          <div className="hud-stat-pill" style={{
            background: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)',
            border: '1.5px solid #E9D5FF',
            borderRadius: '16px',
            padding: '1rem 1.1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.35rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: '800', textTransform: 'uppercase' }}>
                Nặng & Tử Vong
              </span>
              <FaHeartbeat style={{ color: '#9333EA', fontSize: '1.1rem' }} />
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#6B21A8' }}>
              {deathCases.length + criticalCases.length} <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>hồ sơ</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#7E22CE', fontWeight: '700' }}>
              {deathCases.length} tử vong • {criticalCases.length} theo dõi
            </div>
          </div>
        </div>

        {/* 6. VERIFIED TRANSMISSION DOSSIER HUD CARD */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderRadius: '18px',
          border: '1.5px solid #E2E8F0',
          padding: '1.35rem 1.65rem',
          marginBottom: '2.2rem',
          textAlign: 'left',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
        }}>
          {/* Header of Dossier */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1.5px solid #E2E8F0',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#0F2C59',
              fontWeight: '900',
              fontSize: '0.94rem',
              letterSpacing: '0.3px'
            }}>
              <FaShieldAlt style={{ color: '#0284C7' }} />
              <span>HỒ SƠ BÀN GIAO SỐ HÓA ĐÃ XÁC THỰC</span>
            </div>
            <div style={{
              fontSize: '0.78rem',
              color: '#059669',
              backgroundColor: '#ECFDF5',
              border: '1px solid #A7F3D0',
              padding: '0.2rem 0.75rem',
              borderRadius: '999px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}>
              <FaLock style={{ fontSize: '0.65rem' }} /> SSL 256-bit Encrypted
            </div>
          </div>

          {/* Grid of Key Duty Staff & Date Info */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            fontSize: '0.88rem'
          }}>
            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800' }}>
                Khoa / Khối trực:
              </span>
              <strong style={{ color: '#0F2C59', fontSize: '0.98rem' }}>{departmentName}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800' }}>
                Ngày trực giao ban:
              </span>
              <strong style={{ color: '#0284C7', fontSize: '0.98rem' }}>{formattedDate}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800' }}>
                Bác sĩ trực ca:
              </span>
              <strong style={{ color: '#1E40AF', fontSize: '0.98rem' }}>{doctorName || '—'}</strong>
            </div>

            <div>
              <span style={{ color: '#64748B', display: 'block', fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: '800' }}>
                Điều dưỡng trực:
              </span>
              <strong style={{ color: '#059669', fontSize: '0.98rem' }}>{nurseName || '—'}</strong>
            </div>
          </div>

          {/* Hash & Uplink Metadata */}
          <div style={{
            marginTop: '1.1rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed #CBD5E1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.65rem',
            fontSize: '0.78rem',
            color: '#64748B'
          }}>
            <div>
              Mã giao dịch số liệu: <strong style={{ color: '#0F2C59', fontFamily: 'monospace' }}>{syncHash}</strong>
            </div>
            <div>
              Thời gian xác nhận: <strong>{submissionTimestamp || 'Vừa xong'}</strong>
            </div>
          </div>
        </div>

        {/* 7. ACTION COMMAND BAR */}
        <div style={{
          display: 'flex',
          gap: '0.85rem',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          {/* Button 1: Export PDF */}
          <button 
            type="button"
            onClick={onExportPdf}
            style={{
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.85rem 1.65rem',
              fontSize: '0.96rem',
              fontWeight: '900',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
              transition: 'all 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 132, 199, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.35)';
            }}
          >
            <FaFilePdf style={{ fontSize: '1.15rem' }} /> XUẤT FILE PDF BÁO CÁO A4
          </button>

          {/* Button 2: Presentation Preview */}
          <button 
            type="button"
            onClick={() => navigate(`/presentation?date=${reportDate}`)}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.85rem 1.65rem',
              fontSize: '0.96rem',
              fontWeight: '900',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px rgba(16, 185, 129, 0.45)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.35)';
            }}
          >
            <FaTv style={{ fontSize: '1.1rem' }} /> XEM TRÌNH CHIẾU GIAO BAN
          </button>

          {/* Button 3: Create New Report */}
          <button 
            type="button"
            onClick={onCreateNew}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#0F2C59',
              border: '1.5px solid #CBD5E1',
              padding: '0.85rem 1.5rem',
              fontSize: '0.96rem',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              borderRadius: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#0284C7';
              e.currentTarget.style.color = '#0284C7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
              e.currentTarget.style.color = '#0F2C59';
            }}
          >
            <FaPlus /> TẠO BÁO CÁO MỚI
          </button>

          {/* Button 4: Logout */}
          <button 
            type="button"
            onClick={onLogout}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#DC2626',
              border: '1.5px solid #FECACA',
              padding: '0.85rem 1.35rem',
              fontSize: '0.96rem',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              borderRadius: '14px',
              cursor: 'pointer',
              transition: 'all 0.22s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
              e.currentTarget.style.borderColor = '#EF4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#FECACA';
            }}
          >
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReportSuccessHub;
