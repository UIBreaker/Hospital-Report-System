import React, { useState, useEffect } from 'react';
import { formatDate } from '../../../utils/medicalFormatters';
import {
  FaHospital, FaAmbulance, FaProcedures, FaHeartbeat,
  FaSkullCrossbones, FaCalendarAlt, FaUsers, FaArrowRight
} from 'react-icons/fa';

// Digital Slot Machine / Rolling Number Component
const RollingNumberCounter = ({ value, duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const target = Number(value) || 0;
    if (target === 0) {
      setDisplayValue(0);
      setIsDone(true);
      return;
    }

    let startTime = null;
    let animId;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 0.72) {
        // High-speed scramble phase
        const maxRand = Math.max(target * 1.5, 99);
        const rand = Math.floor(Math.random() * maxRand);
        setDisplayValue(rand);
      } else if (progress < 1) {
        // Smooth decelerating interpolation phase
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const interpolated = Math.round(easeOut * target);
        setDisplayValue(interpolated);
      } else {
        setDisplayValue(target);
        setIsDone(true);
        return;
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [value, duration]);

  return (
    <span style={{
      fontVariantNumeric: 'tabular-nums',
      display: 'inline-block',
      transition: isDone ? 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
      transform: isDone ? 'scale(1)' : 'scale(1.05)'
    }}>
      {displayValue}
    </span>
  );
};

const TitleSlide = ({ selectedDate, reportsCount = 12, summary = {}, isFullscreen }) => {
  const tongSoKham = summary.tongSoKham || 0;
  const chuyenVien = summary.chuyenVien || 0;
  const phauThuat = summary.phauThuat || 0;
  const benhNang = summary.benhNang !== undefined ? summary.benhNang : (summary.criticalCasesCount || 0);
  const tuVong = summary.tuVong || 0;

  const metricCards = [
    {
      label: 'TỔNG CA KHÁM / TIẾP NHẬN',
      sub: 'Toàn viện trong ngày',
      val: tongSoKham,
      icon: <FaHospital />,
      color: '#1E40AF',
      bg: '#EFF6FF',
      border: '#BFDBFE'
    },
    {
      label: 'CA CHUYỂN VIỆN',
      sub: 'Chuyển tuyến & chuyên khoa',
      val: chuyenVien,
      icon: <FaAmbulance />,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A'
    },
    {
      label: 'CA PHẪU THUẬT / MỔ',
      sub: 'Cấp cứu & Mổ kế hoạch',
      val: phauThuat,
      icon: <FaProcedures />,
      color: '#0284C7',
      bg: '#F0F9FF',
      border: '#BAE6FD'
    },
    {
      label: 'BỆNH NẶNG THEO DÕI',
      sub: 'Hồi sức & Nặng tại khoa',
      val: benhNang,
      icon: <FaHeartbeat />,
      color: '#7C3AED',
      bg: '#FAF5FF',
      border: '#DDD6FE'
    },
    {
      label: 'CA TỬ VONG / NẶNG VỀ',
      sub: 'Hồ sơ tử vong ca trực',
      val: tuVong,
      icon: <FaSkullCrossbones />,
      color: tuVong > 0 ? '#DC2626' : '#64748B',
      bg: tuVong > 0 ? '#FEF2F2' : '#F8FAFC',
      border: tuVong > 0 ? '#FECACA' : '#E2E8F0'
    }
  ];

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      padding: isFullscreen ? '2rem 3rem' : '1.25rem 1.85rem',
      backgroundColor: '#FFFFFF',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      
      {/* 1. Subtle Background Accents */}
      <div 
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '2rem',
          width: '180px',
          height: '120px',
          backgroundImage: 'radial-gradient(#93C5FD 1.5px, transparent 1.5px)',
          backgroundSize: '16px 16px',
          opacity: 0.45,
          pointerEvents: 'none',
          zIndex: 0
        }}
        aria-hidden="true"
      />
      <div style={{ position: 'absolute', top: '12%', left: '5%', fontSize: '1.75rem', fontWeight: '900', color: '#BAE6FD', opacity: 0.5, pointerEvents: 'none' }}>+</div>
      <div style={{ position: 'absolute', top: '35%', left: '3%', fontSize: '2.5rem', fontWeight: '900', color: '#E0F2FE', opacity: 0.7, pointerEvents: 'none' }}>+</div>
      <div style={{ position: 'absolute', top: '25%', right: '4%', fontSize: '2.2rem', fontWeight: '900', color: '#BAE6FD', opacity: 0.5, pointerEvents: 'none' }}>+</div>

      {/* 2. Top Header Agency Badge */}
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        <div 
          className="anim-header-drop"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.45rem 1.45rem',
            borderRadius: '999px',
            backgroundColor: '#EFF6FF',
            border: '1.5px solid #DBEAFE',
            color: '#1E40AF',
            fontWeight: '900',
            fontSize: isFullscreen ? '1.02rem' : '0.86rem',
            marginBottom: isFullscreen ? '0.85rem' : '0.55rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)'
          }}
        >
          <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span>SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT KHU VỰC BÌNH LONG</span>
        </div>

        {/* Main Presentation Title */}
        <h1 
          className="anim-info-pop anim-delay-1"
          style={{
            fontSize: isFullscreen ? '3.1rem' : '2.3rem',
            fontWeight: '900',
            color: '#0F2C59',
            letterSpacing: '-0.5px',
            lineHeight: '1.15',
            margin: '0 0 0.35rem 0',
            textTransform: 'uppercase'
          }}
        >
          BÁO CÁO GIAO BAN CHUYÊN MÔN
        </h1>

        {/* Decorative ECG Heartbeat Pulse Line */}
        <div 
          className="anim-info-pop anim-delay-1"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '320px', margin: '0 auto 0.45rem auto' }}
        >
          <svg viewBox="0 0 300 24" style={{ width: '100%', height: '18px' }} fill="none">
            <path 
              d="M0,12 L110,12 L120,4 L128,20 L136,2 L144,22 L152,8 L160,16 L168,12 L300,12" 
              stroke="#38BDF8" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
        </div>

        {/* Date Display */}
        <div 
          className="anim-info-pop anim-delay-1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: isFullscreen ? '1.35rem' : '1.1rem',
            color: '#D97706',
            fontWeight: '800',
            textTransform: 'capitalize',
            marginBottom: isFullscreen ? '0.85rem' : '0.55rem'
          }}
        >
          <FaCalendarAlt style={{ fontSize: '1rem' }} />
          <span>{formatDate(selectedDate)}</span>
        </div>
      </div>

      {/* 3. 5 Executive Summary Cards Grid with Rolling Numbers */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: isFullscreen ? '1rem' : '0.65rem',
        margin: 'auto 0'
      }}>
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className={`anim-info-pop anim-delay-${idx + 2}`}
            style={{
              backgroundColor: card.bg,
              border: `2px solid ${card.border}`,
              borderTop: `6px solid ${card.color}`,
              borderRadius: '16px',
              padding: isFullscreen ? '1.15rem 0.85rem' : '0.85rem 0.65rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 6px 20px rgba(15, 44, 89, 0.04)',
              minHeight: isFullscreen ? '160px' : '125px',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{
              fontSize: isFullscreen ? '1.5rem' : '1.2rem',
              color: card.color,
              marginBottom: '0.2rem'
            }}>
              {card.icon}
            </div>

            {/* Rolling Number Counter */}
            <div style={{
              fontSize: isFullscreen ? '2.8rem' : '2.1rem',
              fontWeight: '900',
              color: card.color,
              fontFamily: "'Roboto Mono', monospace",
              lineHeight: 1,
              margin: '0.25rem 0'
            }}>
              <RollingNumberCounter value={card.val} duration={1200 + idx * 150} />
            </div>

            <div>
              <div style={{
                fontSize: isFullscreen ? '0.82rem' : '0.72rem',
                fontWeight: '900',
                color: '#0F2C59',
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                lineHeight: 1.2
              }}>
                {card.label}
              </div>
              <div style={{
                fontSize: isFullscreen ? '0.74rem' : '0.65rem',
                color: '#64748B',
                fontWeight: '600',
                marginTop: '2px'
              }}>
                {card.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Attendance & Guidance Bar */}
      <div 
        className="anim-info-pop anim-delay-5"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1.5px solid #E2E8F0',
          paddingTop: '0.75rem',
          fontSize: isFullscreen ? '0.98rem' : '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1E40AF', fontWeight: '800' }}>
          <FaUsers />
          <span>Tổng số 12 khoa phòng • Đã nộp báo cáo: <strong style={{ color: '#10B981' }}>{reportsCount}/12 khoa</strong></span>
        </div>

        <div style={{ color: '#0284C7', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span>Nhấn phím ➔ hoặc Space để bắt đầu báo cáo từng khoa</span>
          <FaArrowRight />
        </div>
      </div>

    </div>
  );
};

export default TitleSlide;
