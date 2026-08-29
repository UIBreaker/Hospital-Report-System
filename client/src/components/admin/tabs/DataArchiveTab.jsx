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
  FaSync,
  FaFilePdf,
  FaFileExcel,
  FaLayerGroup,
  FaDatabase,
  FaPrint,
  FaChartBar
} from 'react-icons/fa';
import dataArchiveService from '../../../services/dataArchiveService';
import CountUpNumber from '../../common/CountUpNumber';
import ImageLightboxModal from '../../common/ImageLightboxModal';
import ArchiveFolderCard from './ArchiveFolderCard';
import { translateFieldKey } from '../../../utils/medicalFormatters';

const DataArchiveTab = ({ onOpenPresentation, onOpenPrintView, onOpenReportDetail }) => {
  // Navigation State: 'years' | 'months' | 'days' | 'day_details'
  const [currentLevel, setCurrentLevel] = useState('years');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Active section inside Level 4 Day Details: 'all' | 'reports' | 'metrics' | 'cases' | 'staff' | 'images'
  const [activeDaySection, setActiveDaySection] = useState('all');

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
  const [senderEmail, setSenderEmail] = useState(() => localStorage.getItem('archive_sender_email') || 'nhatnam171217@gmail.com');
  const [senderAppPassword, setSenderAppPassword] = useState(() => localStorage.getItem('archive_sender_pass') || '');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailNotes, setEmailNotes] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

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
    setActiveDaySection('all');
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

  // Open Individual Standalone HTML Document
  const handleOpenIndividualFile = (fileType) => {
    if (!selectedDay || !dayDetails) return;
    let htmlContent = '';
    if (fileType === '01_reports') {
      htmlContent = dataArchiveService.generateGeneralReportHtml(selectedDay.date, dayDetails);
    } else if (fileType === '02_metrics') {
      htmlContent = dataArchiveService.generateDepartmentMetricsHtml(selectedDay.date, dayDetails);
    } else if (fileType === '03_cases') {
      htmlContent = dataArchiveService.generateClinicalCasesHtml(selectedDay.date, dayDetails);
    } else if (fileType === '04_staff') {
      htmlContent = dataArchiveService.generateStaffListHtml(selectedDay.date, dayDetails);
    } else if (fileType === '05_images') {
      htmlContent = dataArchiveService.generateImageGalleryHtml(selectedDay.date, dayDetails);
    }

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  // Method 1: Client-Side Instant ZIP Download (Contains all 5 separate files + Excel + JSON + Images)
  const handleDownloadZip = async () => {
    if (!dayDetails || !selectedDay) return;
    try {
      setIsZipping(true);
      setZipProgressText('Đang khởi tạo gói nén 5 file ZIP...');
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
        setZipProgressText('');
        setZipProgressPct(0);
      }, 800);
    }
  };

  // Method 2: Multi-channel sharing to another computer
  const handleOpenEmailModal = () => {
    if (!selectedDay) return;
    setEmailSubject(`[TTYT BÌNH LONG] Báo Cáo Giao Ban Trực Toàn Viện - Ngày ${selectedDay.date}`);
    setShowEmailModal(true);
  };

  const buildEmailBodyText = () => {
    return `Kính gửi Ban Giám Đốc và Phòng Kế Hoạch Nghiệp Vụ,

Hệ thống xin gửi trọn bộ 5 tệp hồ sơ lưu trữ ca trực giao ban toàn viện:
- Ngày ca trực: ${selectedDay?.date}
- Số khoa nộp báo cáo: ${dayDetails?.reports?.length || 0}/12 Khoa phòng
- Tổng ca phẫu thuật: ${dayDetails?.surgeryCases?.length || 0} ca
- Tổng ca chuyển viện: ${dayDetails?.transferCases?.length || 0} ca
- Tổng ca tử vong: ${dayDetails?.deathCases?.length || 0} ca
- Bệnh nhân nặng theo dõi: ${dayDetails?.criticalCases?.length || 0} ca
- Cán bộ trực & tăng cường: ${dayDetails?.overtimeStaffList?.length || 0} người
- Số hình ảnh cận lâm sàng: ${dayDetails?.imagesList?.length || 0} ảnh

Gói lưu trữ gồm 5 file riêng biệt:
1. 01_BaoCao_12_KhoaPhong.html
2. 02_ChiSo_BaoCao_TrongCaTruc_CacKhoa.html
3. 03_CacCaDienBien_LamSangDacBiet.html
4. 04_DanhSach_CanBoTruc_Va_ThemGio.html
5. 05_BoSuuTap_HinhAnh_LamSang_Va_CLS.html

${emailNotes ? `Ghi chú từ Admin: ${emailNotes}\n\n` : ''}Hồ sơ chi tiết đã được đồng bộ an toàn trong kho dữ liệu.`;
  };

  // 1-Click Open Gmail Webmail
  const handleOpenGmailWeb = async () => {
    if (dayDetails && selectedDay) {
      dataArchiveService.generateAndDownloadShiftZip(selectedDay.date, dayDetails);
    }
    const body = buildEmailBodyText();
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`;
    window.open(gmailUrl, '_blank');
    localStorage.setItem('last_archive_email', recipientEmail.trim());
    alert('💡 Hệ thống đã mở thư Gmail và đồng thời tải sẵn file nén ZIP về máy tính của bạn.\n\n👉 Bạn chỉ cần bấm biểu tượng đính kèm tệp 📎 trên Gmail và chọn file ZIP vừa tải để gửi đi nhé!');
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const body = buildEmailBodyText();
    navigator.clipboard.writeText(`${emailSubject}\n\n${body}`).then(() => {
      alert('📋 Đã sao chép toàn bộ tóm tắt ca trực vào bộ nhớ tạm! Bạn có thể nhấn Ctrl + V để dán gửi ngay qua Zalo, Messenger hoặc Email.');
    });
  };

  const handleSendEmailServer = async (e) => {
    if (e) e.preventDefault();
    if (!recipientEmail || !recipientEmail.includes('@')) {
      alert('Vui lòng nhập địa chỉ Email người nhận hợp lệ.');
      return;
    }
    if (!senderAppPassword) {
      setShowPasswordHelp(true);
      alert('👉 Để hệ thống tự động gửi file ZIP đính kèm trong 1 click, bạn vui lòng nhập Mật Khẩu Ứng Dụng Gmail (16 chữ số) ở ô bên dưới.\n\n(Xem hướng dẫn tạo mã 16 chữ số ngay trong khung trợ giúp bên dưới nhé!)');
      return;
    }

    try {
      setSendingEmail(true);
      localStorage.setItem('last_archive_email', recipientEmail.trim());
      localStorage.setItem('archive_sender_email', senderEmail.trim());
      localStorage.setItem('archive_sender_pass', senderAppPassword.trim());

      let zipAttachmentBase64 = '';
      if (dayDetails && selectedDay) {
        try {
          zipAttachmentBase64 = await dataArchiveService.generateShiftZipBase64(selectedDay.date, dayDetails);
        } catch (zipErr) {
          console.warn('Lỗi tạo base64 zip:', zipErr);
        }
      }

      const payload = {
        date: selectedDay.date,
        recipientEmail: recipientEmail.trim(),
        senderEmail: senderEmail.trim(),
        senderAppPassword: senderAppPassword.trim(),
        subject: emailSubject.trim(),
        notes: emailNotes.trim(),
        zipAttachmentBase64,
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
      } else {
        alert(res?.error || 'Không thể gửi Email qua máy chủ.');
      }
    } catch (err) {
      console.error('Lỗi gửi email:', err);
      const errMsg = err.response?.data?.error || err.message || 'Lỗi khi gửi Email qua máy chủ. Vui lòng kiểm tra lại Mật khẩu ứng dụng Gmail.';
      alert(`⚠️ ${errMsg}`);
    } finally {
      setSendingEmail(false);
    }
  };

  // Compute Total Metrics for Header
  const totalYears = treeData.length;
  const totalDaysAcrossYears = treeData.reduce((acc, y) => acc + (y.totalDays || 0), 0);
  const totalReportsAcrossYears = treeData.reduce((acc, y) => acc + (y.totalReports || 0), 0);
  const totalCasesAcrossYears = treeData.reduce((acc, y) => acc + (y.totalCases || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      
      {/* 🌟 HERO VAULT HEADER */}
      <div style={{
        background: 'linear-gradient(135deg, #0A192F 0%, #0F2C59 60%, #0284C7 100%)',
        color: '#FFFFFF',
        borderRadius: '20px',
        padding: '1.6rem 2rem',
        boxShadow: '0 12px 30px rgba(15, 44, 89, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', zIndex: 1 }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            border: '1.5px solid rgba(255, 255, 255, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            color: '#38BDF8',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
          }}>
            <FaDatabase />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: '900', letterSpacing: '0.2px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#FFFFFF', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              TỔNG HỢP DỮ LIỆU DỰ ÁN & KHO LƯU TRỮ SỐ HÓA
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', fontWeight: '600', color: '#BAE6FD', textShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
              Kho dữ liệu 3D phân cấp theo Năm ➔ Tháng ➔ Ngày, đóng gói 5 File riêng biệt, bảo tồn hồ sơ giao ban
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 1 }}>
          <button
            onClick={loadTree}
            disabled={loadingTree}
            style={{
              padding: '0.55rem 1.1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: '1.5px solid rgba(255, 255, 255, 0.4)',
              borderRadius: '10px',
              color: '#FFFFFF',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: loadingTree ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backdropFilter: 'blur(6px)',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
            }}
          >
            <FaSync className={loadingTree ? 'spinner' : ''} /> Làm Mới Kho
          </button>
        </div>
      </div>

      {/* 📊 STORAGE METRICS BAR */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{ background: '#FFFFFF', padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#EFF6FF', color: '#1E40AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaLayerGroup />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Năm Lưu Trữ</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#0F2C59' }}><CountUpNumber value={totalYears} /> năm</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#F0FDF4', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaCalendarAlt />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ca Trực Đã Lưu</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#059669' }}><CountUpNumber value={totalDaysAcrossYears} /> ngày</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FAF5FF', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaFileAlt />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Báo Cáo Khoa Phòng</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#7C3AED' }}><CountUpNumber value={totalReportsAcrossYears} /> phiếu</div>
          </div>
        </div>

        <div style={{ background: '#FFFFFF', padding: '1rem 1.2rem', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
            <FaAmbulance />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748B', textTransform: 'uppercase' }}>Ca Bệnh Đặc Biệt</div>
            <div style={{ fontSize: '1.35rem', fontWeight: '900', color: '#D97706' }}><CountUpNumber value={totalCasesAcrossYears} /> ca</div>
          </div>
        </div>
      </div>

      {/* 🧭 INTERACTIVE BREADCRUMB & FAST SEARCH BAR */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '0.85rem 1.4rem',
        border: '1.5px solid #E2E8F0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        {/* Breadcrumb Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
          {currentLevel !== 'years' && (
            <button
              onClick={handleGoBack}
              style={{
                padding: '0.35rem 0.75rem',
                backgroundColor: '#F1F5F9',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#0F2C59',
                fontWeight: '800',
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                marginRight: '0.4rem'
              }}
            >
              <FaArrowLeft /> Quay lại
            </button>
          )}

          <span
            onClick={() => { setCurrentLevel('years'); setSelectedYear(null); setSelectedMonth(null); setSelectedDay(null); setDayDetails(null); }}
            style={{ fontWeight: currentLevel === 'years' ? '900' : '700', color: currentLevel === 'years' ? '#0284C7' : '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <FaDatabase style={{ color: '#0284C7' }} /> Kho Lưu Trữ
          </span>

          {selectedYear && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span
                onClick={() => { setCurrentLevel('months'); setSelectedMonth(null); setSelectedDay(null); setDayDetails(null); }}
                style={{ fontWeight: currentLevel === 'months' ? '900' : '700', color: currentLevel === 'months' ? '#0284C7' : '#64748B', cursor: 'pointer' }}
              >
                {selectedYear.label}
              </span>
            </>
          )}

          {selectedMonth && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span
                onClick={() => { setCurrentLevel('days'); setSelectedDay(null); setDayDetails(null); }}
                style={{ fontWeight: currentLevel === 'days' ? '900' : '700', color: currentLevel === 'days' ? '#0284C7' : '#64748B', cursor: 'pointer' }}
              >
                {selectedMonth.label}
              </span>
            </>
          )}

          {selectedDay && (
            <>
              <FaChevronRight style={{ fontSize: '0.7rem', color: '#94A3B8' }} />
              <span style={{ fontWeight: '900', color: '#0284C7' }}>
                {selectedDay.label}
              </span>
            </>
          )}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '260px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm kiếm năm, tháng, ngày..."
            style={{
              width: '100%',
              padding: '0.45rem 0.85rem 0.45rem 2.2rem',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.82rem',
              boxSizing: 'border-box',
              outline: 'none',
              backgroundColor: '#F8FAFC'
            }}
          />
        </div>
      </div>

      {/* 🔄 LOADING SPINNER */}
      {loadingTree && (
        <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#0284C7', marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F2C59' }}>Đang nạp cấu trúc kho lưu trữ số hóa...</div>
        </div>
      )}

      {/* 📁 LEVEL 1: YEARS GRID (3D FOLDERS) */}
      {!loadingTree && currentLevel === 'years' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {treeData.filter(y => !searchTerm || y.year.includes(searchTerm) || y.label.toLowerCase().includes(searchTerm.toLowerCase())).map(y => (
            <ArchiveFolderCard
              key={y.year}
              id={`year_${y.year}`}
              type="year"
              title={y.label}
              subTitle={`${y.months?.length || 0} tháng có dữ liệu`}
              counterNumber={String(y.totalDays).padStart(2, '0')}
              counterLabel="NGÀY TRỰC"
              colorTheme="blue"
              stats={{
                days: y.totalDays,
                cases: y.totalCases
              }}
              onOpen={() => handleSelectYear(y)}
            />
          ))}
        </div>
      )}

      {/* 📁 LEVEL 2: MONTHS GRID (3D FOLDERS) */}
      {currentLevel === 'months' && selectedYear && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {selectedYear.months?.filter(m => !searchTerm || m.month.includes(searchTerm) || m.label.toLowerCase().includes(searchTerm.toLowerCase())).map(m => (
            <ArchiveFolderCard
              key={m.month}
              id={`month_${m.month}`}
              type="month"
              title={m.label}
              subTitle={`${m.days?.length || 0} ca trực`}
              counterNumber={String(m.days?.length || 0).padStart(2, '0')}
              counterLabel="CA TRỰC"
              colorTheme="emerald"
              stats={{
                days: m.totalDays,
                cases: m.totalCases
              }}
              onOpen={() => handleSelectMonth(m)}
            />
          ))}
        </div>
      )}

      {/* 📁 LEVEL 3: DAYS GRID (3D FOLDERS) */}
      {currentLevel === 'days' && selectedMonth && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {selectedMonth.days?.filter(d => !searchTerm || d.date.includes(searchTerm) || d.label.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
            <ArchiveFolderCard
              key={d.date}
              id={`day_${d.date}`}
              type="day"
              title={d.label}
              subTitle={d.isFullySubmitted ? '12/12 Khoa nộp' : `${d.submittedCount}/12 Khoa`}
              counterNumber={String(d.stats?.totalCases || 0).padStart(2, '0')}
              counterLabel="CA BỆNH"
              colorTheme="purple"
              stats={{
                submittedCount: d.submittedCount,
                isFullySubmitted: d.isFullySubmitted,
                surgeries: d.stats?.surgeries || 0,
                transfers: d.stats?.transfers || 0
              }}
              onOpen={() => handleSelectDay(d)}
            />
          ))}
        </div>
      )}

      {/* 📄 LEVEL 4: DAY DETAILS WORKSPACE - 5 SEPARATE 3D FOLDERS */}
      {currentLevel === 'day_details' && selectedDay && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
          
          {/* Action Bar for Day Workspace */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            padding: '1.3rem 1.8rem',
            border: '2px solid #0284C7',
            boxShadow: '0 8px 25px rgba(2, 132, 199, 0.12)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>HỒ SƠ CA TRỰC NGÀY</div>
              <div style={{ fontSize: '1.45rem', fontWeight: '900', color: '#0F2C59' }}>{selectedDay.label}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleDownloadZip}
                disabled={isZipping}
                style={{
                  padding: '0.65rem 1.3rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  cursor: isZipping ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)'
                }}
              >
                {isZipping ? <><FaSpinner className="spinner" /> {zipProgressText} ({zipProgressPct}%)</> : <><FaFileArchive /> 📦 Tải File ZIP Trọn Gói Về Máy</>}
              </button>

              <button
                onClick={handleOpenEmailModal}
                style={{
                  padding: '0.65rem 1.3rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  color: '#FFFFFF',
                  fontWeight: '900',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)'
                }}
              >
                <FaEnvelope /> 📧 Gửi Sang Máy Khác (Email & Lưu Trữ)
              </button>
            </div>
          </div>

          {/* 🗂️ 5 DISTINCT 3D FOLDERS SECTION GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.4rem' }}>
            
            {/* Folder 1: Báo Cáo 12 Khoa */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#1E40AF', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>FILE 1/5</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#059669' }}>{dayDetails?.reports?.length || 0}/12 Khoa</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaCheckCircle style={{ color: '#059669' }} /> 1. BÁO CÁO 12 KHOA PHÒNG
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                Tệp: <code>01_BaoCao_12_KhoaPhong.html</code><br />
                Trạng thái nộp, BS & Điều dưỡng trực chính.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualFile('01_reports')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #0284C7', background: '#FFFFFF', color: '#0284C7', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <FaPrint /> In File Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDaySection(activeDaySection === 'reports' ? 'all' : 'reports')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#0F2C59', color: '#FFFFFF', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  {activeDaySection === 'reports' ? 'Thu Gọn ▲' : 'Xem Chi Tiết ▼'}
                </button>
              </div>
            </div>

            {/* Folder 2: Chỉ Số Báo Cáo Chuyên Môn */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0369A1', background: '#E0F2FE', padding: '3px 8px', borderRadius: '6px' }}>FILE 2/5</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0284C7' }}>Đầy Đủ 12 Khoa</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaChartBar style={{ color: '#0284C7' }} /> 2. CHỈ SỐ TRONG CA TRỰC
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                Tệp: <code>02_ChiSo_BaoCao_TrongCaTruc_CacKhoa.html</code><br />
                Khám bệnh, nội trú, ngoại trú, mổ, xét nghiệm, CĐHA...
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualFile('02_metrics')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #0284C7', background: '#FFFFFF', color: '#0284C7', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <FaPrint /> In File Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDaySection(activeDaySection === 'metrics' ? 'all' : 'metrics')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#0F2C59', color: '#FFFFFF', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  {activeDaySection === 'metrics' ? 'Thu Gọn ▲' : 'Xem Chi Tiết ▼'}
                </button>
              </div>
            </div>

            {/* Folder 3: Ca Diễn Biến Lâm Sàng Đặc Biệt */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#92400E', background: '#FEF3C7', padding: '3px 8px', borderRadius: '6px' }}>FILE 3/5</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#D97706' }}>
                  {(dayDetails?.surgeryCases?.length || 0) + (dayDetails?.transferCases?.length || 0) + (dayDetails?.criticalCases?.length || 0) + (dayDetails?.deathCases?.length || 0)} Ca
                </span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaAmbulance style={{ color: '#D97706' }} /> 3. CA LÂM SÀNG ĐẶC BIỆT
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                Tệp: <code>03_CacCaDienBien_LamSangDacBiet.html</code><br />
                Đầy đủ Lâm Sàng, Cận Lâm Sàng, PTV, Xử Trí.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualFile('03_cases')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #D97706', background: '#FFFFFF', color: '#D97706', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <FaPrint /> In File Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDaySection(activeDaySection === 'cases' ? 'all' : 'cases')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#0F2C59', color: '#FFFFFF', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  {activeDaySection === 'cases' ? 'Thu Gọn ▲' : 'Xem Chi Tiết ▼'}
                </button>
              </div>
            </div>

            {/* Folder 4: Cán Bộ Trực & Thêm Giờ */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#065F46', background: '#D1FAE5', padding: '3px 8px', borderRadius: '6px' }}>FILE 4/5</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#059669' }}>{dayDetails?.overtimeStaffList?.length || 0} Người</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaUserMd style={{ color: '#059669' }} /> 4. CÁN BỘ TRỰC & THÊM GIỜ
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                Tệp: <code>04_DanhSach_CanBoTruc_Va_ThemGio.html</code><br />
                Phân công trực ban và tăng cường nhân sự.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualFile('04_staff')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #059669', background: '#FFFFFF', color: '#059669', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <FaPrint /> In File Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDaySection(activeDaySection === 'staff' ? 'all' : 'staff')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#0F2C59', color: '#FFFFFF', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  {activeDaySection === 'staff' ? 'Thu Gọn ▲' : 'Xem Chi Tiết ▼'}
                </button>
              </div>
            </div>

            {/* Folder 5: Bộ Sưu Tập Ảnh */}
            <div style={{ background: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #E2E8F0', padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6B21A8', background: '#F3E8FF', padding: '3px 8px', borderRadius: '6px' }}>FILE 5/5</span>
                <span style={{ fontSize: '0.82rem', fontWeight: '900', color: '#7C3AED' }}>{dayDetails?.imagesList?.length || 0} Ảnh</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FaImage style={{ color: '#7C3AED' }} /> 5. ẢNH LÂM SÀNG & CLS
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', lineHeight: '1.4' }}>
                Tệp: <code>05_BoSuuTap_HinhAnh_LamSang_Va_CLS.html</code><br />
                Bộ ảnh X-quang, CT, Siêu âm, ECG.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={() => handleOpenIndividualFile('05_images')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: '1.5px solid #7C3AED', background: '#FFFFFF', color: '#7C3AED', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
                >
                  <FaPrint /> In File Riêng
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDaySection(activeDaySection === 'images' ? 'all' : 'images')}
                  style={{ padding: '0.45rem', borderRadius: '8px', border: 'none', background: '#0F2C59', color: '#FFFFFF', fontWeight: '800', fontSize: '0.74rem', cursor: 'pointer' }}
                >
                  {activeDaySection === 'images' ? 'Thu Gọn ▲' : 'Xem Chi Tiết ▼'}
                </button>
              </div>
            </div>

          </div>

          {/* Details Content */}
          {loadingDay && (
            <div style={{ padding: '3.5rem', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '16px' }}>
              <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: '#0284C7', marginBottom: '1rem' }} />
              <div style={{ fontSize: '1rem', fontWeight: '800' }}>Đang nạp toàn bộ hồ sơ 12 khoa phòng...</div>
            </div>
          )}

          {!loadingDay && dayDetails && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
              
              {/* SECTION 1: 12 KHOA PHÒNG BÁO CÁO */}
              {(activeDaySection === 'all' || activeDaySection === 'reports') && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaCheckCircle style={{ color: '#059669' }} /> 1. BÁO CÁO 12 KHOA PHÒNG ({dayDetails?.reports?.length || 0}/12)
                    </h3>
                    <button
                      onClick={() => handleOpenIndividualFile('01_reports')}
                      style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid #0284C7', background: '#F0F9FF', color: '#0284C7', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FaPrint /> Mở Bản In A4 Riêng
                    </button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.65rem' }}>
                    {(dayDetails?.reports || []).map(r => (
                      <div key={r.id} style={{ padding: '0.75rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', fontSize: '0.8rem' }}>
                        <div style={{ fontWeight: '800', color: '#0F2C59' }}>{r.department_name || r.department_code}</div>
                        <div style={{ color: '#1D4ED8', fontSize: '0.75rem', marginTop: '2px' }}>BS: <strong>{r.doctor_name || '—'}</strong> | ĐD: <strong>{r.nurse_name || '—'}</strong></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: CHỈ SỐ BÁO CÁO TRONG CA TRỰC CÁC KHOA */}
              {(activeDaySection === 'all' || activeDaySection === 'metrics') && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaChartBar style={{ color: '#0284C7' }} /> 2. CHỈ SỐ BÁO CÁO TRONG CA TRỰC (TẤT CẢ CÁC KHOA)
                    </h3>
                    <button
                      onClick={() => handleOpenIndividualFile('02_metrics')}
                      style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid #0284C7', background: '#F0F9FF', color: '#0284C7', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FaPrint /> Mở Bảng Chỉ Số A4 Riêng
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
                    {(dayDetails?.reports || []).map((r, rIdx) => {
                      const rawForm = (() => {
                        const raw = r.report_data || r.form_data || r.formData || r.reportData || {};
                        if (typeof raw === 'object' && raw !== null) return raw;
                        try { return JSON.parse(raw); } catch (e) { return {}; }
                      })();

                      const normalizeStr = (str) => (str || '')
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd');

                      const normCode = normalizeStr(r.department_code);
                      const normName = normalizeStr(r.department_name);

                      const isXN = normCode.includes('xn') || normCode.includes('xet') || normName.includes('xet nghiem');
                      const isCDHA = !isXN && (normCode.includes('cdha') || normName.includes('hinh anh') || normName.includes('chan doan') || Array.isArray(rawForm.techniques));
                      const is4CK = !isXN && (normCode.includes('4ck') || normCode.includes('lck') || normName.includes('chuyen khoa') || rawForm.tmh_tongSo !== undefined || rawForm.tong4ck_tongSo !== undefined);
                      const isHSCC = !isXN && (normCode.includes('hscc') || normName.includes('hoi suc cap cuu') || normName.includes('than nhan tao') || (rawForm.hscc && typeof rawForm.hscc === 'object') || (rawForm.tnt && typeof rawForm.tnt === 'object') || (rawForm.pk21 && typeof rawForm.pk21 === 'object'));
                      const isYHCT = !isXN && (normCode.includes('yhct') || normName.includes('co truyen') || normName.includes('phuc hoi') || (rawForm.noiTru && typeof rawForm.noiTru === 'object'));
                      const isGMHS = !isXN && (normCode.includes('gmhs') || normCode.includes('gay_me') || normCode.includes('gm') || normName.includes('gay me') || rawForm.cc_ctch !== undefined || rawForm.tongSoCaMo !== undefined);

                      // Flatten all fields and sub-objects
                      const flatFields = [];
                      const noteFields = [];

                      Object.entries(rawForm).forEach(([k, v]) => {
                        if (v === null || v === undefined || v === '' || k === '_id') return;
                        if (k === 'themGio' || k === 'nhanSu' || k === 'dieuDuongTruc' || k === 'hienCoGhiChu' || k === 'hienConGhiChu' || k === 'ghiChu' || k === 'tinhHinhChung') {
                          noteFields.push({ label: translateFieldKey(k), val: String(v) });
                          return;
                        }
                        if (typeof v === 'object' && !Array.isArray(v)) {
                          Object.entries(v).forEach(([subK, subV]) => {
                            if (subV !== null && subV !== undefined && subV !== '') {
                              flatFields.push({ key: `${k}_${subK}`, label: translateFieldKey(subK, k), val: subV });
                            }
                          });
                        } else if (!Array.isArray(v)) {
                          flatFields.push({ key: k, label: translateFieldKey(k), val: v });
                        }
                      });

                      return (
                        <div key={rIdx} style={{ border: '1.5px solid #CBD5E1', borderRadius: '14px', overflow: 'hidden', backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column' }}>
                          <div style={{ backgroundColor: '#0F2C59', color: '#FFFFFF', padding: '0.6rem 0.9rem', fontWeight: '800', fontSize: '0.86rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{r.department_name || r.department_code}</span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 'normal', opacity: 0.9 }}>BS: <strong>{r.doctor_name || '—'}</strong></span>
                          </div>

                          <div style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                            {/* 1. KHOA XÉT NGHIỆM */}
                            {isXN ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F0FDFA', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', border: '1px solid #99F6E4' }}>
                                  <span style={{ color: '#0D9488' }}>🧪 TỔNG SỐ LƯỢT XÉT NGHIỆM:</span>
                                  <span style={{ background: '#CCFBF1', color: '#0F766E', padding: '2px 10px', borderRadius: '6px', fontSize: '0.88rem' }}>{rawForm.tongSo || 0}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                    <span>Bảo hiểm (BHYT):</span>
                                    <strong style={{ color: '#059669' }}>{rawForm.baoHiem || 0}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                    <span>Bệnh nhân Nội trú:</span>
                                    <strong style={{ color: '#0F2C59' }}>{rawForm.noiTru || 0}</strong>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0', gridColumn: 'span 2' }}>
                                    <span>Bệnh nhân Ngoại trú:</span>
                                    <strong style={{ color: '#0F2C59' }}>{rawForm.ngoaiTru || 0}</strong>
                                  </div>
                                </div>
                              </div>
                            ) : is4CK ? (
                              /* 2. KHOA LIÊN CHUYÊN KHOA */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EFF6FF', padding: '5px 8px', borderRadius: '6px', fontWeight: 'bold', color: '#1E40AF' }}>
                                  <span>⭐ TỔNG 4CK (Khám / TT):</span>
                                  <span style={{ background: '#DBEAFE', padding: '1px 8px', borderRadius: '4px' }}>{rawForm.tong4ck_tongSo ?? (Number(rawForm.tmh_tongSo || 0) + Number(rawForm.mat_tongSo || 0) + Number(rawForm.rhm_noi_tongSo || 0) + Number(rawForm.daLieu_tongSo || 0))} / {rawForm.tong4ck_thuThuat ?? (Number(rawForm.tmh_thuThuat || 0) + Number(rawForm.mat_thuThuat || 0) + Number(rawForm.rhm_noi_thuThuat || 0))}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                  <span>👂 Tai Mũi Họng (TMH):</span>
                                  <strong style={{ color: '#0F2C59' }}>{rawForm.tmh_tongSo ?? 0} (TT: {rawForm.tmh_thuThuat ?? 0})</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                  <span>👁️ Mắt:</span>
                                  <strong style={{ color: '#0F2C59' }}>{rawForm.mat_tongSo ?? 0} (TT: {rawForm.mat_thuThuat ?? 0})</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                  <span>🦷 Răng Hàm Mặt (RHM):</span>
                                  <strong style={{ color: '#0F2C59' }}>{rawForm.rhm_noi_tongSo ?? 0} (TT: {rawForm.rhm_noi_thuThuat ?? 0})</strong>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                  <span>🩺 Da Liễu:</span>
                                  <strong style={{ color: '#0F2C59' }}>{rawForm.daLieu_tongSo ?? 0}</strong>
                                </div>
                              </div>
                            ) : isCDHA ? (
                              /* 3. KHOA CHẨN ĐOÁN HÌNH ẢNH (ĐẦY ĐỦ TỔNG, BHYT, NỘI TRÚ, NGOẠI TRÚ) */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.78rem' }}>
                                {(rawForm.bsSieuAm || rawForm.bsXquangCT) && (
                                  <div style={{ fontSize: '0.74rem', background: '#EEF2FF', padding: '4px 8px', borderRadius: '6px', color: '#3730A3' }}>
                                    {rawForm.bsSieuAm ? <div><strong>BS Siêu âm:</strong> {rawForm.bsSieuAm}</div> : null}
                                    {rawForm.bsXquangCT ? <div><strong>BS Xquang-CT:</strong> {rawForm.bsXquangCT}</div> : null}
                                  </div>
                                )}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.4rem' }}>
                                  {(Array.isArray(rawForm.techniques) ? rawForm.techniques : []).filter(t => t && (t.name || t.tongSo)).map((t, tIdx) => (
                                    <div key={tIdx} style={{ background: '#F8FAFC', padding: '5px 7px', borderRadius: '6px', border: '1px solid #CBD5E1' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '2px', marginBottom: '3px' }}>
                                        <strong style={{ color: '#1E40AF', fontSize: '0.78rem' }}>{t.name}</strong>
                                        <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '1px 6px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.74rem' }}>Tổng: {t.tongSo || 0}</span>
                                      </div>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '0.71rem', color: '#334155' }}>
                                        <div>BHYT: <strong style={{ color: '#059669' }}>{t.baoHiem || 0}</strong></div>
                                        <div>Nội trú: <strong style={{ color: '#0F2C59' }}>{t.noiTru || 0}</strong></div>
                                        <div style={{ gridColumn: 'span 2' }}>Ngoại trú: <strong style={{ color: '#0F2C59' }}>{t.ngoaiTru || 0}</strong></div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : isHSCC ? (
                              /* 4. KHỐI HỒI SỨC CẤP CỨU - THẬN NHÂN TẠO */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.76rem' }}>
                                {rawForm.hscc && (
                                  <div>
                                    <div style={{ fontWeight: '800', color: '#DC2626', fontSize: '0.75rem', marginBottom: '3px' }}>🚨 HỒI SỨC CẤP CỨU (HSCC)</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EFF6FF', padding: '3px 6px', borderRadius: '4px' }}><span>Tổng khám:</span><strong style={{ color: '#1E40AF' }}>{rawForm.hscc.tongSoKham || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF2F2', padding: '3px 6px', borderRadius: '4px' }}><span>Tử vong:</span><strong style={{ color: '#DC2626' }}>{rawForm.hscc.tuVong || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Bệnh cũ:</span><strong>{rawForm.hscc.benhCu || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Bệnh mới:</span><strong>{rawForm.hscc.benhMoi || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Xuất viện:</span><strong>{rawForm.hscc.xuatVien || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Chuyển viện:</span><strong>{rawForm.hscc.chuyenVien || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Chuyển khoa:</span><strong>{rawForm.hscc.chuyenKhoa || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Hiện còn:</span><strong style={{ color: '#059669' }}>{rawForm.hscc.hienCon || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Kê toa:</span><strong>{rawForm.hscc.keToa || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Ngoại trú:</span><strong>{rawForm.hscc.ngoaiTru || 0}</strong></div>
                                    </div>
                                  </div>
                                )}
                                {rawForm.tnt && (
                                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
                                    <div style={{ fontWeight: '800', color: '#0284C7', fontSize: '0.75rem', marginBottom: '3px' }}>🩺 THẬN NHÂN TẠO (TNT) {rawForm.bsTrucTNT ? `(BS: ${rawForm.bsTrucTNT})` : ''}</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F0FDF4', padding: '3px 6px', borderRadius: '4px' }}><span>Chạy thận CTĐK:</span><strong style={{ color: '#059669' }}>{rawForm.tnt.tnt_ctdk || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>TNT Nội trú:</span><strong>{rawForm.tnt.tnt_noiTru || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Bệnh cũ:</span><strong>{rawForm.tnt.tnt_benhCu || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Bệnh mới:</span><strong>{rawForm.tnt.tnt_benhMoi || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Xuất viện:</span><strong>{rawForm.tnt.tnt_xuatVien || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Hiện còn:</span><strong style={{ color: '#059669' }}>{rawForm.tnt.tnt_hienCon || 0}</strong></div>
                                    </div>
                                  </div>
                                )}
                                {rawForm.pk21 && (
                                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '4px' }}>
                                    <div style={{ fontWeight: '800', color: '#7C3AED', fontSize: '0.75rem', marginBottom: '3px' }}>🏥 PHÒNG KHÁM 21</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FAF5FF', padding: '3px 6px', borderRadius: '4px' }}><span>Khám PK21:</span><strong style={{ color: '#7C3AED' }}>{rawForm.pk21.pk21_tongSo || rawForm.pk21.pk21_tongSoKham || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Ngoại trú:</span><strong>{rawForm.pk21.pk21_ngoaiTru || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Nhập viện:</span><strong>{rawForm.pk21.pk21_nhapVien || 0}</strong></div>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Chuyển viện:</span><strong>{rawForm.pk21.pk21_chuyenVien || 0}</strong></div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : isYHCT ? (
                              /* 5. Y HỌC CỔ TRUYỀN - PHCN */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.76rem' }}>
                                {rawForm.noiTru && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F0FDF4', padding: '4px 8px', borderRadius: '6px', border: '1px solid #BBF7D0' }}>
                                    <span style={{ fontWeight: 'bold', color: '#065F46' }}>🛏️ Nội trú:</span>
                                    <span>Cũ: <strong>{rawForm.noiTru.benhCu || 0}</strong> | Mới: <strong>{rawForm.noiTru.benhMoi || 0}</strong> | Xuất: <strong>{rawForm.noiTru.xuat || 0}</strong> | Còn: <strong style={{ color: '#059669' }}>{rawForm.noiTru.hienCon || 0}</strong></span>
                                  </div>
                                )}
                                {rawForm.ngoaiTru && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '4px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ fontWeight: 'bold', color: '#334155' }}>🚶 Ngoại trú:</span>
                                    <span>Cũ: <strong>{rawForm.ngoaiTru.benhCu || 0}</strong> | Mới: <strong>{rawForm.ngoaiTru.benhMoi || 0}</strong> | Xuất: <strong>{rawForm.ngoaiTru.xuat || 0}</strong> | Còn: <strong style={{ color: '#059669' }}>{rawForm.ngoaiTru.hienCon || 0}</strong></span>
                                  </div>
                                )}
                                {rawForm.keToa && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EFF6FF', padding: '4px 8px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
                                    <span style={{ fontWeight: 'bold', color: '#1E40AF' }}>💊 Kê toa:</span>
                                    <span>Tổng: <strong>{rawForm.keToa.tongSo || 0}</strong> (BHYT: {rawForm.keToa.bhyt || 0} | DV: {rawForm.keToa.dichVu || 0})</span>
                                  </div>
                                )}
                              </div>
                            ) : isGMHS ? (
                              /* 6. GÂY MÊ HỒI SỨC */
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.76rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', background: '#EFF6FF', padding: '5px 8px', borderRadius: '6px', fontWeight: 'bold', color: '#1E40AF', border: '1px solid #BFDBFE' }}>
                                  <span>🔪 TỔNG SỐ CA PHẪU THUẬT:</span>
                                  <span style={{ background: '#DBEAFE', padding: '2px 8px', borderRadius: '4px' }}>{rawForm.tongSoCaMo ?? (Number(rawForm.cc_ctch || 0) + Number(rawForm.cc_ngoaiTH || 0) + Number(rawForm.cc_san || 0) + Number(rawForm.ct_ctch || 0) + Number(rawForm.ct_ngoaiTH || 0) + Number(rawForm.ct_san || 0))} ca</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF2F2', padding: '3px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}><span style={{ color: '#DC2626' }}>Mổ CC CTCH:</span><strong>{rawForm.cc_ctch || 0}</strong></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF2F2', padding: '3px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}><span style={{ color: '#DC2626' }}>Mổ CC Ngoại:</span><strong>{rawForm.cc_ngoaiTH || 0}</strong></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#FEF2F2', padding: '3px 6px', borderRadius: '4px', border: '1px solid #FCA5A5' }}><span style={{ color: '#DC2626' }}>Mổ CC Sản:</span><strong>{rawForm.cc_san || 0}</strong></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Mổ KH CTCH:</span><strong>{rawForm.ct_ctch || 0}</strong></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Mổ KH Ngoại:</span><strong>{rawForm.ct_ngoaiTH || 0}</strong></div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}><span>Mổ KH Sản:</span><strong>{rawForm.ct_san || 0}</strong></div>
                                </div>
                              </div>
                            ) : (
                              /* 7. TẤT CẢ CÁC KHOA KHÁC (Sản, Nhi, Nhiễm, Nội, Ngoại, CTCH...) */
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', fontSize: '0.76rem' }}>
                                {flatFields.length === 0 ? <div style={{ color: '#94A3B8', fontStyle: 'italic', gridColumn: 'span 2' }}>Không có chỉ số chuyên môn.</div> : null}
                                {flatFields.map((f, fIdx) => (
                                  <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', background: '#F8FAFC', padding: '3px 6px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                                    <span style={{ color: '#64748B' }}>{f.label}:</span>
                                    <strong style={{ color: '#0F2C59' }}>{String(f.val)}</strong>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Ghi chú / Diễn biến thêm giờ / Điều dưỡng trực chung cho TẤT CẢ các khoa */}
                            {noteFields.length > 0 && (
                              <div style={{ background: '#FFFBEB', padding: '4px 8px', borderRadius: '6px', border: '1px solid #FDE68A', fontSize: '0.73rem', color: '#92400E', marginTop: 'auto' }}>
                                {noteFields.map((n, nIdx) => (
                                  <div key={nIdx}><strong>📌 {n.label}:</strong> {n.val}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 3: CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT */}
              {(activeDaySection === 'all' || activeDaySection === 'cases') && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaAmbulance style={{ color: '#D97706' }} /> 3. CÁC CA DIỄN BIẾN LÂM SÀNG ĐẶC BIỆT (Đầy đủ Lâm Sàng & Cận Lâm Sàng)
                    </h3>
                    <button
                      onClick={() => handleOpenIndividualFile('03_cases')}
                      style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid #D97706', background: '#FFFBEB', color: '#D97706', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FaPrint /> Mở Hồ Sơ Ca Bệnh A4 Riêng
                    </button>
                  </div>

                  {/* Summary Count Bar */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.2rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#1E40AF', fontWeight: '800' }}>CA PHẪU THUẬT</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F2C59', marginTop: '2px' }}>{dayDetails?.surgeryCases?.length || 0}</div>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#92400E', fontWeight: '800' }}>CA CHUYỂN VIỆN</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#D97706', marginTop: '2px' }}>{dayDetails?.transferCases?.length || 0}</div>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#991B1B', fontWeight: '800' }}>CA TỬ VONG</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#DC2626', marginTop: '2px' }}>{dayDetails?.deathCases?.length || 0}</div>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#FAF5FF', border: '1px solid #DDD6FE', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.74rem', color: '#6B21A8', fontWeight: '800' }}>BỆNH NHÂN NẶNG</div>
                      <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7C3AED', marginTop: '2px' }}>{dayDetails?.criticalCases?.length || 0}</div>
                    </div>
                  </div>

                  {/* Detailed Patient Case Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {/* Surgery Cases */}
                    {(dayDetails?.surgeryCases || []).map((sc, sIdx) => (
                      <div key={`sc_${sIdx}`} style={{ border: '1.5px solid #BFDBFE', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#F8FAFC' }}>
                        <div style={{ backgroundColor: '#DBEAFE', padding: '0.55rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '900', color: '#1E40AF', fontSize: '0.86rem' }}>
                            🔪 Ca Mổ #{sIdx + 1}: {sc.patient_name || sc.patientName} ({sc.birth_year || sc.age} tuổi) — {sc.department_name || sc.department_code}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#1E3A8A' }}>Vào: <strong>{sc.admission_time || sc.admissionTime}</strong></span>
                        </div>
                        <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <div><strong style={{ color: '#0284C7' }}>🩺 Lâm sàng:</strong> {sc.clinical_symptoms || sc.clinicalSymptoms || '—'}</div>
                          <div><strong style={{ color: '#7C3AED' }}>🔬 Cận lâm sàng:</strong> {sc.clinical_tests || sc.clinicalTests || '—'}</div>
                          <div><strong style={{ color: '#D97706' }}>🏥 Chẩn đoán trước mổ:</strong> {sc.preoperative_diagnosis || sc.pre_diagnosis || '—'} ➔ <strong>Sau mổ:</strong> {sc.postoperative_diagnosis || sc.post_diagnosis || '—'}</div>
                          <div><strong style={{ color: '#059669' }}>🔪 Lệnh mổ & PTV:</strong> {sc.consultation_order || sc.surgery_method || '—'} | PTV: {sc.main_surgeon || '—'} | Gây mê: {sc.anesthesiologist || '—'}</div>
                        </div>
                      </div>
                    ))}

                    {/* Transfer Cases */}
                    {(dayDetails?.transferCases || []).map((tc, tIdx) => (
                      <div key={`tc_${tIdx}`} style={{ border: '1.5px solid #FDE68A', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFFDF5' }}>
                        <div style={{ backgroundColor: '#FEF3C7', padding: '0.55rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '900', color: '#92400E', fontSize: '0.86rem' }}>
                            🚑 Ca Chuyển Viện #{tIdx + 1}: {tc.patient_name || tc.patientName} ({tc.age} tuổi) — {tc.department_name || tc.department_code}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#78350F' }}>Vào: <strong>{tc.admission_time || tc.admissionTime}</strong></span>
                        </div>
                        <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <div><strong style={{ color: '#0284C7' }}>🩺 Lâm sàng:</strong> {tc.clinical_symptoms || tc.clinicalSymptoms || '—'}</div>
                          <div><strong style={{ color: '#7C3AED' }}>🔬 Cận lâm sàng:</strong> {tc.clinical_tests || tc.clinicalTests || '—'}</div>
                          <div><strong style={{ color: '#D97706' }}>🏥 Chẩn đoán:</strong> {tc.diagnosis || '—'}</div>
                          <div><strong style={{ color: '#059669' }}>💊 Xử trí ban đầu:</strong> {tc.initial_treatment || tc.initialTreatment || '—'}</div>
                          <div><strong style={{ color: '#B45309' }}>🚑 Diễn biến chuyển:</strong> {tc.progress_notes || tc.progressNotes || '—'}</div>
                        </div>
                      </div>
                    ))}

                    {/* Critical Cases */}
                    {(dayDetails?.criticalCases || []).map((cc, cIdx) => (
                      <div key={`cc_${cIdx}`} style={{ border: '1.5px solid #DDD6FE', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FAF5FF' }}>
                        <div style={{ backgroundColor: '#EDE9FE', padding: '0.55rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '900', color: '#5B21B6', fontSize: '0.86rem' }}>
                            🏥 Bệnh Nhân Nặng #{cIdx + 1}: {cc.patient_name || cc.patientName} ({cc.age} tuổi) — {cc.department_name || cc.department_code}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#4C1D95' }}>Vào: <strong>{cc.admission_time || cc.admissionTime}</strong></span>
                        </div>
                        <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <div><strong style={{ color: '#0284C7' }}>🩺 Lâm sàng:</strong> {cc.clinical_symptoms || cc.clinicalSymptoms || '—'}</div>
                          <div><strong style={{ color: '#7C3AED' }}>🔬 Cận lâm sàng:</strong> {cc.clinical_tests || cc.clinicalTests || '—'}</div>
                          <div><strong style={{ color: '#D97706' }}>🏥 Chẩn đoán:</strong> {cc.diagnosis || '—'}</div>
                          <div><strong style={{ color: '#059669' }}>💊 Xử trí & Bàn giao:</strong> {cc.treatment || '—'} {cc.notes ? `(${cc.notes})` : ''}</div>
                        </div>
                      </div>
                    ))}

                    {/* Death Cases */}
                    {(dayDetails?.deathCases || []).map((dc, dIdx) => (
                      <div key={`dc_${dIdx}`} style={{ border: '1.5px solid #FECACA', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#FFF5F5' }}>
                        <div style={{ backgroundColor: '#FEE2E2', padding: '0.55rem 0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '900', color: '#991B1B', fontSize: '0.86rem' }}>
                            ⚠️ Ca Tử Vong #{dIdx + 1}: {dc.patient_name || dc.patientName} ({dc.age} tuổi) — {dc.department_name || dc.department_code}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#7F1D1D' }}>Vào: {dc.admission_time} ➔ Tử vong: <strong>{dc.death_time}</strong></span>
                        </div>
                        <div style={{ padding: '0.75rem 0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
                          <div><strong style={{ color: '#0284C7' }}>🩺 Lâm sàng & Sinh hiệu:</strong> {dc.clinical_symptoms || '—'}</div>
                          <div><strong style={{ color: '#7C3AED' }}>🔬 Cận lâm sàng / ECG:</strong> {dc.clinical_tests || '—'}</div>
                          <div><strong style={{ color: '#991B1B' }}>🏥 Chẩn đoán tử vong:</strong> {dc.diagnosis || '—'}</div>
                          <div><strong style={{ color: '#059669' }}>⚡ Xử trí cấp cứu:</strong> {dc.emergency_treatment || '—'}</div>
                          <div><strong style={{ color: '#B91C1C' }}>📌 Kết luận:</strong> {dc.final_outcome || dc.cause_of_death || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 4: DANH SÁCH CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ */}
              {(activeDaySection === 'all' || activeDaySection === 'staff') && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaUserMd style={{ color: '#059669' }} /> 4. DANH SÁCH CÁN BỘ TRỰC TĂNG CƯỜNG & THÊM GIỜ ({dayDetails?.overtimeStaffList?.length || 0})
                    </h3>
                    <button
                      onClick={() => handleOpenIndividualFile('04_staff')}
                      style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid #059669', background: '#F0FDF4', color: '#059669', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FaPrint /> Mở Bảng Nhân Sự A4 Riêng
                    </button>
                  </div>

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
              )}

              {/* SECTION 5: BỘ SƯU TẬP HÌNH ẢNH LÂM SÀNG & CẬN LÂM SÀNG */}
              {(activeDaySection === 'all' || activeDaySection === 'images') && (
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1.5px solid #CBD5E1', padding: '1.3rem', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <FaImage style={{ color: '#7C3AED' }} /> 5. BỘ SƯU TẬP HÌNH ẢNH LÂM SÀNG & CẬN LÂM SÀNG ({dayDetails?.imagesList?.length || 0})
                    </h3>
                    <button
                      onClick={() => handleOpenIndividualFile('05_images')}
                      style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1px solid #7C3AED', background: '#FAF5FF', color: '#7C3AED', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <FaPrint /> Mở Bộ Ảnh A4 Riêng
                    </button>
                  </div>

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
              )}

            </div>
          )}

        </div>
      )}

      {/* 📧 METHOD 2 MODAL: SEND TO ANOTHER COMPUTER VIA EMAIL */}
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

            <form onSubmit={handleSendEmailServer} style={{ padding: '1.2rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  📮 1. Địa chỉ Email người nhận (Máy tính lưu trữ / Lãnh đạo):
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

              {/* Automatic 1-Click Sending Config */}
              <div style={{ backgroundColor: '#F0F9FF', border: '1.5px solid #BAE6FD', borderRadius: '10px', padding: '0.85rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: '900', color: '#0369A1', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚡ CẤU HÌNH GỬI FILE ZIP TỰ ĐỘNG 1-CLICK</span>
                  <button
                    type="button"
                    onClick={() => setShowPasswordHelp(!showPasswordHelp)}
                    style={{ background: 'none', border: 'none', color: '#0284C7', fontSize: '0.74rem', fontWeight: '700', textDecoration: 'underline', cursor: 'pointer' }}
                  >
                    {showPasswordHelp ? 'Ẩn hướng dẫn ▲' : '❓ Cách lấy mã 16 số ▼'}
                  </button>
                </div>

                {showPasswordHelp && (
                  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #7DD3FC', borderRadius: '8px', padding: '0.6rem 0.8rem', fontSize: '0.74rem', color: '#0C4A6E', marginBottom: '0.65rem', lineHeight: '1.45' }}>
                    <strong>Cách lấy Mật khẩu ứng dụng Gmail (Chỉ làm 1 lần):</strong><br />
                    1. Truy cập <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" style={{ color: '#0284C7', fontWeight: 'bold' }}>myaccount.google.com/apppasswords</a> (Đăng nhập Google).<br />
                    2. Đặt tên ứng dụng: <em>"Báo Cáo Bệnh Viện"</em> ➔ Bấm <strong>Tạo</strong>.<br />
                    3. Copy mã 16 chữ số màu vàng dán vào ô bên dưới. (Hệ thống tự nhớ vĩnh viễn trên máy).
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#0369A1', marginBottom: '3px' }}>
                      Email gửi (Gmail của bạn):
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="email@gmail.com"
                      style={{ width: '100%', padding: '0.42rem 0.65rem', borderRadius: '6px', border: '1px solid #7DD3FC', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: '700', color: '#0369A1', marginBottom: '3px' }}>
                      Mật khẩu ứng dụng (16 chữ số):
                    </label>
                    <input
                      type="password"
                      value={senderAppPassword}
                      onChange={(e) => setSenderAppPassword(e.target.value)}
                      placeholder="xxxx xxxx xxxx xxxx"
                      style={{ width: '100%', padding: '0.42rem 0.65rem', borderRadius: '6px', border: '1px solid #7DD3FC', fontSize: '0.8rem', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Ghi chú đính kèm (nếu có):
                </label>
                <textarea
                  rows={2}
                  value={emailNotes}
                  onChange={(e) => setEmailNotes(e.target.value)}
                  placeholder="Ghi chú thêm cho người nhận ở máy tính kia..."
                  style={{ width: '100%', padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.82rem', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.2rem' }}>
                {/* PRIMARY 1-CLICK ACTION */}
                <button
                  type="submit"
                  disabled={sendingEmail}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                    color: '#FFFFFF',
                    fontWeight: '900',
                    fontSize: '0.92rem',
                    cursor: sendingEmail ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {sendingEmail ? <><FaSpinner className="spinner" /> Đang đóng gói ZIP & gửi trực tiếp...</> : <>⚡ GỬI EMAIL ĐÍNH KÈM FILE ZIP NGAY (1-CLICK)</>}
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
                  <button
                    type="button"
                    onClick={handleOpenGmailWeb}
                    style={{
                      padding: '0.45rem 0.7rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#C5221F',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                    title="Mở giao diện Gmail Web truyền thống"
                  >
                    <FaEnvelope /> Mở Gmail Web
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    style={{
                      padding: '0.45rem 0.7rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#0F2C59',
                      fontWeight: '800',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem'
                    }}
                    title="Sao chép nội dung tóm tắt để dán gửi Zalo / Messenger"
                  >
                    📋 Copy Gửi Zalo
                  </button>
                </div>

                <div style={{ textAlign: 'right', marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    style={{
                      padding: '0.35rem 0.8rem',
                      borderRadius: '6px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#64748B',
                      fontWeight: '700',
                      fontSize: '0.76rem',
                      cursor: 'pointer'
                    }}
                  >
                    Đóng
                  </button>
                </div>
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
