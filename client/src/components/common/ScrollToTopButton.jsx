import React, { useState, useEffect, useCallback } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    
    // Check internal scrollable containers as well
    let maxInternalScroll = 0;
    const scrollableDivs = document.querySelectorAll('.admin-content, .report-page-container, main, .submissions-container, .dynamic-form-container');
    scrollableDivs.forEach(el => {
      if (el.scrollTop > maxInternalScroll) {
        maxInternalScroll = el.scrollTop;
      }
    });

    const effectiveScroll = Math.max(scrollTop, maxInternalScroll);

    if (effectiveScroll > 280) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
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
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });

    if (document.documentElement) {
      document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (document.body) {
      document.body.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const scrollableDivs = document.querySelectorAll('.admin-content, .report-page-container, main, .submissions-container, .dynamic-form-container, div[style*="overflow"]');
    scrollableDivs.forEach(el => {
      if (el.scrollTop > 0) {
        el.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  };

  // Hide in presentation fullscreen
  if (location.pathname.startsWith('/presentation')) {
    return null;
  }

  // Adjust bottom position so it doesn't overlap with AI assistant on login page
  const isLoginPage = location.pathname === '/' || location.pathname === '/login';
  const bottomPosition = isLoginPage ? '5.6rem' : '1.75rem';

  return (
    <>
      <style>{`
        @keyframes scrollBtnFadeIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .minimal-scroll-top-btn {
          animation: scrollBtnFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          background-color: #FFFFFF;
          color: #2563EB;
          border: 1.5px solid #CBD5E1;
          box-shadow: 0 4px 14px rgba(15, 44, 89, 0.12);
        }
        .minimal-scroll-top-btn:hover {
          background-color: #2563EB !important;
          color: #FFFFFF !important;
          border-color: #1D4ED8 !important;
          transform: translateY(-3px) scale(1.05) !important;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35) !important;
        }
        .minimal-scroll-top-btn:active {
          transform: translateY(0) scale(0.95) !important;
        }
        @media print {
          .minimal-scroll-top-container {
            display: none !important;
          }
        }
      `}</style>

      {isVisible && (
        <div
          className="minimal-scroll-top-container"
          style={{
            position: 'fixed',
            bottom: bottomPosition,
            right: '1.75rem',
            zIndex: 99999,
            pointerEvents: 'auto',
            transition: 'bottom 0.25s ease'
          }}
        >
          <button
            type="button"
            onClick={scrollToTop}
            className="minimal-scroll-top-btn"
            title="Cuộn lên đầu trang"
            aria-label="Cuộn lên đầu trang"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              padding: 0,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <FaArrowUp style={{ fontSize: '0.95rem' }} />
          </button>
        </div>
      )}
    </>
  );
};

export default ScrollToTopButton;
