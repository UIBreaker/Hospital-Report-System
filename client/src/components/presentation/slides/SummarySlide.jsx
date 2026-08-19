import React from 'react';
import { formatDate } from '../../../utils/medicalFormatters';

const SummarySlide = ({ slide, isFullscreen }) => {
  const { summary = {}, totalDepts = 12, submittedCount = 0, selectedDate = '' } = slide;

  const statCards = [
    { label: 'Tổng số lượt khám', val: summary.tongSoKham || 0, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', icon: '🩺' },
    { label: 'Bệnh cũ đầu ca', val: summary.benhCu || 0, color: '#475569', bg: '#F8FAFC', border: '#E2E8F0', icon: '📋' },
    { label: 'Bệnh mới nhập viện', val: summary.benhMoi || 0, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD', icon: '🏥' },
    { label: 'Bệnh nhân xuất viện', val: summary.xuatVien || 0, color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0', icon: '🚪' },
    { label: 'Tổng ca chuyển viện', val: summary.chuyenVien || 0, color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: '🚑' },
    { label: 'Tổng số ca phẫu thuật', val: summary.phauThuat || 0, color: '#0891B2', bg: '#ECFEFF', border: '#A5F3FC', icon: '🔪' },
    { label: 'Hiện còn toàn viện', val: summary.hienCon || 0, color: '#7C3AED', bg: '#FAF5FF', border: '#DDD6FE', icon: '🛌' },
    { label: 'Hồ sơ tử vong', val: summary.tuVong || 0, color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', icon: '🚨' },
  ];

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', height: '100%',
      justifyContent: 'space-between', gap: isFullscreen ? '1.2rem' : '0.8rem'
    }}>
      {/* Header Bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        paddingBottom: '0.6rem', borderBottom: '2px solid #E2E8F0', flexShrink: 0
      }}>
        <div>
          <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.9rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            TỔNG HỢP TOÀN VIỆN
          </div>
          <h2 style={{ fontSize: isFullscreen ? '2.4rem' : '1.85rem', fontWeight: '900', color: '#0F2C59', margin: '2px 0 0 0' }}>
            BÁO CÁO TỔNG QUAN CA TRỰC BỆNH VIỆN
          </h2>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: isFullscreen ? '1.1rem' : '0.9rem', fontWeight: '800', color: '#D97706' }}>
            {formatDate(selectedDate)}
          </div>
          <div style={{ fontSize: isFullscreen ? '1rem' : '0.85rem', color: '#64748B', fontWeight: '600' }}>
            Đã nộp: <strong style={{ color: '#16A34A' }}>{submittedCount}/{totalDepts}</strong> Khoa phòng
          </div>
        </div>
      </div>

      {/* Grid 8 Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: isFullscreen ? '1.1rem' : '0.75rem', flex: 1, alignItems: 'stretch'
      }}>
        {statCards.map((c, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: c.bg, border: `2px solid ${c.border}`,
              borderLeft: `7px solid ${c.color}`, borderRadius: '14px',
              padding: isFullscreen ? '1.1rem 1.4rem' : '0.8rem 1.1rem',
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 4px 14px rgba(0,0,0,0.04)', transition: 'transform 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: isFullscreen ? '1.25rem' : '1rem', fontWeight: '700', color: '#334155' }}>
                {c.label}
              </span>
              <span style={{ fontSize: isFullscreen ? '1.8rem' : '1.4rem' }}>{c.icon}</span>
            </div>
            <div style={{
              fontSize: isFullscreen ? '3.2rem' : '2.4rem', fontWeight: '900',
              color: c.color, fontFamily: "'Roboto Mono', monospace",
              textAlign: 'right', marginTop: '0.3rem', lineHeight: 1
            }}>
              {c.val}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SummarySlide;
