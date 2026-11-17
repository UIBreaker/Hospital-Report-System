import React, { useMemo, useState } from 'react';
import {
  FaArrowLeft, FaSearch, FaTimes, FaHospital, FaAmbulance,
  FaSkullCrossbones, FaProcedures, FaHeartbeat, FaChevronDown,
  FaFileAlt, FaClipboardList, FaArrowRight
} from 'react-icons/fa';
import './PresentationNavigator.css';

const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const categoryOf = slide => {
  const type = slide.type === 'case_image' ? slide.caseType : (slide.type || '');
  if (type.startsWith('transfer')) return 'transfer';
  if (type.startsWith('death')) return 'death';
  if (type.startsWith('surgery')) return 'surgery';
  if (type.startsWith('critical')) return 'critical';
  return 'general';
};

const CATEGORIES = [
  { key: 'departments', label: 'Khoa phòng', icon: FaHospital },
  { key: 'transfer', label: 'Chuyển viện', icon: FaAmbulance },
  { key: 'death', label: 'Tử vong', icon: FaSkullCrossbones },
  { key: 'surgery', label: 'Phẫu thuật', icon: FaProcedures },
  { key: 'critical', label: 'Bệnh nặng', icon: FaHeartbeat },
  { key: 'all', label: 'Tất cả slide', icon: FaFileAlt }
];

const slideLabel = slide => {
  const category = categoryOf(slide);
  if (category !== 'general') {
    const title = { transfer: 'Ca chuyển viện', death: 'Ca tử vong', surgery: 'Ca phẫu thuật', critical: 'Ca bệnh nặng' }[category];
    const part = slide.type === 'case_image' ? ` · Hình ảnh ${slide.imgIndex || ''}/${slide.totalImages || ''}` : slide.partSubtitle ? ` · ${slide.partSubtitle.toLowerCase()}` : '';
    return `${title} ${slide.caseIndex || ''}${part}`.trim();
  }
  if (slide.type === 'dept_intro') return 'Giới thiệu khoa và ca trực';
  if (slide.type === 'department_overview') return 'Tổng quan 12 khoa';
  if (slide.type === 'summary') return 'Tổng hợp toàn viện';
  if (slide.type === 'title') return 'Mở đầu giao ban';
  if (slide.type === 'closing') return 'Bế mạc';
  if (slide.type === 'case_image') return `Hình ảnh ca bệnh ${slide.caseIndex || ''}`;
  return slide.subTitle || slide.title || 'Số liệu chuyên môn';
};

const SlideRow = ({ item, currentSlide, onJump, activeThumbRef, compact = false }) => {
  const { slide, index } = item;
  const active = index === currentSlide;
  const category = categoryOf(slide);
  const patient = slide.patientName || slide.caseItem?.patientName || slide.caseItem?.patient_name;
  return (
    <button type="button" ref={active ? activeThumbRef : null}
      className={`presentation-nav-slide is-${category}${active ? ' is-active' : ''}${compact ? ' is-compact' : ''}`}
      aria-current={active ? 'step' : undefined}
      onClick={() => onJump(index)}>
      <span className="presentation-nav-number">{String(index + 1).padStart(2, '0')}</span>
      <span className="presentation-nav-slide-copy">
        <strong>{slideLabel(slide)}</strong>
        {!compact && <small>{patient ? `${patient} · ${slide.deptName || 'Khoa chưa rõ'}` : slide.deptName || (slide.type === 'title' || slide.type === 'summary' ? 'Toàn viện' : '')}</small>}
      </span>
      {active ? <span className="presentation-nav-current">Đang chiếu</span> : <FaArrowRight className="presentation-nav-arrow" aria-hidden="true" />}
    </button>
  );
};

const PresentationNavigator = ({ slides, groups, currentSlide, onJump, onClose, onBack, activeThumbRef }) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('departments');
  const [expanded, setExpanded] = useState(() => ({ [slides[currentSlide]?.deptCode]: true }));
  const allItems = useMemo(() => slides.map((slide, index) => ({ slide, index })), [slides]);
  const caseCounts = useMemo(() => Object.fromEntries(CATEGORIES.map(item => [item.key,
    new Set(allItems.filter(entry => categoryOf(entry.slide) === item.key).map(entry => `${entry.slide.deptCode}-${entry.slide.caseIndex}`)).size
  ])), [allItems]);
  const cleanQuery = normalize(query.trim());
  const numberMatch = cleanQuery.match(/^#?(\d+)$/);
  const matches = item => {
    if (!cleanQuery) return true;
    if (numberMatch) return item.index + 1 === Number(numberMatch[1]);
    const slide = item.slide;
    return normalize([
      slideLabel(slide), slide.title, slide.subTitle, slide.deptName,
      slide.patientName, slide.caseItem?.patientName, slide.caseItem?.patient_name,
      slide.caseIndex ? `ca ${slide.caseIndex}` : ''
    ].join(' ')).includes(cleanQuery);
  };
  const results = allItems.filter(item => matches(item) && (cleanQuery || category === 'all' || category === 'departments' || categoryOf(item.slide) === category));
  const showFlatResults = !!cleanQuery || category !== 'departments';
  const jump = index => { onJump(index); onClose(); };

  return (
    <div className="presentation-nav-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <aside className="presentation-nav" role="dialog" aria-modal="true" aria-label="Điều hướng slide giao ban">
        <div className="presentation-nav-header">
          <div className="presentation-nav-brand"><img src="/logo.png" alt="" /><div><strong>Điều hướng giao ban</strong><span>{slides.length} slide · {groups.deptGroups.length} khoa/phòng</span></div></div>
          <button type="button" className="presentation-nav-close" onClick={onClose} aria-label="Đóng danh sách slide"><FaTimes /></button>
        </div>

        <div className="presentation-nav-tools">
          <div className="presentation-nav-position">Đang trình chiếu <strong>Slide {currentSlide + 1}/{slides.length}</strong></div>
          <label className="presentation-nav-search"><FaSearch aria-hidden="true" /><input autoFocus type="search" value={query} onChange={event => setQuery(event.target.value)}
            onKeyDown={event => { if (event.key === 'Enter' && results.length) jump(results[0].index); }}
            placeholder="Tìm khoa, bệnh nhân hoặc #slide…" aria-label="Tìm slide" /></label>
          <div className="presentation-nav-categories" role="group" aria-label="Lọc nhanh slide">
            {CATEGORIES.map(item => <button key={item.key} type="button" aria-pressed={category === item.key && !cleanQuery}
              className={category === item.key && !cleanQuery ? 'is-selected' : ''}
              onClick={() => { setCategory(item.key); setQuery(''); }}>
              <item.icon aria-hidden="true" />{item.label}{['transfer', 'death', 'surgery', 'critical'].includes(item.key) && <small>{caseCounts[item.key]}</small>}
            </button>)}
          </div>
        </div>

        <div className="presentation-nav-content">
          {showFlatResults ? (
            <>
              <div className="presentation-nav-section-title"><strong>{cleanQuery ? 'Kết quả tìm kiếm' : CATEGORIES.find(item => item.key === category)?.label}</strong><span>{results.length} slide</span></div>
              {results.length ? results.map(item => <SlideRow key={item.index} item={item} currentSlide={currentSlide} onJump={jump} activeThumbRef={activeThumbRef} />) : <div className="presentation-nav-empty">Không có slide phù hợp. Thử tên khoa, tên bệnh nhân hoặc số slide.</div>}
            </>
          ) : (
            <>
              <div className="presentation-nav-section-title"><strong>Truy cập nhanh</strong></div>
              <div className="presentation-nav-shortcuts">
                {allItems.filter(item => ['title', 'department_overview', 'summary', 'closing'].includes(item.slide.type)).map(item => <SlideRow key={item.index} item={item} currentSlide={currentSlide} onJump={jump} activeThumbRef={activeThumbRef} compact />)}
              </div>
              <div className="presentation-nav-section-title"><strong>Báo cáo theo khoa</strong><span>{groups.deptGroups.filter(group => group.isSubmitted).length} đã nộp</span></div>
              {groups.deptGroups.map(group => {
                const open = !!expanded[group.code];
                const firstReport = group.slides.find(item => item.slide.type !== 'dept_intro') || group.slides[0];
                return <div key={group.code} className={`presentation-nav-dept${group.hasActiveSlide ? ' is-active' : ''}`}>
                  <div className="presentation-nav-dept-main">
                    <button type="button" className="presentation-nav-dept-jump" disabled={!firstReport} onClick={() => jump(firstReport.index)}
                      title={firstReport ? `Đến báo cáo ${group.name}` : `${group.name} chưa nộp báo cáo`}>
                      <span className="presentation-nav-dept-index">{String(group.orderIdx).padStart(2, '0')}</span>
                      <span className="presentation-nav-dept-icon" aria-hidden="true" style={{ backgroundColor: group.theme?.bg, borderColor: group.theme?.border }}>{group.theme?.icon || '🏥'}</span>
                      <span className="presentation-nav-dept-name"><strong>{group.name}</strong><small>{group.isSubmitted ? `Slide ${firstReport.index + 1} · ${group.slideCount} slide` : 'Chưa nộp báo cáo'}</small></span>
                    </button>
                    {group.isSubmitted && <button type="button" className="presentation-nav-expand" aria-expanded={open} aria-label={`${open ? 'Thu gọn' : 'Xem'} slide ${group.name}`}
                      onClick={() => setExpanded(prev => ({ ...prev, [group.code]: !open }))}><FaChevronDown /></button>}
                  </div>
                  {open && group.isSubmitted && <div className="presentation-nav-dept-slides">{group.slides.map(item => <SlideRow key={item.index} item={item} currentSlide={currentSlide} onJump={jump} activeThumbRef={activeThumbRef} compact />)}</div>}
                </div>;
              })}
            </>
          )}
        </div>

        <div className="presentation-nav-footer"><span>Nhấn Enter sau khi tìm số slide, hoặc chọn trực tiếp một mục.</span><button type="button" onClick={onBack}><FaArrowLeft /> Bảng điều khiển</button></div>
      </aside>
    </div>
  );
};

export default PresentationNavigator;
