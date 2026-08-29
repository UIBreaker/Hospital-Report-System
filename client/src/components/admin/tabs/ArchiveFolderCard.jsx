import React, { useState } from 'react';
import { FaFolderOpen, FaArrowRight, FaCalendarAlt, FaProcedures } from 'react-icons/fa';
import './archiveFolder.css';

const THEME_PALETTES = {
  blue: {
    back: '#0056b3',
    front: 'rgba(0, 123, 255, 0.72)',
    accent: '#0284C7'
  },
  emerald: {
    back: '#065F46',
    front: 'rgba(5, 150, 105, 0.75)',
    accent: '#10B981'
  },
  purple: {
    back: '#4C1D95',
    front: 'rgba(124, 58, 237, 0.75)',
    accent: '#8B5CF6'
  },
  amber: {
    back: '#78350F',
    front: 'rgba(217, 119, 6, 0.75)',
    accent: '#F59E0B'
  }
};

const ArchiveFolderCard = ({
  id,
  type = 'year', // 'year' | 'month' | 'day'
  title = '',
  subTitle = '',
  counterNumber = '05',
  counterLabel = 'FILES',
  colorTheme = 'blue',
  stats = null,
  files = null,
  onOpen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = THEME_PALETTES[colorTheme] || THEME_PALETTES.blue;

  const defaultFiles = [
    { name: '01_BaoCao_A4.html', tag: 'A4 • 85 KB', class: 'file-1' },
    { name: '02_SoLieu_Excel.xlsx', tag: 'XLSX • 120 KB', class: 'file-2' },
    { name: '03_LamSang_CLS.html', tag: 'HTML • 45 KB', class: 'file-3' },
    { name: '04_HinhAnh_XQuang.jpg', tag: 'JPG • 2.4 MB', class: 'file-4' },
    { name: '05_CanBoTruc.html', tag: 'DOC • 18 KB', class: 'file-5' },
  ];

  const displayFiles = files || defaultFiles;

  const handleCardClick = (e) => {
    // If clicking directly, trigger onOpen callback
    if (onOpen) onOpen();
  };

  return (
    <div className="archive-folder-wrapper">
      <label className="folder-card" onClick={handleCardClick}>
        <input
          type="checkbox"
          className="folder-toggle"
          checked={isOpen}
          onChange={(e) => setIsOpen(e.target.checked)}
        />

        {/* Hint Arrow */}
        <div className="hint-wrapper">
          <span className="hint-text">Nhấn để mở ➔</span>
          <svg className="hint-arrow" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 35 5 C 35 5, 15 5, 10 25 M 10 25 L 3 18 M 10 25 L 18 22" stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* 3D Folder Container */}
        <div className="folder-container">
          {/* Back Cover */}
          <svg className="folder-back" viewBox="0 0 50 40" fill="none">
            <path d="M0 4C0 1.79086 1.79086 0 4 0H16.524C17.721 0 18.8415 0.54051 19.574 1.4673L22.426 5.0654C23.1585 5.99219 24.279 6.5327 25.476 6.5327H46C48.2091 6.5327 50 8.32356 50 10.5327V36C50 38.2091 48.2091 40 46 40H4C1.79086 40 0 38.2091 0 36V4Z" fill={theme.back} />
          </svg>

          {/* 5 Animated Flying Files */}
          {displayFiles.slice(0, 5).map((f, fIdx) => (
            <div key={fIdx} className={`file ${f.class || `file-${fIdx + 1}`}`}>
              <div className="shine" />
              <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1={16} y1={13} x2={8} y2={13} />
                <line x1={16} y1={17} x2={8} y2={17} />
              </svg>
              <div className="file-text">{f.name}</div>
              <div className="file-tag">{f.tag}</div>
            </div>
          ))}

          {/* Front Cover with Frosted Glass Look */}
          <div className="folder-front-wrapper">
            <svg className="folder-front" viewBox="0 0 50 34" fill="none">
              <path d="M0 4C0 1.79086 1.79086 0 4 0H46C48.2091 0 50 1.79086 50 4V30C50 32.2091 48.2091 34 46 34H4C1.79086 34 0 32.2091 0 30V4Z" fill={theme.front} />
            </svg>
            <div className="folder-label" />

            {/* Glowing Counter Badge */}
            <div className="counter">
              <div className="status-dot" />
              <span className="counter-label">{counterLabel}</span>
              <span className="counter-number">{counterNumber}</span>
            </div>
          </div>
        </div>
      </label>

      {/* Metadata Bar */}
      <div className="folder-meta">
        <div className="folder-title-row">
          <div className="folder-main-title">{title}</div>
          <span style={{ fontSize: '0.72rem', background: '#EFF6FF', color: '#1E40AF', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>
            {subTitle}
          </span>
        </div>

        {stats && (
          <div className="folder-stats-grid">
            {stats.days !== undefined && (
              <div>
                <span style={{ color: '#64748B' }}>Số ca trực: </span>
                <strong style={{ color: '#0F2C59' }}>{stats.days} ngày</strong>
              </div>
            )}
            {stats.cases !== undefined && (
              <div>
                <span style={{ color: '#64748B' }}>Ca đặc biệt: </span>
                <strong style={{ color: '#059669' }}>{stats.cases} ca</strong>
              </div>
            )}
            {stats.submittedCount !== undefined && (
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: '#64748B' }}>Tiến độ nộp: </span>
                <strong style={{ color: stats.isFullySubmitted ? '#059669' : '#D97706' }}>{stats.submittedCount}/12 Khoa</strong>
              </div>
            )}
            {stats.surgeries !== undefined && (
              <div>
                <span style={{ color: '#64748B' }}>Phẫu thuật: </span>
                <strong style={{ color: '#0284C7' }}>{stats.surgeries} ca</strong>
              </div>
            )}
            {stats.transfers !== undefined && (
              <div>
                <span style={{ color: '#64748B' }}>Chuyển viện: </span>
                <strong style={{ color: '#D97706' }}>{stats.transfers} ca</strong>
              </div>
            )}
          </div>
        )}

        <button type="button" className="folder-btn-open" onClick={onOpen}>
          <FaFolderOpen /> Mở Thư Mục <FaArrowRight style={{ fontSize: '0.7rem' }} />
        </button>
      </div>
    </div>
  );
};

export default ArchiveFolderCard;
