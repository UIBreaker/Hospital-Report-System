import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import {
  FaUser,
  FaUserMd,
  FaUserNurse,
  FaHospital,
  FaIdCard,
  FaPhone,
  FaEnvelope,
  FaSignature,
  FaLock,
  FaKey,
  FaSave,
  FaArrowLeft,
  FaCamera,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaFileAlt,
  FaEye,
  FaEdit,
  FaShieldAlt,
  FaClock,
  FaCalendarAlt,
  FaSignOutAlt,
  FaTimes,
  FaSync,
  FaEraser,
  FaCloudUploadAlt,
  FaCheck,
  FaLaptopMedical,
  FaAward,
  FaStethoscope,
  FaAmbulance,
  FaProcedures
} from 'react-icons/fa';
import profileService from '../services/profileService';
import userManageService from '../services/systemUserService';
import { uploadSingleMedicalImage } from '../services/uploadService';
import MedicalLoader from '../components/common/MedicalLoader';

// 8 Medical Avatar Presets (SVG/Emoji representations that cost 0 DB space)
const AVATAR_PRESETS = [
  { id: 'preset_doc_m', label: 'Bác Sĩ Nam', icon: '👨‍⚕️', bg: '#DBEAFE', color: '#1D4ED8' },
  { id: 'preset_doc_f', label: 'Bác Sĩ Nữ', icon: '👩‍⚕️', bg: '#FCE7F3', color: '#BE185D' },
  { id: 'preset_nurse_m', label: 'Điều Dưỡng Nam', icon: '🧑‍⚕️', bg: '#DCFCE7', color: '#15803D' },
  { id: 'preset_nurse_f', label: 'Điều Dưỡng Nữ', icon: '👩‍⚕️', bg: '#FEF3C7', color: '#B45309' },
  { id: 'preset_surgeon', label: 'Phẫu Thuật Viên', icon: '😷', bg: '#EDE9FE', color: '#6D28D9' },
  { id: 'preset_admin', label: 'Ban Quản Trị', icon: '🏛️', bg: '#F1F5F9', color: '#0F2C59' },
  { id: 'preset_tech', label: 'Kỹ Thuật Viên', icon: '🔬', bg: '#E0F2FE', color: '#0369A1' },
  { id: 'preset_hospital', label: 'Logo Bệnh Viện', icon: '🏥', bg: '#EFF6FF', color: '#2563EB' }
];

const ProfilePage = () => {
  const { user, updateCurrentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Active Tab: 'info' | 'stats' | 'signature' | 'security'
  const [activeTab, setActiveTab] = useState('info');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    full_name: '',
    phone: '',
    email: '',
    certificate: '',
    position: '',
    bio: '',
    avatar_url: '',
    signature_url: ''
  });

  // Operational Stats & Accessible Forms
  const [stats, setStats] = useState(null);
  const [accessibleForms, setAccessibleForms] = useState([]);

  // Change Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Avatar Modal
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Signature Pad State
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Fetch complete profile on mount
  const loadProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await profileService.getProfile();
      if (res && res.success) {
        const p = res.data.profile;
        setProfileData({
          full_name: p.full_name || '',
          phone: p.phone || '',
          email: p.email || '',
          certificate: p.certificate || '',
          position: p.position || '',
          bio: p.bio || '',
          avatar_url: p.avatar_url || '',
          signature_url: p.signature_url || ''
        });
        setCustomAvatarUrl(p.avatar_url || '');
        setStats(res.data.stats || null);
        setAccessibleForms(res.data.accessibleForms || []);
        
        // Sync context
        updateCurrentUser(p);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setErrorMsg(err.response?.data?.error || 'Không thể tải thông tin hồ sơ.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // Initialize signature canvas when switching to 'signature' tab
  useEffect(() => {
    if (activeTab === 'signature' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0F2C59';

      if (profileData.signature_url && profileData.signature_url.startsWith('data:image')) {
        const img = new window.Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        };
        img.src = profileData.signature_url;
      }
    }
  }, [activeTab, profileData.signature_url]);

  // Handle saving general profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await profileService.updateProfile(profileData);
      if (res && res.success) {
        setSuccessMsg('✓ Đã lưu thông tin hồ sơ chuyên môn thành công!');
        updateCurrentUser(profileData);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Lỗi khi cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload / URL selection
  const handleSelectPresetAvatar = async (presetId) => {
    try {
      setUploadingAvatar(true);
      const res = await profileService.updateAvatar(presetId);
      if (res && res.success) {
        setProfileData(prev => ({ ...prev, avatar_url: presetId }));
        updateCurrentUser({ avatar_url: presetId });
        setShowAvatarModal(false);
        setSuccessMsg('✓ Đã cập nhật ảnh đại diện!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Không thể lưu ảnh đại diện: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleApplyCustomAvatarUrl = async () => {
    if (!customAvatarUrl.trim()) return;
    try {
      setUploadingAvatar(true);
      const res = await profileService.updateAvatar(customAvatarUrl.trim());
      if (res && res.success) {
        setProfileData(prev => ({ ...prev, avatar_url: customAvatarUrl.trim() }));
        updateCurrentUser({ avatar_url: customAvatarUrl.trim() });
        setShowAvatarModal(false);
        setSuccessMsg('✓ Đã cập nhật đường dẫn ảnh đại diện!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      alert('Lỗi lưu URL ảnh: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleFileUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const uploaded = await uploadSingleMedicalImage(file);
      if (uploaded && uploaded.url) {
        const res = await profileService.updateAvatar(uploaded.url);
        if (res && res.success) {
          setProfileData(prev => ({ ...prev, avatar_url: uploaded.url }));
          setCustomAvatarUrl(uploaded.url);
          updateCurrentUser({ avatar_url: uploaded.url });
          setShowAvatarModal(false);
          setSuccessMsg('✓ Đã tải và nén ảnh đại diện thành công!');
          setTimeout(() => setSuccessMsg(''), 3000);
        }
      }
    } catch (err) {
      alert('Lỗi tải ảnh: ' + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Signature Pad Handlers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCoordinates(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSaveSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');

    setSaving(true);
    setErrorMsg('');
    try {
      const res = await profileService.updateSignature(dataUrl);
      if (res && res.success) {
        setProfileData(prev => ({ ...prev, signature_url: dataUrl }));
        updateCurrentUser({ signature_url: dataUrl });
        setSuccessMsg('✓ Đã lưu chữ ký điện tử mẫu thành công!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Lỗi khi lưu chữ ký.');
    } finally {
      setSaving(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMsg('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    setChangingPassword(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await userManageService.changePassword({
        username: user?.username,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (res && res.success) {
        setSuccessMsg('✓ Đổi mật khẩu thành công! Mật khẩu mới đã được áp dụng.');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Lỗi khi đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  };

  // Render Avatar
  const renderAvatarPreview = (avatarUrl, size = 90) => {
    if (!avatarUrl) {
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.45}px`,
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.15)',
          border: '3px solid #BFDBFE'
        }}>
          {user?.role === 'admin' ? <FaShieldAlt /> : <FaUserMd />}
        </div>
      );
    }

    const preset = AVATAR_PRESETS.find(p => p.id === avatarUrl);
    if (preset) {
      return (
        <div style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: preset.bg,
          color: preset.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${size * 0.48}px`,
          boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
          border: `3px solid ${preset.color}44`
        }}>
          {preset.icon}
        </div>
      );
    }

    return (
      <img
        src={avatarUrl}
        alt="Avatar"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid #2563EB',
          boxShadow: '0 6px 18px rgba(37, 99, 235, 0.2)'
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    );
  };

  if (loading) {
    return (
      <MedicalLoader
        text="Đang tải hồ sơ cán bộ..."
        subtext="TTYT Khu Vực Bình Long • Hệ Thống Báo Cáo Giao Ban"
        minHeight="100vh"
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      paddingBottom: '4rem'
    }}>
      
      {/* Top Header Navigation */}
      <header style={{
        backgroundColor: '#0F2C59',
        color: '#FFFFFF',
        padding: '0.85rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(15, 44, 89, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#FFFFFF',
              borderRadius: '9px',
              padding: '0.45rem 0.85rem',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <FaArrowLeft /> Quay lại
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '900', letterSpacing: '0.3px' }}>
                HỒ SƠ CÁ NHÂN & CHUYÊN MÔN
              </h1>
              <div style={{ fontSize: '0.72rem', color: '#93C5FD' }}>
                TTYT KHU VỰC BÌNH LONG • SỞ Y TẾ ĐỒNG NAI
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          style={{
            backgroundColor: '#EF4444',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '0.45rem 0.9rem',
            fontWeight: '800',
            fontSize: '0.82rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          <FaSignOutAlt /> Đăng xuất
        </button>
      </header>

      {/* Main Content Container */}
      <main style={{ maxWidth: '1100px', margin: '1.75rem auto 0', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* 1. HERO IDENTITY CARD */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          border: '1.5px solid #E2E8F0',
          boxShadow: '0 10px 30px rgba(15, 44, 89, 0.06)',
          padding: '2rem 2.2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '6px',
            background: 'linear-gradient(90deg, #2563EB 0%, #10B981 50%, #7C3AED 100%)'
          }} />

          {/* Left: Avatar + Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAvatarModal(true)} title="Nhấp để đổi ảnh đại diện">
              {renderAvatarPreview(profileData.avatar_url, 95)}
              <div style={{
                position: 'absolute',
                bottom: '2px',
                right: '2px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                border: '2px solid #FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}>
                <FaCamera />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: '900', color: '#0F2C59' }}>
                  {profileData.full_name || user?.username}
                </h2>
                <span style={{
                  backgroundColor: '#EFF6FF',
                  color: '#1E40AF',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontWeight: '800',
                  fontSize: '0.76rem',
                  border: '1px solid #BFDBFE'
                }}>
                  @{user?.username}
                </span>
                <span style={{
                  backgroundColor: '#DCFCE7',
                  color: '#15803D',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '20px',
                  fontWeight: '800',
                  fontSize: '0.76rem'
                }}>
                  🟢 Đang hoạt động
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#475569', fontSize: '0.88rem', fontWeight: '600', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#0F2C59', fontWeight: '700' }}>
                  <FaHospital style={{ color: '#2563EB' }} /> {user?.departmentName || 'Trung Tâm Y Tế'}
                </span>
                {profileData.position && (
                  <span>• Chức vụ: <strong style={{ color: '#1D4ED8' }}>{profileData.position}</strong></span>
                )}
                {profileData.certificate && (
                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.15rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: '800' }}>
                    CCHN: {profileData.certificate}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action */}
          <button
            type="button"
            onClick={() => setShowAvatarModal(true)}
            style={{
              backgroundColor: '#F1F5F9',
              color: '#1E40AF',
              border: '1.5px solid #BFDBFE',
              borderRadius: '12px',
              padding: '0.65rem 1.15rem',
              fontWeight: '800',
              fontSize: '0.84rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            <FaCamera /> Đổi Ảnh Đại Diện
          </button>
        </div>

        {/* Success / Error Alerts */}
        {successMsg && (
          <div style={{
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            border: '1.5px solid #86EFAC',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1.5px solid #FECACA',
            borderRadius: '14px',
            padding: '0.85rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '800',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem'
          }}>
            <FaExclamationTriangle /> {errorMsg}
          </div>
        )}

        {/* 2. 4 PROFESSIONAL TABS HEADER */}
        <div style={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          padding: '6px',
          border: '1.5px solid #E2E8F0',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(15, 44, 89, 0.03)',
          flexWrap: 'wrap'
        }}>
          {[
            { key: 'info', label: 'Hồ Sơ Chuyên Môn', icon: FaUserMd },
            { key: 'stats', label: `Thống Kê & Biểu Mẫu (${accessibleForms.length})`, icon: FaChartLine },
            { key: 'signature', label: 'Chữ Ký Điện Tử Mẫu', icon: FaSignature },
            { key: 'security', label: 'Bảo Mật & Mật Khẩu', icon: FaLock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1,
                  minWidth: '180px',
                  backgroundColor: isActive ? '#0F2C59' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#475569',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 1.1rem',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: isActive ? '0 4px 14px rgba(15, 44, 89, 0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon style={{ color: isActive ? '#38BDF8' : '#64748B', fontSize: '1rem' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: HỒ SƠ CHUYÊN MÔN & THÔNG TIN ĐỊNH DANH             */}
        {/* ========================================================= */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveProfile} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            padding: '2rem 2.2rem',
            boxShadow: '0 6px 24px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                Thông Tin Định Danh & Hồ Sơ Y Tế
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                Thông tin này sẽ được tự động trích xuất vào các báo cáo ca trực và phiếu giao ban của trung tâm.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              
              {/* Họ và tên */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Họ và tên đầy đủ: <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={profileData.full_name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Ví dụ: BS.CKI Nguyễn Văn A"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Chức vụ / Vị trí chuyên môn */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Chức vụ / Vị trí chuyên môn:
                </label>
                <input
                  type="text"
                  value={profileData.position}
                  onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Ví dụ: Bác sĩ điều trị / Điều dưỡng trưởng / KTV"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Số Chứng chỉ hành nghề (CCHN) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Số Chứng chỉ hành nghề (CCHN):
                </label>
                <input
                  type="text"
                  value={profileData.certificate}
                  onChange={(e) => setProfileData(prev => ({ ...prev, certificate: e.target.value }))}
                  placeholder="Ví dụ: 001234/ĐN-CCHN"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Số điện thoại */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Số điện thoại liên hệ:
                </label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ví dụ: 0912345678 hoặc máy nhánh nội bộ"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Email công vụ / liên hệ:
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ví dụ: bacsi.nguyenvana@gmail.com"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    color: '#0F2C59',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Khoa phòng (Chỉ đọc) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#64748B', marginBottom: '0.4rem' }}>
                  Khoa / Phòng công tác (Cố định):
                </label>
                <input
                  type="text"
                  disabled
                  value={user?.departmentName || 'Trung Tâm Y Tế'}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    color: '#64748B',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Ghi chú / Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                Ghi chú chuyên môn / Quá trình công tác:
              </label>
              <textarea
                rows={3}
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Ghi chú thêm về ca trực, lĩnh vực phụ trách hoặc thông tin liên lạc khẩn cấp..."
                style={{
                  width: '100%',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  fontSize: '0.88rem',
                  color: '#0F2C59',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Submit Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1.5px solid #F1F5F9', paddingTop: '1.25rem' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.15s ease'
                }}
              >
                {saving ? 'Đang lưu...' : <><FaSave /> Lưu Thay Đổi Hồ Sơ</>}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* TAB 2: THỐNG KÊ HOẠT ĐỘNG & BIỂU MẪU ĐƯỢC PHÂN QUYỀN      */}
        {/* ========================================================= */}
        {activeTab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                  <FaCalendarAlt />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BÁO CÁO GIAO BAN</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#0F2C59' }}>{stats?.totalReports || 0}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                  <FaFileAlt />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BẢN GHI BIỂU MẪU ĐÃ NỘP</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#16A34A' }}>{stats?.totalCustomSubmissions || 0}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                  <FaProcedures />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>CA BỆNH GIAO BAN</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#D97706' }}>{stats?.totalCases || 0}</div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0', padding: '1.25rem', boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: '#F3E8FF', color: '#7E22CE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.35rem' }}>
                  <FaShieldAlt />
                </div>
                <div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '800', textTransform: 'uppercase' }}>BIỂU MẪU ĐƯỢC CẤP QUYỀN</div>
                  <div style={{ fontSize: '1.55rem', fontWeight: '900', color: '#7E22CE' }}>{stats?.totalFormsAccessible || 0}</div>
                </div>
              </div>
            </div>

            {/* List of Accessible Forms */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1.5px solid #E2E8F0',
              padding: '1.75rem 2rem',
              boxShadow: '0 6px 24px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                    Danh Sách Biểu Mẫu Bạn Có Quyền Truy Cập
                  </h3>
                  <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                    Phân định rõ biểu mẫu bạn được phép điền nộp dữ liệu hoặc chỉ có quyền xem báo cáo.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
                    ✍️ Được nộp: {stats?.editableFormsCount || 0}
                  </span>
                  <span style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.3rem 0.75rem', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '800' }}>
                    👁️ Chỉ xem: {stats?.viewOnlyFormsCount || 0}
                  </span>
                </div>
              </div>

              {accessibleForms.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                  <FaFileAlt style={{ fontSize: '2.5rem', marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontWeight: '700' }}>Chưa có biểu mẫu nào được phân quyền cho tài khoản này.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                  {accessibleForms.map(form => {
                    const isEdit = form.userPermission === 'edit';
                    return (
                      <div
                        key={form.id}
                        style={{
                          backgroundColor: '#F8FAFC',
                          borderRadius: '16px',
                          border: '1.5px solid #E2E8F0',
                          borderLeft: `5px solid ${isEdit ? '#10B981' : '#F59E0B'}`,
                          padding: '1.1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '0.85rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                            <span style={{
                              backgroundColor: isEdit ? '#DCFCE7' : '#FEF3C7',
                              color: isEdit ? '#15803D' : '#92400E',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              fontWeight: '800'
                            }}>
                              {isEdit ? '✍️ Được Nộp Báo Cáo' : '👁️ Chỉ Xem Dữ Liệu'}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#64748B' }}>
                              /{form.code}
                            </span>
                          </div>
                          <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.96rem' }}>
                            {form.title}
                          </div>
                          {form.description && (
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '0.2rem' }}>
                              {form.description}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #E2E8F0', paddingTop: '0.65rem' }}>
                          <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '700' }}>
                            {form.total_submissions || 0} bản ghi
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate(isEdit ? `/custom-forms/${form.code}` : `/custom-forms/${form.code}/view`)}
                            style={{
                              backgroundColor: isEdit ? '#2563EB' : '#475569',
                              color: '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '0.35rem 0.75rem',
                              fontWeight: '800',
                              fontSize: '0.76rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            {isEdit ? <><FaEdit /> Nhập Liệu</> : <><FaEye /> Xem Dữ Liệu</>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: CHỮ KÝ ĐIỆN TỬ MẪU (DIGITAL SIGNATURE PAD)         */}
        {/* ========================================================= */}
        {activeTab === 'signature' && (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            padding: '2rem 2.2rem',
            boxShadow: '0 6px 24px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                Quản Lý Chữ Ký Điện Tử Mẫu
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                Ký tay trực tiếp trên khung dưới đây. Khi in phiếu báo cáo giao ban chuyên môn, hệ thống sẽ tự động chèn chữ ký của bạn vào chân trang.
              </p>
            </div>

            <div style={{
              backgroundColor: '#F8FAFC',
              borderRadius: '16px',
              border: '2px dashed #CBD5E1',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem'
            }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FaSignature style={{ color: '#2563EB' }} /> Khung ký tay điện tử:
                </span>
                <button
                  type="button"
                  onClick={handleClearSignature}
                  style={{
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <FaEraser /> Xóa chữ ký để vẽ lại
                </button>
              </div>

              <canvas
                ref={canvasRef}
                width={560}
                height={170}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  height: '170px',
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #CBD5E1',
                  cursor: 'crosshair',
                  touchAction: 'none',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.04)'
                }}
              />
              <span style={{ fontSize: '0.74rem', color: '#94A3B8', fontStyle: 'italic' }}>
                Mẹo: Có thể dùng chuột, bút cảm ứng hoặc vuốt ngón tay trên điện thoại / máy tính bảng để ký.
              </span>
            </div>

            {/* Save Signature Action Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', borderTop: '1.5px solid #F1F5F9', paddingTop: '1.25rem' }}>
              <button
                type="button"
                onClick={handleSaveSignature}
                disabled={saving}
                style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
                }}
              >
                {saving ? 'Đang lưu...' : <><FaSave /> Lưu Chữ Ký Điện Tử Mẫu</>}
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: BẢO MẬT & ĐỔI MẬT KHẨU TÀI KHOẢN                   */}
        {/* ========================================================= */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #E2E8F0',
            padding: '2rem 2.2rem',
            boxShadow: '0 6px 24px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div style={{ borderBottom: '1.5px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '900', color: '#0F2C59' }}>
                Bảo Mật & Đổi Mật Khẩu
              </h3>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.84rem', color: '#64748B' }}>
                Khuyến nghị đổi mật khẩu định kỳ 3–6 tháng để bảo đảm an toàn dữ liệu y tế.
              </p>
            </div>

            <div style={{ maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Mật khẩu hiện tại: <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Nhập mật khẩu đang sử dụng"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Mật khẩu mới: <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Tối thiểu 6 ký tự"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.4rem' }}>
                  Xác nhận mật khẩu mới: <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="password"
                  required
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Nhập lại mật khẩu mới"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1.5px solid #F1F5F9', paddingTop: '1.25rem' }}>
              <button
                type="submit"
                disabled={changingPassword}
                style={{
                  backgroundColor: '#0F2C59',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: '800',
                  fontSize: '0.92rem',
                  cursor: changingPassword ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(15, 44, 89, 0.25)'
                }}
              >
                {changingPassword ? 'Đang cập nhật...' : <><FaKey /> Đổi Mật Khẩu Ngay</>}
              </button>
            </div>
          </form>
        )}

      </main>

      {/* ========================================================= */}
      {/* AVATAR MANAGEMENT MODAL                                   */}
      {/* ========================================================= */}
      {showAvatarModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 44, 89, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 99999
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            maxWidth: '560px',
            width: '100%',
            padding: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', paddingBottom: '0.85rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '900', color: '#0F2C59', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FaCamera style={{ color: '#2563EB' }} /> Chọn Ảnh Đại Diện
              </h3>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                style={{ backgroundColor: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Section 1: Presets (0 DB Cost) */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.75rem' }}>
                1. Chọn Avatar Biểu Tượng Y Tế Mẫu (Tiết kiệm dung lượng):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {AVATAR_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPresetAvatar(preset.id)}
                    style={{
                      backgroundColor: preset.bg,
                      border: profileData.avatar_url === preset.id ? `2.5px solid ${preset.color}` : '1.5px solid #CBD5E1',
                      borderRadius: '16px',
                      padding: '0.85rem 0.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      cursor: 'pointer',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '1.85rem' }}>{preset.icon}</span>
                    <span style={{ fontSize: '0.72rem', fontWeight: '800', color: preset.color, textAlign: 'center' }}>
                      {preset.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Upload File (Auto-Compressed to Cloud URL) */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.5rem' }}>
                2. Tải ảnh từ máy tính / điện thoại (Tự động nén siêu nhẹ):
              </div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.65rem',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                border: '1.5px dashed #93C5FD',
                borderRadius: '12px',
                padding: '0.85rem 1rem',
                cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                fontWeight: '800',
                fontSize: '0.86rem'
              }}>
                <FaCloudUploadAlt style={{ fontSize: '1.3rem' }} />
                {uploadingAvatar ? 'Đang nén và tải ảnh...' : 'Chọn tệp ảnh đại diện'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUploadAvatar}
                  disabled={uploadingAvatar}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            {/* Section 3: Direct URL */}
            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.5rem' }}>
                3. Hoặc dán trực tiếp đường dẫn URL ảnh:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  style={{
                    flex: 1,
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyCustomAvatarUrl}
                  disabled={uploadingAvatar || !customAvatarUrl.trim()}
                  style={{
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '0.65rem 1.25rem',
                    fontWeight: '800',
                    fontSize: '0.84rem',
                    cursor: 'pointer'
                  }}
                >
                  Áp Dụng
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfilePage;
