import React from 'react';
import { FaSpinner, FaLock, FaCheckCircle } from 'react-icons/fa';

/**
 * SubmitReportButton - Modern Medical Paper-Plane Aerodynamic Uplink Button
 * Tailored to match the hospital's Emerald-Cyan-SkyBlue brand identity with smooth physics.
 */
const SubmitReportButton = ({
  onClick,
  disabled = false,
  isSubmitting = false,
  isLocked = false,
  text = 'NỘP BÁO CÁO GIAO BAN NGAY',
  submittingText = 'Đang truyền dữ liệu lên cổng...',
  lockedText = 'Báo Cáo Đã Khóa Sổ (Chỉ Đọc)',
  size = 'large', // 'normal' | 'large'
  style = {}
}) => {
  if (isLocked) {
    return (
      <button
        type="button"
        disabled
        style={{
          backgroundColor: '#94A3B8',
          color: '#FFFFFF',
          padding: size === 'large' ? '0.9rem 2.2rem' : '0.65rem 1.4rem',
          fontSize: size === 'large' ? '1rem' : '0.88rem',
          fontWeight: '900',
          borderRadius: '16px',
          cursor: 'not-allowed',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.55rem',
          boxShadow: 'none',
          ...style
        }}
      >
        <FaLock /> {lockedText}
      </button>
    );
  }

  return (
    <div className="submit-paper-plane-wrapper" style={{ display: 'inline-block' }}>
      <style>{`
        .submit-medical-btn {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          font-size: ${size === 'large' ? '1.05rem' : '0.92rem'};
          background: linear-gradient(135deg, #0284C7 0%, #0EA5E9 35%, #059669 100%);
          color: #FFFFFF;
          padding: ${size === 'large' ? '0.88rem 2.4rem 0.88rem 1.8rem' : '0.65rem 1.6rem 0.65rem 1.3rem'};
          display: inline-flex;
          align-items: center;
          justifyContent: center;
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.38), 0 2px 6px rgba(5, 150, 105, 0.25);
          position: relative;
          user-select: none;
          letter-spacing: 0.4px;
          font-weight: 900;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .submit-medical-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0369A1 0%, #0284C7 35%, #10B981 100%);
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 12px 32px rgba(2, 132, 199, 0.5), 0 0 0 3px rgba(56, 189, 248, 0.35);
        }

        .submit-medical-btn:active:not(:disabled) {
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.3);
        }

        .submit-medical-btn:disabled {
          cursor: not-allowed;
          opacity: 0.85;
        }

        .submit-medical-btn .svg-wrapper-1 {
          display: flex;
          align-items: center;
          justifyContent: center;
          margin-right: 0.65rem;
          flex-shrink: 0;
        }

        .submit-medical-btn .svg-wrapper {
          display: flex;
          align-items: center;
          justifyContent: center;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .submit-medical-btn .plane-svg {
          display: block;
          transform-origin: center center;
          transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
        }

        .submit-medical-btn .btn-label {
          display: block;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), letter-spacing 0.3s ease;
          white-space: nowrap;
        }

        .submit-medical-btn:hover:not(:disabled) .svg-wrapper {
          animation: fly-plane-hover 0.7s ease-in-out infinite alternate;
        }

        .submit-medical-btn:hover:not(:disabled) .plane-svg {
          transform: translateX(0.55rem) translateY(-0.15rem) rotate(42deg) scale(1.15);
          filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.6));
        }

        .submit-medical-btn:hover:not(:disabled) .btn-label {
          transform: translateX(0.35rem);
          letter-spacing: 0.6px;
        }

        @keyframes fly-plane-hover {
          from {
            transform: translateY(2px) rotate(-2deg);
          }
          to {
            transform: translateY(-3px) rotate(3deg);
          }
        }

        @keyframes telemetrySpinner {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <button
        type="button"
        className="submit-medical-btn"
        onClick={onClick}
        disabled={disabled || isSubmitting}
        style={style}
      >
        <div className="svg-wrapper-1">
          <div className="svg-wrapper">
            {isSubmitting ? (
              <FaSpinner style={{ fontSize: '1.25rem', animation: 'telemetrySpinner 0.8s linear infinite', color: '#CCFBF1' }} />
            ) : (
              <svg 
                className="plane-svg"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                width={size === 'large' ? 24 : 20} 
                height={size === 'large' ? 24 : 20}
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path fill="currentColor" d="M1.946 9.315c-.522-.174-.527-.455.01-.634l19.087-6.362c.529-.176.832.12.684.638l-5.454 19.086c-.15.529-.455.547-.679.045L12 14l6-8-8 6-8.054-2.685z" />
              </svg>
            )}
          </div>
        </div>
        <span className="btn-label">
          {isSubmitting ? submittingText : text}
        </span>
      </button>
    </div>
  );
};

export default SubmitReportButton;
