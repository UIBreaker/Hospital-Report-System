import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaRocket, 
  FaTv, 
  FaWpforms, 
  FaRobot, 
  FaShieldAlt, 
  FaCheckCircle, 
  FaStar, 
  FaCodeBranch, 
  FaCalendarAlt, 
  FaUserTie,
  FaMicrophoneAlt,
  FaChartLine,
  FaFilePdf,
  FaHeartbeat,
  FaBullhorn,
  FaMagic,
  FaBolt
} from 'react-icons/fa';
import changelogService, { DEFAULT_V2_CHANGELOG } from '../../services/changelogService';

const ICON_MAP = {
  FaMicrophoneAlt: <FaMicrophoneAlt />,
  FaTv: <FaTv />,
  FaChartLine: <FaChartLine />,
  FaWpforms: <FaWpforms />,
  FaFilePdf: <FaFilePdf />,
  FaShieldAlt: <FaShieldAlt />,
  FaRocket: <FaRocket />,
  FaRobot: <FaRobot />,
  FaHeartbeat: <FaHeartbeat />,
  FaBullhorn: <FaBullhorn />,
  FaMagic: <FaMagic />
};

const VersionChangelogModal = ({ isOpen, onClose, customChangelog }) => {
  const [changelog, setChangelog] = useState(customChangelog || DEFAULT_V2_CHANGELOG);

  useEffect(() => {
    if (customChangelog) {
      setChangelog(customChangelog);
      return;
    }
    let isMounted = true;
    changelogService.getLatestChangelog().then(data => {
      if (isMounted && data) {
        setChangelog(data);
      }
    });
    return () => { isMounted = false; };
  }, [isOpen, customChangelog]);

  if (!isOpen) return null;

  const sections = Array.isArray(changelog.sections) && changelog.sections.length > 0
    ? changelog.sections
    : DEFAULT_V2_CHANGELOG.sections;

  const isMajor = changelog.is_major !== false;

  return (
    <div 
      className="version-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '660px',
          maxHeight: '92vh',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(15, 44, 89, 0.4)',
          border: '1.5px solid rgba(186, 230, 253, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        }}
      >
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleUp {
            from { transform: scale(0.92) translateY(12px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          background: isMajor
            ? 'linear-gradient(135deg, #0284C7 0%, #0F2C59 60%, #0369A1 100%)'
            : 'linear-gradient(135deg, #334155 0%, #1E293B 60%, #0F172A 100%)',
          padding: '1.2rem 1.6rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.35rem',
              color: isMajor ? '#FEF08A' : '#94A3B8',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              {isMajor ? <FaRocket /> : <FaCodeBranch />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: '900', letterSpacing: '0.3px' }}>
                  {changelog.title || `NHẬT KÝ PHIÊN BẢN v${changelog.version || '2.0.0'}`}
                </span>
                <span style={{
                  backgroundColor: isMajor ? '#FEF08A' : '#E2E8F0',
                  color: isMajor ? '#854D0E' : '#334155',
                  fontSize: '0.7rem',
                  fontWeight: '900',
                  padding: '0.15rem 0.6rem',
                  borderRadius: '999px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)'
                }}>
                  {isMajor ? '✨ BẢN CẬP NHẬT LỚN' : '🛠️ BẢN VÁ HỆ THỐNG'}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#E0F2FE', marginTop: '2px', opacity: 0.95 }}>
                Hệ Thống Báo Cáo Giao Ban Trực Tuyến — TTYT Khu Vực Bình Long
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.35)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.18)'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Info Meta Bar */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.65rem 1.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.78rem',
          color: '#475569',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaCalendarAlt style={{ color: '#0284C7' }} />
            <span>Phát hành: <strong>{changelog.release_date || 'Tháng 08/2026'}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FaUserTie style={{ color: '#059669' }} />
            <span>Tác giả: <strong style={{ color: '#0F2C59' }}>{changelog.author || 'Nguyễn Vũ Nhật Nam (Phòng KHNV)'}</strong></span>
          </div>
        </div>

        {/* Scrollable Changelog Content */}
        <div style={{
          padding: '1.2rem 1.6rem',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {changelog.summary && (
            <div style={{
              background: isMajor
                ? 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)'
                : 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
              border: `1.5px solid ${isMajor ? '#BAE6FD' : '#E2E8F0'}`,
              borderRadius: '16px',
              padding: '0.85rem 1.1rem',
              fontSize: '0.82rem',
              color: isMajor ? '#0369A1' : '#334155',
              lineHeight: 1.55,
              fontWeight: '600'
            }}>
              {isMajor ? '🎉' : '📌'} {changelog.summary}
            </div>
          )}

          {sections.map((sec, idx) => {
            const iconElement = (sec.iconName && ICON_MAP[sec.iconName])
              ? React.cloneElement(ICON_MAP[sec.iconName], { style: { color: sec.iconColor || '#0284C7' } })
              : (sec.icon || <FaRocket style={{ color: sec.iconColor || '#0284C7' }} />);

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: sec.bg || '#F8FAFC',
                  border: `1.5px solid ${sec.border || '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1rem 1.15rem',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                    <div style={{ fontSize: '1.1rem' }}>{iconElement}</div>
                    <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: '900', color: '#0F2C59' }}>
                      {sec.title}
                    </h4>
                  </div>
                  {sec.badge && (
                    <span style={{
                      backgroundColor: sec.badgeBg || '#0284C7',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: '800',
                      padding: '0.15rem 0.55rem',
                      borderRadius: '999px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.3px'
                    }}>
                      {sec.badge}
                    </span>
                  )}
                </div>

                <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#334155', fontSize: '0.82rem', lineHeight: '1.55' }}>
                  {Array.isArray(sec.items) && sec.items.map((item, iIdx) => (
                    <li key={iIdx} style={{ marginBottom: iIdx < sec.items.length - 1 ? '0.35rem' : 0 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '0.85rem 1.6rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '0.76rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FaCheckCircle style={{ color: '#10B981' }} />
            <span>Hệ thống hoạt động ổn định 24/7</span>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.45rem',
              background: isMajor
                ? 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)'
                : 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '800',
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: isMajor ? '0 3px 12px rgba(2, 132, 199, 0.35)' : '0 3px 10px rgba(51, 65, 85, 0.25)',
              transition: 'transform 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Đã hiểu & Đóng
          </button>
        </div>

      </div>
    </div>
  );
};

export default VersionChangelogModal;
