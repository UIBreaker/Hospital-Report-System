import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  // Calculate scroll position and progress percentage
  const handleScroll = useCallback(() => {
    // Check window scroll
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Also check possible internal scrollable containers
    let maxInternalScroll = 0;
    const scrollableDivs = document.querySelectorAll('.admin-content, .report-page-container, main, .submissions-container, .dynamic-form-container');
    scrollableDivs.forEach(el => {
      if (el.scrollTop > maxInternalScroll) {
        maxInternalScroll = el.scrollTop;
      }
    });

    const effectiveScroll = Math.max(scrollTop, maxInternalScroll);

    // Show button when scrolled past 260px
    if (effectiveScroll > 260) {
      setIsVisible(true);
      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, Math.round((scrollTop / scrollHeight) * 100)));
        setScrollProgress(progress);
      }
    } else {
      setIsVisible(false);
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [handleScroll]);

  // Reset on route change
  useEffect(() => {
    setIsVisible(false);
    setScrollProgress(0);
  }, [location.pathname]);

  const scrollToTop = () => {
    // 1. Smooth scroll window
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    // 2. Smooth scroll root elements
    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // 3. Smooth scroll any internal scrollable containers
    const scrollableDivs = document.querySelectorAll('.admin-content, .report-page-container, main, .submissions-container, .dynamic-form-container, div[style*="overflow"]');
    scrollableDivs.forEach(el => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // Hide in presentation fullscreen if needed, but show on all regular pages
  if (location.pathname.startsWith('/presentation')) {
    return null;
  }

  // Position adjustments: if on login page, place slightly higher to not clash with AI Assistant
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const bottomPosition = isLoginPage ? '5.8rem' : '2rem';

  return (
    <>
      <style>{`
        @keyframes scrollToTopFadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.85);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .scroll-to-top-btn {
          animation: scrollToTopFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scroll-to-top-btn:hover .scroll-icon {
          transform: translateY(-3px);
        }
        @media print {
          .scroll-to-top-container {
            display: none !important;
          }
        }
      `}</style>

      {isVisible && (
        <div
          className="scroll-to-top-container"
          style={{
            position: 'fixed',
            bottom: bottomPosition,
            right: '2rem',
            zIndex: 99999,
            pointerEvents: 'auto',
            transition: 'bottom 0.3s ease'
          }}
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="scroll-to-top-btn"
            title="Cuộn lên đầu trang (Scroll to top)"
            aria-label="Cuộn lên đầu trang"
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: '#0F2C59',
              background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 60%, #0284C7 100%)',
              color: '#FFFFFF',
              border: '2px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 8px 26px rgba(15, 44, 89, 0.45)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              padding: 0,
              outline: 'none',
              transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease, background 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.08)';
              e.currentTarget.style.boxShadow = '0 14px 34px rgba(37, 99, 235, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 26px rgba(15, 44, 89, 0.45)';
            }}
          >
            {/* SVG Circular Progress Ring */}
            {scrollProgress > 0 && (
              <svg
                style={{
                  position: 'absolute',
                  top: '-3px',
                  left: '-3px',
                  width: '54px',
                  height: '54px',
                  transform: 'rotate(-90deg)',
                  pointerEvents: 'none'
                }}
              >
                <circle
                  cx="27"
                  cy="27"
                  r="24"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2.5"
                  fill="transparent"
                />
                <circle
                  cx="27"
                  cy="27"
                  r="24"
                  stroke="#38BDF8"
                  strokeWidth="2.5"
                  fill="transparent"
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 - (150.8 * scrollProgress) / 100}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.15s ease' }}
                />
              </svg>
            )}

            {/* Icon and label */}
            <FaChevronUp
              className="scroll-icon"
              style={{
                fontSize: '1.05rem',
                color: '#FFFFFF',
                filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                transition: 'transform 0.2s ease'
              }}
            />
            <span style={{
              fontSize: '0.54rem',
              fontWeight: '900',
              color: '#93C5FD',
              letterSpacing: '0.4px',
              marginTop: '1px',
              textTransform: 'uppercase',
              lineHeight: 1
            }}>
              Lên đầu
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
