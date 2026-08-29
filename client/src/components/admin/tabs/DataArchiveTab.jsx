import React, { useState, useEffect } from 'react';
import { 
  FaFolder, 
  FaFolderOpen, 
  FaCalendarAlt, 
  FaFileArchive, 
  FaDownload, 
  FaEnvelope, 
  FaSearch, 
  FaArrowLeft, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaAmbulance, 
  FaUserMd, 
  FaImage, 
  FaWpforms, 
  FaSpinner, 
  FaEye, 
  FaClock, 
  FaChevronRight,
  FaFileAlt,
  FaShareAlt,
  FaSync
} from 'react-icons/fa';
import dataArchiveService from '../../../services/dataArchiveService';
import CountUpNumber from '../../common/CountUpNumber';
import ImageLightboxModal from '../../common/ImageLightboxModal';

const DataArchiveTab = ({ onOpenPresentation, onOpenPrintView, onOpenReportDetail }) => {
  // Navigation State: 'years' | 'months' | 'days' | 'day_details'
  const [currentLevel, setCurrentLevel] = useState('years');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Data State
  const [treeData, setTreeData] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);
  const [dayDetails, setDayDetails] = useState(null);
  const [loadingDay, setLoadingDay] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Zip Packaging Progress State
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgressText, setZipProgressText] = useState('');
  const [zipProgressPct, setZipProgressPct] = useState(0);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(() => localStorage.getItem('last_archive_email') || 'khnv.bvbinhlong@gmail.com');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailNotes, setEmailNotes] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);

  // Lightbox State
  const [lightboxData, setLightboxData] = useState({ isOpen: false, images: [], startIndex: 0 });

  useEffect(() => {
    loadTree();
  }, []);

  const loadTree = async () => {
    try {
      setLoadingTree(true);
      const res = await dataArchiveService.getArchiveTree();
      if (res?.success && Array.isArray(res.data)) {
        setTreeData(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải cây thư mục:', err);
    } finally {
      setLoadingTree(false);
    }
  };

  const handleSelectYear = (yearObj) => {
    setSelectedYear(yearObj);
    setCurrentLevel('months');
  };

  const handleSelectMonth = (monthObj) => {
    setSelectedMonth(monthObj);
    setCurrentLevel('days');
  };

  const handleSelectDay = async (dayObj) => {
    setSelectedDay(dayObj);
    setCurrentLevel('day_details');
    try {
      setLoadingDay(true);
      const res = await dataArchiveService.getArchiveDayDetails(dayObj.date);
      if (res?.success && res.data) {
        setDayDetails(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết ca trực:', err);
    } finally {
      setLoadingDay(false);
    }
  };

  const handleGoBack = () => {
    if (currentLevel === 'day_details') {
      setCurrentLevel('days');
      setDayDetails(null);
    } else if (currentLevel === 'days') {
      setCurrentLevel('months');
      setSelectedMonth(null);
    } else if (currentLevel === 'months') {
      setCurrentLevel('years');
      setSelectedYear(null);
    }
  };

  // Method 1: Client-Side Instant ZIP Download
  const handleDownloadZip = async () => {
    if (!dayDetails || !selectedDay) return;
    try {
      setIsZipping(true);
      setZipProgressText('Đang khởi tạo gói nén ZIP...');
      setZipProgressPct(5);

      await dataArchiveService.generateAndDownloadShiftZip(
        selectedDay.date,
        dayDetails,
        (text, pct) => {
          setZipProgressText(text);
          setZipProgressPct(pct);
        }
      );
    } catch (err) {
      console.error('Lỗi nén ZIP:', err);
      alert('Không thể tạo file ZIP. Vui lòng thử lại.');
    } finally {
      setTimeout(() => {
        setIsZipping(false);
        setZipProgressPct(0);
      }, 800);
    }
  };

  // Method 2: Send directly to another computer via Email
  const handleOpenEmailModal = () => {
    if (!selectedDay) return;
    setEmailSubject(`[TTYT BÌNH LONG] Báo Cáo Giao Ban Trực Toàn Viện - Ngày ${selectedDay.date}`);
    setShowEmailModal(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Vui lòng nhập địa chỉ Email hợp lệ.');
      return;
    }

    try {
      setSendingEmail(true);
      localStorage.setItem('last_archive_email', recipientEmail.trim());

      const payload = {
        date: selectedDay.date,
        recipientEmail: recipientEmail.trim(),
        subject: emailSubject.trim(),
        notes: emailNotes.trim(),
        shiftSummary: {
          submittedCount: `${dayDetails?.reports?.length || 0}/12`,
          transfers: dayDetails?.transferCases?.length || 0,
          surgeries: dayDetails?.surgeryCases?.length || 0,
          deaths: dayDetails?.deathCases?.length || 0,
          criticals: dayDetails?.criticalCases?.length || 0
        }
      };

      const res = await dataArchiveService.sendArchiveEmail(payload);
      if (res?.success) {
        alert(`🎉 ${res.message}`);
        setShowEmailModal(false);
        setEmailNotes('');
      } else {
        alert(res?.error || 'Không thể gửi Email.');
      }
    } catch (err) {
      console.error('Lỗi gửi email:', err);
      alert('Lỗi máy chủ khi gửi Email.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
        color: '#FFFFFF',
        borderRadius: '16px',
        padding: '1.3rem 1.6rem',
        boxShadow: '0 8px 25px rgba(15, 44, 89, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: '#38BDF8'
            }}>
              <FaFolderOpen />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', letterSpacing: '0.4px' }}>
                TỔNG HỢP DỮ LIỆU DỰ ÁN & HỒ SƠ LƯU TRỮ
              </h2>
              <p style={{ margin: '3px 0 0 0', fontSize: '0.8rem', color: '#93C5FD' }}>
                Quản lý kho lưu trữ báo cáo giao ban theo cây thư mục Năm ➔ Tháng ➔ Ngày, đóng gói ZIP và gửi lưu trữ
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={loadTree}
          style={{
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            color: '#FFFFFF',
            borderRadius: '9px',
            padding: '0.45rem 0.9rem',
            fontWeight: '800',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FaSync className={loadingTree ? 'spinner' : ''} /> Làm Mới Kho
        </button>
      </div>

      {/* Breadcrumb Navigation Bar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #CBD5E1',
        borderRadius: '12px',
        padding: '0.65rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.6rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.86rem', fontWeight: '800', color: '#0F2C59' }}>
          {currentLevel !== 'years' && (
            <button
              onClick={handleGoBack}
              style={{
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#1E40AF',
                borderRadius: '7px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.78rem',
                fontWeight: '800',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                marginRight: '0.4rem'
              }}
            >
              <FaArrowLeft /> Quay Lại
            </button>
          )}

          <span 
            onClick={() => { setCurrentLevel('years'); setSelectedYear(null); setSelectedMonth(null); setSelectedDay(null); }}
            style={{ cursor: 'pointer', color: currentLevel === 'years' ? '#0F2C59' : '#0284C7', textDecoration: currentLevel === 'years' ? 'none' : 'underline' }}
          >
            📁 Kho Lưu Trữ
          </span>

          {selectedYear && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span
                onClick={() => { setCurrentLevel('months'); setSelectedMonth(null); setSelectedDay(null); }}
                style={{ cursor: 'pointer', color: currentLevel === 'months' ? '#0F2C59' : '#0284C7', textDecoration: currentLevel === 'months' ? 'none' : 'underline' }}
              >
                {selectedYear.label}
              </span>
            </>
          )}

          {selectedMonth && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span
                onClick={() => { setCurrentLevel('days'); setSelectedDay(null); }}
                style={{ cursor: 'pointer', color: currentLevel === 'days' ? '#0F2C59' : '#0284C7', textDecoration: currentLevel === 'days' ? 'none' : 'underline' }}
              >
                {selectedMonth.label}
              </span>
            </>
          )}

          {selectedDay && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span style={{ color: '#0F2C59', fontWeight: '900' }}>
                {selectedDay.label}
              </span>
            </>
          )}
        </div>

        {/* Global Search in Month or Day */}
        <div style={{ position: 'relative', width: '240px' }}>
          <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.8rem' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm ngày, ca bệnh, khoa..."
            style={{
              width: '100%',
              padding: '0.38rem 0.75rem 0.38rem 2rem',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '0.8rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      {/* LEVEL 1: YEARS GRID */}
      {currentLevel === 'years' && (
        <div>
          {loadingTree ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <FaSpinner className="spinner" style={{ fontSize: '1.8rem', color: '#0284C7', marginBottom: '0.5rem' }} />
              <div>Đang tải cây thư mục lưu trữ bệnh viện...</div>
            </div>
          ) : treeData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', color: '#94A3B8' }}>
              <FaFolderOpen style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '0.5rem' }} />
              <div>Chưa có dữ liệu báo cáo nào được ghi nhận trong kho lưu trữ.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {treeData.map(y => (
                <div
                  key={y.year}
                  onClick={() => handleSelectYear(y)}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '1.2rem',
                    cursor: 'pointer',
                    transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.borderColor = '#0284C7';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 132, 199, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      border: '1.5px solid #BFDBFE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.4rem',
                      color: '#0284C7'
                    }}>
                      📁
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                        Năm {y.year}
                      </h3>
                      <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                        {y.months?.length || 0} tháng có báo cáo giao ban
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', backgroundColor: '#F8FAFC', padding: '0.65rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem' }}>
                    <div>
                      <span style={{ color: '#64748B' }}>Số ca trực:</span>
                      <strong style={{ display: 'block', color: '#0F2C59', fontSize: '0.95rem' }}><CountUpNumber end={y.totalDays} /> ngày</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B' }}>Tổng ca bệnh:</span>
                      <strong style={{ display: 'block', color: '#0284C7', fontSize: '0.95rem' }}><CountUpNumber end={y.totalCases} /> ca</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* LEVEL 2: MONTHS GRID */}
      {currentLevel === 'months' && selectedYear && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {selectedYear.months?.map(m => (
            <div
              key={m.month}
              onClick={() => handleSelectMonth(m)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.15rem',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#0284C7';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 132, 199, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem',
                  color: '#059669'
                }}>
                  📂
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', color: '#0F2C59' }}>
                    Tháng {m.month} / {m.year}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                    {m.days?.length || 0} ngày ca trực đã lưu
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', padding: '0.6rem 0.8rem', borderRadius: '10px', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng ca đặc biệt:</span>
                <strong style={{ color: '#059669', fontSize: '0.9rem' }}>{m.totalCases} ca</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 3: DAYS GRID */}
      {currentLevel === 'days' && selectedMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {selectedMonth.days?.filter(d => !searchTerm || d.date.includes(searchTerm) || d.label.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
            <div
              key={d.date}
              onClick={() => handleSelectDay(d)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '2px solid #E2E8F0',
                borderRadius: '16px',
                padding: '1.15rem',
                cursor: 'pointer',
                transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#0284C7';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(2, 132, 199, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#E2E8F0';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.03)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FaCalendarAlt style={{ color: '#0284C7', fontSize: '1.1rem' }} />
                  <span style={{ fontWeight: '900', color: '#0F2C59', fontSize: '1rem' }}>
                    {d.label}
                  </span>
                </div>
                <span style={{
                  backgroundColor: d.isFullySubmitted ? '#DCFCE7' : '#FEF3C7',
                  color: d.isFullySubmitted ? '#166534' : '#92400E',
                  fontSize: '0.7rem',
                  fontWeight: '900',
                  padding: '2px 8px',
                  borderRadius: '999px'
                }}>
                  {d.submittedCount}/12 Khoa
                </span>
              </div>

              {/* Case Stats Chips */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', fontSize: '0.72rem' }}>
                <span style={{ backgroundColor: '#EFF6FF', color: '#1E40AF', padding: '2px 7px', borderRadius: '6px', fontWeight: '700' }}>
                  🔪 {d.stats?.surgeries || 0} mổ
                </span>
                <span style={{ backgroundColor: '#FFFBEB', color: '#92400E', padding: '2px 7px', borderRadius: '6px', fontWeight: '700' }}>
                  🚑 {d.stats?.transfers || 0} chuyển
                </span>
                <span style={{ backgroundColor: '#FEF2F2', color: '#991B1B', padding: '2px 7px', borderRadius: '6px', fontWeight: '700' }}>
                  ⚠️ {d.stats?.deaths || 0} tử vong
                </span>
                <span style={{ backgroundColor: '#FAF5FF', color: '#6B21A8', padding: '2px 7px', borderRadius: '6px', fontWeight: '700' }}>
                  🏥 {d.stats?.criticals || 0} nặng
                </span>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#0284C7', fontWeight: '800' }}>
                <span>📦 Mở trọn bộ hồ sơ ➔</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEVEL 4: THE COMPLETE DAILY SHIFT HUB */}
      {currentLevel === 'day_details' && selectedDay && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {/* Daily Hero Action Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '2px solid #BAE6FD',
            borderRadius: '16px',
            padding: '1.3rem 1.6rem',
            boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.2rem'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59' }}>
                  HỒ SƠ CA TRỰC NGÀY {selectedDay.date}
                </span>
                <span style={{
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  fontSize: '0.76rem',
                  fontWeight: '900',
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}>
                  {dayDetails?.reports?.length || 0}/12 Khoa Đã Nộp
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                Tổng hợp: {dayDetails?.surgeryCases?.length || 0} ca phẫu thuật • {dayDetails?.transferCases?.length || 0} ca chuyển viện • {dayDetails?.imagesList?.length || 0} ảnh lâm sàng
              </div>
            </div>

            {/* The 2 Core Action Buttons requested by User */}
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {/* Method 1: Download ZIP directly */}
              <button
                onClick={handleDownloadZip}
                disabled={isZipping || loadingDay}
                style={{
                  padding: '0.6rem 1.25rem',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '900',
                  fontSize: '0.86rem',
                  cursor: (isZipping || loadingDay) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.35)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {isZipping ? <><FaSpinner className="spinner" /> {zipProgressText || 'Đang nén...'}</> : <><FaFileArchive /> 📦 Tải File ZIP Trọn Gói Về Máy</>}
              </button>

              {/* Method 2: Send directly to another computer via Email */}
              <button
                onClick={handleOpenEmailModal}
                disabled={loadingDay}
                style={{
                  padding: '0.6rem 1.15rem',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: '800',
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}
              >
                <FaEnvelope /> 📧 Gửi Sang Máy Khác (Email)
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {loadingDay ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748B' }}>
              <FaSpinner className="spinner" style={{ fontSize: '1.8rem', color: '#0284C7', marginBottom: '0.5rem' }} />
              <div>Đang giải nén và tải dữ liệu chi tiết ca trực...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              
              {/* Category 1: Báo Cáo 12 Khoa */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <FaFileAlt style={{ color: '#0284C7' }} /> 1. BÁO CÁO CHUYÊN MÔN 12 KHOA PHÒNG ({dayDetails?.reports?.length || 0})
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                  {(dayDetails?.reports || []).map(r => (
                    <div
                      key={r.id}
                      onClick={() => onOpenReportDetail && onOpenReportDetail(r)}
                      style={{
                        padding: '0.75rem 0.95rem',
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>
                        {r.department_name || r.department_code}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '2px' }}>
                        BS: <strong>{r.doctor_name || '—'}</strong> | ĐD: {r.nurse_name || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category 2: Hình ảnh lâm sàng */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaImage style={{ color: '#7C3AED' }} /> 2. BỘ SƯU TẬP HÌNH ẢNH LÂM SÀNG & CẬN LÂM SÀNG ({dayDetails?.imagesList?.length || 0})
                </h3>

                {(!dayDetails?.imagesList || dayDetails.imagesList.length === 0) ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Không có hình ảnh lâm sàng nào được tải lên trong ca trực này.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                    {dayDetails.imagesList.map((img, iIdx) => (
                      <div
                        key={iIdx}
                        onClick={() => setLightboxData({ isOpen: true, images: dayDetails.imagesList.map(item => item.url), startIndex: iIdx })}
                        style={{
                          borderRadius: '10px',
                          overflow: 'hidden',
                          border: '1.5px solid #CBD5E1',
                          cursor: 'pointer',
                          backgroundColor: '#0F172A',
                          aspectRatio: '1',
                          position: 'relative'
                        }}
                      >
                        <img src={img.url} alt={img.caption} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, insetInline: 0, backgroundColor: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '0.64rem', padding: '2px 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {img.patientName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category 3: Cán bộ trực & tăng cường */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaUserMd style={{ color: '#059669' }} /> 3. DANH SÁCH CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ ({dayDetails?.overtimeStaffList?.length || 0})
                </h3>

                {(!dayDetails?.overtimeStaffList || dayDetails.overtimeStaffList.length === 0) ? (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Không có ghi nhận nhân sự tăng cường thêm giờ.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.65rem' }}>
                    {dayDetails.overtimeStaffList.map((st, sIdx) => (
                      <div key={sIdx} style={{ padding: '0.65rem 0.85rem', backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', fontSize: '0.78rem' }}>
                        <strong style={{ color: '#065F46' }}>{st.staffName}</strong> ({st.time || 'Ca trực'}) - Khoa: {st.departmentName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category 4: Ca bệnh đặc biệt */}
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #CBD5E1', padding: '1.2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <h3 style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <FaAmbulance style={{ color: '#D97706' }} /> 4. CÁC CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                  <div style={{ padding: '0.85rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: '800' }}>CA PHẪU THUẬT</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F2C59', marginTop: '2px' }}>{dayDetails?.surgeryCases?.length || 0}</div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '800' }}>CA CHUYỂN VIỆN</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>{dayDetails?.transferCases?.length || 0}</div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: '800' }}>CA TỬ VONG</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#DC2626', marginTop: '2px' }}>{dayDetails?.deathCases?.length || 0}</div>
                  </div>
                  <div style={{ padding: '0.85rem', backgroundColor: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: '800' }}>BỆNH NHÂN NẶNG</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7C3AED', marginTop: '2px' }}>{dayDetails?.criticalCases?.length || 0}</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Method 2 Modal: Send to another computer via Email */}
      {showEmailModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(10, 18, 35, 0.75)',
          backdropFilter: 'blur(6px)',
          zIndex: 999999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            width: '100%',
            maxWidth: '520px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            border: '1.5px solid #CBD5E1'
          }}>
            <div style={{
              padding: '1rem 1.4rem',
              background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '900', fontSize: '1.05rem' }}>
                <FaEnvelope style={{ color: '#38BDF8' }} /> GỬI HỒ SƠ LƯU TRỮ ĐẾN MÁY KHÁC
              </div>
              <button onClick={() => setShowEmailModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSendEmail} style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Địa chỉ Email máy tính lưu trữ / Ban Giám Đốc:
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="khnv.bvbinhlong@gmail.com"
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Tiêu đề Email:
                </label>
                <input
                  type="text"
                  required
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.85rem', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Ghi chú đính kèm (nếu có):
                </label>
                <textarea
                  rows={3}
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  placeholder="Ghi chú thêm cho người nhận ở máy tính kia..."
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowEmailModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#64748B', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer' }}>
                  Hủy
                </button>
                <button type="submit" disabled={sendingEmail} style={{ padding: '0.5rem 1.3rem', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: '#FFFFFF', fontWeight: '900', fontSize: '0.86rem', cursor: sendingEmail ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  {sendingEmail ? <><FaSpinner className="spinner" /> Đang gửi...</> : <><FaEnvelope /> Gửi Email Ngay</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox for Clinical Images */}
      {lightboxData.isOpen && (
        <ImageLightboxModal
          isOpen={lightboxData.isOpen}
          images={lightboxData.images}
          startIndex={lightboxData.startIndex}
          onClose={() => setLightboxData({ isOpen: false, images: [], startIndex: 0 })}
        />
      )}
    </div>
  );
};

export default DataArchiveTab;
