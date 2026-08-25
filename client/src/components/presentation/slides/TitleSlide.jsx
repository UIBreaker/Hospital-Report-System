import React from 'react';
import { formatDate } from '../../../utils/medicalFormatters';
import {
  FaHospital, FaAmbulance, FaProcedures, FaHeartbeat,
  FaSkullCrossbones, FaCalendarAlt, FaUsers
} from 'react-icons/fa';

const TitleSlide = ({ selectedDate, reportsCount = 12, summary = {}, isFullscreen }) => {
  const tongSoKham = summary.tongSoKham || 0;
  const chuyenVien = summary.chuyenVien || 0;
  const phauThuat = summary.phauThuat || 0;
  const hienCon = summary.hienCon || 0;
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
      val: hienCon,
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
      borderRadius: '20px',
      padding: isFullscreen ? '2rem 2.5rem' : '1.25rem 1.75rem',
      backgroundColor: '#FFFFFF',
      height: '100%',
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
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.45rem 1.45rem',
          borderRadius: '999px',
          backgroundColor: '#EFF6FF',
          border: '1.5px solid #DBEAFE',
          color: '#1E40AF',
          fontWeight: '900',
          fontSize: isFullscreen ? '1.05rem' : '0.88rem',
          marginBottom: isFullscreen ? '0.95rem' : '0.65rem',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)'
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
          <span>SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI • TTYT KHU VỰC BÌNH LONG</span>
        </div>

        {/* Main Presentation Title */}
        <h1 style={{
          fontSize: isFullscreen ? '2.95rem' : '2.2rem',
          fontWeight: '900',
          color: '#0F2C59',
          letterSpacing: '-0.5px',
          lineHeight: '1.15',
          margin: '0 0 0.45rem 0',
          textTransform: 'uppercase'
        }}>
          BÁO CÁO GIAO BAN CHUYÊN MÔN
        </h1>

        {/* Decorative ECG Heartbeat Pulse Line */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '320px', margin: '0 auto 0.45rem auto' }}>
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
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: isFullscreen ? '1.35rem' : '1.1rem',
          color: '#D97706',
          fontWeight: '800',
          textTransform: 'capitalize',
          marginBottom: isFullscreen ? '1rem' : '0.65rem'
        }}>
          <FaCalendarAlt style={{ fontSize: '1rem' }} />
          <span>{formatDate(selectedDate)}</span>
        </div>
      </div>

      {/* 3. 5 Executive Summary Cards Grid (Toàn Bộ Số Liệu Trọng Yếu Trong Ngày) */}
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
              minHeight: isFullscreen ? '175px' : '135px',
              boxSizing: 'border-box'
            }}
          >
            {/* Top: Icon + Label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{
                width: isFullscreen ? '44px' : '36px',
                height: isFullscreen ? '44px' : '36px',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isFullscreen ? '1.25rem' : '1.05rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                flexShrink: 0
              }}>
                {card.icon}
              </div>
              <div style={{
                fontSize: isFullscreen ? '0.86rem' : '0.74rem',
                fontWeight: '900',
                color: card.color,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                lineHeight: 1.2
              }}>
                {card.label}
              </div>
            </div>

            {/* Middle: Big Metric Number Badge */}
            <div style={{ margin: '0.45rem 0' }}>
              <span style={{
                backgroundColor: '#FFFFFF',
                color: card.color,
                border: `2px solid ${card.border}`,
                padding: isFullscreen ? '0.3rem 1.15rem' : '0.2rem 0.85rem',
                borderRadius: '12px',
                fontSize: isFullscreen ? '2.4rem' : '1.85rem',
                fontWeight: '900',
                fontFamily: "'Roboto Mono', monospace",
                display: 'inline-block',
                minWidth: isFullscreen ? '80px' : '64px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                {card.val}
              </span>
            </div>

            {/* Bottom: Subtitle */}
            <div style={{
              fontSize: isFullscreen ? '0.78rem' : '0.68rem',
              fontWeight: '700',
              color: '#64748B',
              lineHeight: 1.15
            }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Bottom Footer Info Pill */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: isFullscreen ? '0.65rem 1.75rem' : '0.45rem 1.25rem',
        backgroundColor: '#F8FAFC',
        border: '1.5px solid #E2E8F0',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '750px',
        marginTop: isFullscreen ? '0.85rem' : '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: isFullscreen ? '0.92rem' : '0.8rem', fontWeight: '800', color: '#1E40AF' }}>
          <FaHospital style={{ color: '#2563EB' }} />
          <span>Báo Cáo: <strong>{reportsCount}/12 Khoa Phòng</strong></span>
        </div>
        <div style={{ width: '1px', height: '18px', backgroundColor: '#CBD5E1' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: isFullscreen ? '0.92rem' : '0.8rem', fontWeight: '800', color: '#065F46' }}>
          <FaUsers style={{ color: '#10B981' }} />
          <span>Chủ Trì: <strong>Hội Đồng Giao Ban & Ban Giám Đốc</strong></span>
        </div>
      </div>

    </div>
  );
};

export default TitleSlide;
