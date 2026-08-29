import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaRocket, 
  FaCodeBranch, 
  FaPlus, 
  FaTrash, 
  FaEye, 
  FaCheckCircle, 
  FaHistory, 
  FaStar, 
  FaMicrophoneAlt, 
  FaTv, 
  FaChartLine, 
  FaWpforms, 
  FaFilePdf, 
  FaShieldAlt, 
  FaSave,
  FaSpinner,
  FaCalendarAlt,
  FaUserTie,
  FaBug,
  FaBolt,
  FaPaintBrush,
  FaEdit,
  FaMagic
} from 'react-icons/fa';
import changelogService, { DEFAULT_V2_CHANGELOG } from '../../../services/changelogService';
import VersionChangelogModal from '../../common/VersionChangelogModal';

const AVAILABLE_ICONS = [
  { id: 'FaStar', label: '⭐ Tính năng nổi bật' },
  { id: 'FaBug', label: '🛠️ Bản vá lỗi / Sửa lỗi' },
  { id: 'FaBolt', label: '⚡ Tối ưu hiệu năng & Tốc độ' },
  { id: 'FaPaintBrush', label: '🎨 Giao diện & Trải nghiệm UI/UX' },
  { id: 'FaMicrophoneAlt', label: '🎙️ Giọng đọc AI' },
  { id: 'FaTv', label: '🖥️ Trình chiếu 4K' },
  { id: 'FaChartLine', label: '📊 Biểu đồ & Thống kê' },
  { id: 'FaWpforms', label: '📝 Biểu mẫu & Nhập liệu' },
  { id: 'FaFilePdf', label: '📄 Báo cáo & PDF A4' },
  { id: 'FaShieldAlt', label: '🔒 Bảo mật & CSDL' },
  { id: 'FaRocket', label: '🚀 Đột phá công nghệ' },
  { id: 'FaRobot', label: '🤖 Trợ lý thông minh' }
];

const PATCH_TEMPLATE_SECTIONS = [
  {
    iconName: 'FaBug',
    iconColor: '#DC2626',
    bg: '#FEF2F2',
    border: '#FECACA',
    title: '🛠️ Sửa Lỗi & Khắc Phục Sự Cố',
    badge: 'Bản vá',
    badgeBg: '#DC2626',
    items: [
      'Sửa lỗi hiển thị dữ liệu và tối ưu hóa thời gian phản hồi của hệ thống.',
      'Khắc phục sự cố đồng bộ trạng thái ca trực giữa các khoa phòng.'
    ]
  },
  {
    iconName: 'FaBolt',
    iconColor: '#D97706',
    bg: '#FFFBEB',
    border: '#FDE68A',
    title: '⚡ Tối Ưu Hiệu Năng & Tốc Độ Tải Trang',
    badge: 'Tối ưu',
    badgeBg: '#D97706',
    items: [
      'Giảm hơn 60% dung lượng tải ban đầu, mở trang tức thì không độ trễ.',
      'Tối ưu hóa các truy vấn CSDL giúp tải lịch sử nộp báo cáo mượt mà.'
    ]
  },
  {
    iconName: 'FaPaintBrush',
    iconColor: '#0284C7',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    title: '🎨 Tinh Chỉnh Giao Diện & Trải Nghiệm Người Dùng',
    badge: 'Cải tiến',
    badgeBg: '#0284C7',
    items: [
      'Cải thiện độ tương phản màu sắc giúp bác sĩ dễ đọc trong phòng trực.',
      'Căn chỉnh bố cục bảng biểu gọn gàng và chuẩn xác trên mọi thiết bị.'
    ]
  }
];

const VersionManageModal = ({ isOpen, onClose, onVersionPublished }) => {
  const [activeSubTab, setActiveSubTab] = useState('editor'); // 'editor' | 'history'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewCustomData, setPreviewCustomData] = useState(null);

  // Form State
  const [version, setVersion] = useState('2.0.0');
  const [title, setTitle] = useState('NHẬT KÝ PHIÊN BẢN v2.0.0');
  const [releaseDate, setReleaseDate] = useState('Tháng 08/2026');
  const [author, setAuthor] = useState('Nguyễn Vũ Nhật Nam (Phòng KHNV)');
  const [isMajor, setIsMajor] = useState(true);
  const [summary, setSummary] = useState('Chào mừng đến với Phiên bản 2.0.0 Siêu Cấp! Toàn bộ hệ thống giao ban đã được nâng cấp toàn diện.');
  const [sections, setSections] = useState(DEFAULT_V2_CHANGELOG.sections);

  useEffect(() => {
    if (isOpen) {
      loadLatestData();
      loadHistory();
    }
  }, [isOpen]);

  const loadLatestData = async () => {
    try {
      setLoading(true);
      const data = await changelogService.getLatestChangelog();
      if (data) {
        setVersion(data.version || '2.0.0');
        setTitle(data.title || `NHẬT KÝ PHIÊN BẢN v${data.version || '2.0.0'}`);
        setReleaseDate(data.release_date || 'Tháng 08/2026');
        setAuthor(data.author || 'Nguyễn Vũ Nhật Nam (Phòng KHNV)');
        setIsMajor(data.is_major !== false);
        setSummary(data.summary || '');
        if (Array.isArray(data.sections) && data.sections.length > 0) {
          setSections(data.sections);
        }
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu phiên bản mới nhất:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const res = await changelogService.getChangelogHistory();
      if (res?.success && Array.isArray(res.data)) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch sử phiên bản:', err);
    }
  };

  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      {
        iconName: isMajor ? 'FaStar' : 'FaBug',
        iconColor: isMajor ? '#0284C7' : '#DC2626',
        bg: isMajor ? '#EFF6FF' : '#FEF2F2',
        border: isMajor ? '#BFDBFE' : '#FECACA',
        title: isMajor ? '⭐ Tính Năng Nổi Bật Mới' : '🛠️ Sửa Lỗi & Tối Ưu Hóa',
        badge: isMajor ? 'Nổi bật' : 'Bản vá',
        badgeBg: isMajor ? '#0284C7' : '#DC2626',
        items: ['Mô tả chi tiết cải tiến đầu tiên của mục này.']
      }
    ]);
  };

  const handleApplyMajorTemplate = () => {
    setIsMajor(true);
    setTitle(`NHẬT KÝ PHIÊN BẢN v${version.trim() || '2.0.0'}`);
    setSummary('Chào mừng đến với bản cập nhật lớn với hàng loạt tính năng công nghệ đột phá!');
    setSections(DEFAULT_V2_CHANGELOG.sections);
  };

  const handleApplyPatchTemplate = () => {
    setIsMajor(false);
    setTitle(`BẢN VÁ & TỐI ƯU HỆ THỐNG v${version.trim() || '2.0.1'}`);
    setSummary('Bản cập nhật định kỳ tập trung sửa lỗi, tối ưu tốc độ và nâng cao độ ổn định hệ thống.');
    setSections(PATCH_TEMPLATE_SECTIONS);
  };

  const handleUpdateSection = (idx, field, val) => {
    setSections(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleRemoveSection = (idx) => {
    if (sections.length <= 1) {
      alert('Bản cập nhật cần tối thiểu 1 nhóm nội dung.');
      return;
    }
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddItemToSection = (secIdx) => {
    setSections(prev => {
      const copy = [...prev];
      copy[secIdx] = {
        ...copy[secIdx],
        items: [...(copy[secIdx].items || []), '']
      };
      return copy;
    });
  };

  const handleUpdateItem = (secIdx, itemIdx, val) => {
    setSections(prev => {
      const copy = [...prev];
      const itemsCopy = [...(copy[secIdx].items || [])];
      itemsCopy[itemIdx] = val;
      copy[secIdx] = { ...copy[secIdx], items: itemsCopy };
      return copy;
    });
  };

  const handleRemoveItem = (secIdx, itemIdx) => {
    setSections(prev => {
      const copy = [...prev];
      copy[secIdx] = {
        ...copy[secIdx],
        items: copy[secIdx].items.filter((_, i) => i !== itemIdx)
      };
      return copy;
    });
  };

  const handleApplyHistoryToEditor = (item) => {
    setVersion(item.version);
    setTitle(item.title);
    setReleaseDate(item.release_date);
    setAuthor(item.author);
    setIsMajor(item.is_major);
    setSummary(item.summary || '');
    if (Array.isArray(item.sections) && item.sections.length > 0) {
      setSections(item.sections);
    }
    setActiveSubTab('editor');
  };

  const handlePreviewHistoryItem = (item) => {
    setPreviewCustomData(item);
    setShowPreviewModal(true);
  };

  const handleDeleteHistoryItem = async (item) => {
    const confirmMsg = `Bạn có chắc chắn muốn xóa bản ghi phiên bản v${item.version} ("${item.title}") khỏi CSDL không?\n\nHành động này không thể hoàn tác!`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(item.id);
      const res = await changelogService.deleteChangelog(item.id);
      if (res?.success) {
        setHistoryList(prev => prev.filter(h => h.id !== item.id));
        alert(`✅ Đã xóa bản ghi v${item.version} thành công!`);
        if (onVersionPublished) onVersionPublished();
      } else {
        alert(res?.error || 'Không thể xóa bản ghi.');
      }
    } catch (err) {
      console.error('Lỗi khi xóa bản ghi phiên bản:', err);
      alert('Lỗi máy chủ khi xóa bản ghi.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveAndPublish = async () => {
    if (!version.trim() || !title.trim()) {
      alert('Vui lòng nhập số phiên bản và tiêu đề.');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        version: version.trim(),
        title: title.trim(),
        release_date: releaseDate.trim(),
        author: author.trim(),
        is_major: isMajor,
        summary: summary.trim(),
        sections
      };

      const res = await changelogService.publishChangelog(payload);
      if (res?.success) {
        alert(`🎉 Chúc mừng! Đã công bố thành công phiên bản ${version}!`);
        loadHistory();
        if (onVersionPublished) onVersionPublished(res.data);
      } else {
        alert(res?.error || 'Không thể lưu phiên bản.');
      }
    } catch (err) {
      console.error('Lỗi khi lưu phiên bản:', err);
      alert('Lỗi máy chủ khi lưu phiên bản cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const currentEditorPreviewData = {
    version,
    title,
    release_date: releaseDate,
    author,
    is_major: isMajor,
    summary,
    sections
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(10, 18, 35, 0.78)',
      backdropFilter: 'blur(8px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      animation: 'fadeIn 0.2s ease-out',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '92vh',
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(15, 44, 89, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1.5px solid #CBD5E1'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.1rem 1.6rem',
          background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.3rem',
              color: '#38BDF8'
            }}>
              <FaRocket />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', letterSpacing: '0.3px' }}>
                QUẢN LÝ PHIÊN BẢN & NHẬT KÝ CẬP NHẬT
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.76rem', color: '#93C5FD' }}>
                Soạn thảo thông tin phiên bản mới, nạp bản vá lỗi và quản lý lịch sử công bố
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Subtabs Bar */}
        <div style={{
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
          padding: '0.5rem 1.6rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              onClick={() => setActiveSubTab('editor')}
              style={{
                padding: '0.42rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeSubTab === 'editor' ? '#0F2C59' : 'transparent',
                color: activeSubTab === 'editor' ? '#FFFFFF' : '#64748B',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FaRocket /> Soạn Thảo Bản Mới
            </button>
            <button
              onClick={() => { setActiveSubTab('history'); loadHistory(); }}
              style={{
                padding: '0.42rem 1.1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: activeSubTab === 'history' ? '#0F2C59' : 'transparent',
                color: activeSubTab === 'history' ? '#FFFFFF' : '#64748B',
                fontWeight: '800',
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <FaHistory /> Lịch Sử Đã Công Bố ({historyList.length})
            </button>
          </div>

          {activeSubTab === 'editor' && (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={handleApplyMajorTemplate}
                style={{
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  color: '#1E40AF',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Tải mẫu cấu trúc Tính Năng Nổi Bật v2.0"
              >
                <FaStar style={{ color: '#D97706' }} /> Mẫu Tính Năng Nổi Bật
              </button>
              <button
                type="button"
                onClick={handleApplyPatchTemplate}
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
                title="Tải mẫu cấu trúc Bản Vá Lỗi & Tối Ưu Hệ Thống"
              >
                <FaBug style={{ color: '#DC2626' }} /> Mẫu Bản Vá Lỗi
              </button>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.2rem 1.6rem', overflowY: 'auto', flex: 1 }}>
          {activeSubTab === 'editor' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              
              {/* Meta Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                    Số phiên bản (Version):
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    placeholder="2.0.0 hoặc 2.0.1"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                    Ngày phát hành:
                  </label>
                  <input
                    type="text"
                    value={releaseDate}
                    onChange={(e) => setReleaseDate(e.target.value)}
                    placeholder="Tháng 08/2026"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                    Tác giả / Đơn vị:
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Nguyễn Vũ Nhật Nam (KHNV)"
                    style={{
                      width: '100%',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Major vs Minor Patch Toggle Switch */}
              <div style={{
                backgroundColor: isMajor ? '#EFF6FF' : '#F8FAFC',
                border: `2px solid ${isMajor ? '#38BDF8' : '#CBD5E1'}`,
                borderRadius: '14px',
                padding: '0.9rem 1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                transition: 'all 0.2s ease'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.92rem', fontWeight: '900', color: isMajor ? '#0284C7' : '#334155' }}>
                    <span>{isMajor ? '🌟 Chế độ: BẢN CẬP NHẬT LỚN (MAJOR)' : '⚪ Chế độ: BẢN VÁ NHỎ LẺ (MINOR PATCH)'}</span>
                  </div>
                  <p style={{ margin: '3px 0 0 0', fontSize: '0.76rem', color: '#64748B', lineHeight: 1.4 }}>
                    {isMajor 
                      ? '👉 BẬT hào quang Neon phát sáng, huy hiệu "🚀 MỚI" và nút lấp lánh ngoài trang đăng nhập để thu hút mọi người xem.' 
                      : '👉 TẮT hiệu ứng phát sáng, thẻ phiên bản ngoài trang đăng nhập hiển thị phẳng êm dịu, không nhấp nháy làm phân tâm.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => setIsMajor(true)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: isMajor ? '2px solid #0284C7' : '1px solid #CBD5E1',
                      backgroundColor: isMajor ? '#0284C7' : '#FFFFFF',
                      color: isMajor ? '#FFFFFF' : '#64748B',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    🌟 Bản Lớn (Nổi bật)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMajor(false)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '8px',
                      border: !isMajor ? '2px solid #475569' : '1px solid #CBD5E1',
                      backgroundColor: !isMajor ? '#475569' : '#FFFFFF',
                      color: !isMajor ? '#FFFFFF' : '#64748B',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    ⚪ Bản Vá (Thanh lịch)
                  </button>
                </div>
              </div>

              {/* Title & Summary */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Tiêu đề bản cập nhật:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '800', color: '#0F2C59', marginBottom: '4px' }}>
                  Lời tựa / Tóm tắt ngắn:
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Mô tả thông điệp chính của bản cập nhật này..."
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.82rem',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Sections List */}
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: '900', color: '#0F2C59' }}>
                    📋 DANH SÁCH NHÓM NỘI DUNG / TÍNH NĂNG ({sections.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '7px',
                      fontWeight: '800',
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem'
                    }}
                  >
                    <FaPlus /> Thêm Nhóm Mới
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {sections.map((sec, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: '#F8FAFC',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.65rem'
                      }}
                    >
                      {/* Section Header Controls */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr auto', gap: '0.5rem', alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Biểu tượng (Icon):</label>
                          <select
                            value={sec.iconName || 'FaStar'}
                            onChange={(e) => handleUpdateSection(sIdx, 'iconName', e.target.value)}
                            style={{ width: '100%', padding: '0.38rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '700' }}
                          >
                            {AVAILABLE_ICONS.map(ic => (
                              <option key={ic.id} value={ic.id}>{ic.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Tiêu đề nhóm:</label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => handleUpdateSection(sIdx, 'title', e.target.value)}
                            style={{ width: '100%', padding: '0.38rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', fontWeight: '700', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: '800', color: '#64748B' }}>Huy hiệu (Badge):</label>
                          <input
                            type="text"
                            value={sec.badge || 'Mới'}
                            onChange={(e) => handleUpdateSection(sIdx, 'badge', e.target.value)}
                            style={{ width: '100%', padding: '0.38rem 0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sIdx)}
                          title="Xóa nhóm này"
                          style={{
                            marginTop: '16px',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            padding: '0.42rem 0.65rem',
                            cursor: 'pointer'
                          }}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      {/* Items list */}
                      <div>
                        <label style={{ fontSize: '0.72rem', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' }}>
                          Các gạch đầu dòng tính năng / sửa lỗi:
                        </label>
                        {Array.isArray(sec.items) && sec.items.map((item, iIdx) => (
                          <div key={iIdx} style={{ display: 'flex', gap: '0.4rem', marginBottom: '4px' }}>
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => handleUpdateItem(sIdx, iIdx, e.target.value)}
                              placeholder="Mô tả cụ thể tính năng hoặc lỗi đã sửa..."
                              style={{
                                flex: 1,
                                padding: '0.35rem 0.6rem',
                                borderRadius: '6px',
                                border: '1px solid #CBD5E1',
                                fontSize: '0.8rem'
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(sIdx, iIdx)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#94A3B8',
                                cursor: 'pointer',
                                padding: '0 4px'
                              }}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddItemToSection(sIdx)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0284C7',
                            fontWeight: '800',
                            fontSize: '0.74rem',
                            cursor: 'pointer',
                            padding: '2px 0',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}
                        >
                          <FaPlus style={{ fontSize: '0.65rem' }} /> Thêm gạch đầu dòng
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            /* History Subtab with View, Edit, and Delete */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {historyList.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontStyle: 'italic' }}>
                  Chưa có lịch sử phiên bản nào được lưu trong CSDL.
                </div>
              ) : (
                historyList.map(h => (
                  <div
                    key={h.id}
                    style={{
                      padding: '0.9rem 1.1rem',
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: '900', color: '#0F2C59', fontSize: '1rem' }}>
                          v{h.version}
                        </span>
                        <span style={{
                          backgroundColor: h.is_major ? '#FEF08A' : '#E2E8F0',
                          color: h.is_major ? '#854D0E' : '#475569',
                          fontSize: '0.65rem',
                          fontWeight: '900',
                          padding: '1px 6px',
                          borderRadius: '999px'
                        }}>
                          {h.is_major ? '🌟 BẢN LỚN' : '⚪ BẢN VÁ'}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                          ({Array.isArray(h.sections) ? h.sections.length : 0} nhóm tính năng)
                        </span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155', marginTop: '3px' }}>
                        {h.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '1px' }}>
                        📅 {h.release_date} • 👤 {h.author}
                      </div>
                    </div>

                    {/* Action Buttons: View, Edit, Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => handlePreviewHistoryItem(h)}
                        style={{
                          padding: '0.42rem 0.75rem',
                          backgroundColor: '#F0F9FF',
                          border: '1px solid #BAE6FD',
                          color: '#0284C7',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Xem giao diện modal của bản ghi này"
                      >
                        <FaEye /> Xem
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyHistoryToEditor(h)}
                        style={{
                          padding: '0.42rem 0.75rem',
                          backgroundColor: '#EFF6FF',
                          border: '1px solid #BFDBFE',
                          color: '#1E40AF',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Nạp dữ liệu bản ghi này vào tab Soạn Thảo để chỉnh sửa"
                      >
                        <FaEdit /> Sửa
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteHistoryItem(h)}
                        disabled={deletingId === h.id}
                        style={{
                          padding: '0.42rem 0.65rem',
                          backgroundColor: '#FEF2F2',
                          border: '1px solid #FECACA',
                          color: '#DC2626',
                          borderRadius: '7px',
                          fontWeight: '800',
                          fontSize: '0.78rem',
                          cursor: deletingId === h.id ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}
                        title="Xóa vĩnh viễn bản ghi này khỏi CSDL"
                      >
                        {deletingId === h.id ? <FaSpinner className="spinner" /> : <FaTrash />} Xóa
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '0.85rem 1.6rem',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <button
            type="button"
            onClick={() => {
              setPreviewCustomData(currentEditorPreviewData);
              setShowPreviewModal(true);
            }}
            style={{
              padding: '0.5rem 1.1rem',
              backgroundColor: '#F1F5F9',
              border: '1.5px solid #CBD5E1',
              color: '#1E293B',
              borderRadius: '9px',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <FaEye /> 👁️ Xem Trước (Live Preview)
          </button>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'transparent',
                border: '1px solid #CBD5E1',
                color: '#64748B',
                borderRadius: '9px',
                fontWeight: '700',
                fontSize: '0.84rem',
                cursor: 'pointer'
              }}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAndPublish}
              disabled={saving}
              style={{
                padding: '0.5rem 1.4rem',
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9px',
                fontWeight: '900',
                fontSize: '0.86rem',
                cursor: saving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                boxShadow: '0 3px 10px rgba(2, 132, 199, 0.3)'
              }}
            >
              {saving ? <><FaSpinner className="spinner" /> Đang lưu...</> : <><FaSave /> 🚀 Lưu & Công Bố Ngay</>}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <VersionChangelogModal
          isOpen={true}
          onClose={() => {
            setShowPreviewModal(false);
            setPreviewCustomData(null);
          }}
          customChangelog={previewCustomData || currentEditorPreviewData}
        />
      )}
    </div>
  );
};

export default VersionManageModal;
