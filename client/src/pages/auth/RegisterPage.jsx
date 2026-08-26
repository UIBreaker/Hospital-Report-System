import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaHospital, 
  FaLock, 
  FaUser, 
  FaIdBadge, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaShieldAlt,
  FaClock,
  FaChartBar,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaInfoCircle,
  FaCheck,
  FaHeartbeat,
  FaExpand,
  FaCompress
} from 'react-icons/fa';
import authService from '../../services/authService';
import MedicalAuthBackground from '../../components/common/MedicalAuthBackground';

const DEPARTMENTS = [
  { code: 'personal', name: '👤 Tài khoản cá nhân (Không thuộc khoa cố định - Chỉ dùng Form phân quyền)' },
  { code: 'lck', name: 'Khoa Liên Chuyên Khoa' },
  { code: 'xn', name: 'Khoa Xét nghiệm' },
  { code: 'cdha', name: 'Khoa Chẩn đoán hình ảnh' },
  { code: 'hscc_tnt', name: 'Khoa Hồi sức cấp cứu - Thận nhân tạo' },
  { code: 'noi', name: 'Khoa Nội' },
  { code: 'nhi', name: 'Khoa Nhi' },
  { code: 'nhiem', name: 'Khoa Nhiễm' },
  { code: 'san', name: 'Khoa Sản' },
  { code: 'yhct_phcn', name: 'Khoa Y học cổ truyền - Phục hồi chức năng' },
  { code: 'ngoai_th', name: 'Khoa Ngoại tổng hợp' },
  { code: 'ctch', name: 'Khoa Chấn thương chỉnh hình' },
  { code: 'gmhs', name: 'Khoa Gây mê Hồi sức' }
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [departmentCode, setDepartmentCode] = useState('personal');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  // Mark intro as already seen in this session so returning to login doesn't re-trigger it
  useEffect(() => {
    sessionStorage.setItem('portal_intro_shown', 'true');
  }, []);

  // Fullscreen Change Listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim() || !username.trim() || !password || !confirmPassword) {
      setErrorMsg('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMsg('Tên đăng nhập phải có ít nhất 3 ký tự.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Xác nhận mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.register({
        full_name: fullName.trim(),
        username: username.trim(),
        password,
        department_code: departmentCode
      });

      if (res && res.success) {
        setSuccessData(res.data || { username, full_name: fullName });
      }
    } catch (err) {
      const rawErr = err.response?.data?.error || err.response?.data?.message || err.message;
      setErrorMsg(typeof rawErr === 'string' ? rawErr : (rawErr?.message || 'Đăng ký không thành công. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  };

  const isPasswordMatch = password && confirmPassword && password === confirmPassword;

  return (
    <div className="hide-scrollbar" style={{
      height: '100vh',
      maxHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      boxSizing: 'border-box'
    }}>

      {/* Floating Fullscreen F11 Quick Toggle */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Thoát toàn màn hình (Esc / F11)' : 'Bật toàn màn hình (F11)'}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1.2rem',
          zIndex: 99,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          border: '1.5px solid #BAE6FD',
          color: '#0284C7',
          padding: '0.42rem 0.85rem',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.78rem',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(15, 44, 89, 0.08)',
          backdropFilter: 'blur(10px)',
          transition: 'all 0.22s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = '#0284C7';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.85)';
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = '#BAE6FD';
        }}
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
        <span>{isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình (F11)'}</span>
      </button>

      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @keyframes regBloomExpand {
          0% { opacity: 0; transform: scale(0.97); filter: blur(8px); }
          100% { opacity: 1; transform: scale(1); filter: blur(0px); }
        }

        @keyframes haloSpinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes haloSpinReverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }

        .reg-input-field:focus {
          border-color: #0284C7 !important;
          background-color: #FFFFFF !important;
          box-shadow: 0 0 0 3.5px rgba(2, 132, 199, 0.15) !important;
        }

        .reg-feature-hover {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reg-feature-hover:hover {
          transform: translateY(-2px) scale(1.012);
          border-color: #BAE6FD !important;
          box-shadow: 0 8px 25px rgba(2, 132, 199, 0.12) !important;
          background: rgba(255, 255, 255, 0.96) !important;
        }
      `}</style>

      {/* Synchronized Daytime Hospital Garden & Emerald Medical Healing Background */}
      <MedicalAuthBackground />

      {/* Main Container Grid */}
      <main style={{
        flex: 1,
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0.4rem 2rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.15fr',
        gap: '3rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        minHeight: 0,
        animation: 'regBloomExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>

        {/* ================= LEFT COLUMN: BRAND & REGISTRATION INFO ================= */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '510px' }}>
          
          {/* Logo with Rotating Laser Rings */}
          <div style={{ position: 'relative', width: '82px', height: '82px', marginBottom: '0.1rem' }}>
            <div style={{
              position: 'absolute',
              inset: '-7px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(2, 132, 199, 0.45)',
              animation: 'haloSpinSlow 16s linear infinite',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-2px',
              borderRadius: '50%',
              border: '1.5px solid rgba(13, 148, 136, 0.4)',
              borderTopColor: 'transparent',
              borderBottomColor: 'transparent',
              animation: 'haloSpinReverse 9s linear infinite',
              pointerEvents: 'none'
            }} />
            <div style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px',
              boxShadow: '0 4px 20px rgba(2, 132, 199, 0.25), 0 0 0 3px rgba(255, 255, 255, 0.95)',
              boxSizing: 'border-box'
            }}>
              <img 
                src="/logo.png" 
                alt="Logo TTYT Bình Long" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>

          {/* Headings */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              color: '#1D4ED8',
              padding: '0.24rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: '900',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
              marginBottom: '0.45rem',
              boxShadow: '0 2px 8px rgba(29, 78, 216, 0.08)'
            }}>
              <FaHospital style={{ color: '#0284C7' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            <h1 style={{
              fontSize: '2.05rem',
              fontWeight: '900',
              color: '#0F2C59',
              margin: '0 0 0.1rem 0',
              lineHeight: '1.15',
              textTransform: 'uppercase',
              letterSpacing: '0.8px'
            }}>
              ĐĂNG KÝ TÀI KHOẢN
            </h1>

            <h2 style={{
              fontSize: '2.15rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
              lineHeight: '1.15',
              margin: '0 0 0.35rem 0',
              backgroundImage: 'linear-gradient(135deg, #0284C7 0%, #0D9488 60%, #059669 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline-block'
            }}>
              CỔNG Y TẾ BÌNH LONG
            </h2>

            <p style={{
              fontSize: '0.84rem',
              color: '#475569',
              lineHeight: '1.45',
              margin: 0,
              maxWidth: '450px'
            }}>
              Tạo tài khoản cán bộ nhân viên khoa phòng hoặc cá nhân để được phân quyền nhập và theo dõi báo cáo giao ban y khoa trực tuyến.
            </p>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.15rem' }}>
            <div className="reg-feature-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.55rem 0.95rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#EFF6FF',
                border: '1px solid #BFDBFE',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                flexShrink: 0
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Bảo Mật & Phê Duyệt An Toàn</div>
                <div style={{ color: '#64748B', fontSize: '0.74rem' }}>Mọi tài khoản đều được Ban Giám Đốc / Admin duyệt trước khi kích hoạt</div>
              </div>
            </div>

            <div className="reg-feature-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.88)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.55rem 0.95rem',
              borderRadius: '14px',
              border: '1.5px solid rgba(255, 255, 255, 0.95)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.06)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem',
                flexShrink: 0
              }}>
                <FaUser />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.85rem' }}>Đa Dạng Loại Hình Tài Khoản</div>
                <div style={{ color: '#64748B', fontSize: '0.74rem' }}>Đăng ký tài khoản theo 13 chuyên khoa hoặc tài khoản cá nhân linh hoạt</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: PRISTINE WHITE GLASS REGISTRATION CARD (HÌNH 1) ================= */}
        <section style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'rgba(255, 255, 255, 0.93)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '24px',
            padding: '1.4rem 1.85rem',
            boxShadow: '0 20px 60px rgba(15, 44, 89, 0.15), 0 0 0 1px rgba(2, 132, 199, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
            border: '1.5px solid rgba(255, 255, 255, 1)',
            boxSizing: 'border-box'
          }}>

            {/* Top Shield Icon Badge */}
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.55rem auto',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.12)'
            }}>
              <FaUserPlus style={{ fontSize: '1.45rem', color: '#0284C7' }} />
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '1.38rem',
              fontWeight: '900',
              color: '#0F2C59',
              margin: '0 0 0.15rem 0',
              textAlign: 'center',
              letterSpacing: '0.4px',
              whiteSpace: 'nowrap'
            }}>
              TẠO TÀI KHOẢN MỚI
            </h3>

            <p style={{
              fontSize: '0.8rem',
              color: '#64748B',
              margin: '0 0 0.85rem 0',
              textAlign: 'center'
            }}>
              Điền thông tin bên dưới để gửi yêu cầu cấp quyền tài khoản
            </p>

            {/* Error Alert */}
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #F87171',
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                color: '#991B1B',
                fontSize: '0.82rem',
                marginBottom: '0.85rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.55rem',
                lineHeight: '1.35'
              }}>
                <FaInfoCircle style={{ color: '#DC2626', fontSize: '1.05rem', marginTop: '1px', flexShrink: 0 }} />
                <span>{typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi đăng ký')}</span>
              </div>
            )}

            {/* Success State */}
            {successData ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <FaCheckCircle style={{ fontSize: '3.5rem', color: '#10B981', marginBottom: '0.85rem' }} />
                <h3 style={{ fontSize: '1.35rem', fontWeight: '900', color: '#065F46', margin: '0 0 0.4rem 0' }}>
                  ĐĂNG KÝ THÀNH CÔNG!
                </h3>
                <div style={{
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '1rem',
                  fontSize: '0.88rem',
                  color: '#166534',
                  lineHeight: '1.55',
                  marginBottom: '1.25rem',
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 0.4rem 0' }}>
                    Tài khoản: <strong style={{ color: '#0284C7' }}>@{successData.username}</strong> ({successData.full_name})
                  </p>
                  <p style={{ margin: 0 }}>
                    ⏳ Hồ sơ của bạn đã được chuyển đến <strong>Quản Trị Viên (Admin)</strong> để kiểm tra và phê duyệt. Bạn có thể liên hệ Admin để kích hoạt tài khoản ngay!
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link
                    to="/"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '0.65rem 1.5rem',
                      borderRadius: '10px',
                      fontWeight: '900',
                      fontSize: '0.9rem',
                      boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    <FaArrowLeft /> Trở về Trang Đăng Nhập
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Field 1: Full Name */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.2px'
                  }}>
                    Họ và tên nhân viên *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaIdBadge style={{
                      position: 'absolute',
                      top: '50%',
                      left: '0.95rem',
                      transform: 'translateY(-50%)',
                      color: '#0284C7',
                      fontSize: '0.88rem'
                    }} />
                    <input
                      className="reg-input-field"
                      type="text"
                      placeholder="VD: BS. Nguyễn Văn A, ĐD. Trần Thị B..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.62rem 0.85rem 0.62rem 2.55rem',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        outline: 'none',
                        backgroundColor: '#F8FAFC',
                        color: '#0F2C59',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Department Selector with Personal Account Option */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.2px'
                  }}>
                    Khoa / Phòng trực thuộc *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaHospital style={{
                      position: 'absolute',
                      top: '50%',
                      left: '0.95rem',
                      transform: 'translateY(-50%)',
                      color: '#0284C7',
                      fontSize: '0.88rem',
                      zIndex: 1
                    }} />
                    <select
                      className="reg-input-field"
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.62rem 0.85rem 0.62rem 2.55rem',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.86rem',
                        outline: 'none',
                        backgroundColor: departmentCode === 'personal' ? '#EFF6FF' : '#F8FAFC',
                        color: departmentCode === 'personal' ? '#1D4ED8' : '#0F2C59',
                        fontWeight: '700',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {departmentCode === 'personal' && (
                    <div style={{ fontSize: '0.72rem', color: '#1D4ED8', marginTop: '0.2rem', fontWeight: '700' }}>
                      💡 Tài khoản cá nhân dùng cho các biểu mẫu được Admin cấp quyền riêng.
                    </div>
                  )}
                </div>

                {/* Field 3: Username */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.25rem',
                    letterSpacing: '0.2px'
                  }}>
                    Tên đăng nhập mong muốn *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaUser style={{
                      position: 'absolute',
                      top: '50%',
                      left: '0.95rem',
                      transform: 'translateY(-50%)',
                      color: '#0284C7',
                      fontSize: '0.88rem'
                    }} />
                    <input
                      className="reg-input-field"
                      type="text"
                      placeholder="VD: nguyenvana, nam.nv..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.62rem 0.85rem 0.62rem 2.55rem',
                        border: '1.5px solid #CBD5E1',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        outline: 'none',
                        backgroundColor: '#F8FAFC',
                        color: '#0F2C59',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Field 4: Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                  <div>
                    <label style={{
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.25rem',
                      letterSpacing: '0.2px'
                    }}>
                      Mật khẩu *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.85rem',
                        transform: 'translateY(-50%)',
                        color: '#0284C7',
                        fontSize: '0.85rem'
                      }} />
                      <input
                        className="reg-input-field"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.62rem 2.1rem 0.62rem 2.25rem',
                          border: '1.5px solid #CBD5E1',
                          borderRadius: '10px',
                          fontSize: '0.86rem',
                          outline: 'none',
                          backgroundColor: '#F8FAFC',
                          color: '#0F2C59',
                          fontWeight: '600',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '0.6rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '0.85rem'
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.78rem',
                      fontWeight: '800',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.25rem',
                      letterSpacing: '0.2px'
                    }}>
                      Xác nhận mật khẩu *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.85rem',
                        transform: 'translateY(-50%)',
                        color: '#0284C7',
                        fontSize: '0.85rem'
                      }} />
                      <input
                        className="reg-input-field"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.62rem 2.1rem 0.62rem 2.25rem',
                          border: `1.5px solid ${isPasswordMatch ? '#10B981' : confirmPassword ? '#EF4444' : '#CBD5E1'}`,
                          borderRadius: '10px',
                          fontSize: '0.86rem',
                          outline: 'none',
                          backgroundColor: '#F8FAFC',
                          color: '#0F2C59',
                          fontWeight: '600',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          right: '0.6rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '0.85rem'
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div style={{ fontSize: '0.74rem', fontWeight: '800', color: isPasswordMatch ? '#059669' : '#DC2626', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {isPasswordMatch ? <><FaCheck /> Mật khẩu xác nhận trùng khớp</> : <>⚠️ Mật khẩu xác nhận chưa khớp</>}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '900',
                    fontSize: '0.96rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                    transition: 'all 0.22s ease',
                    marginTop: '0.3rem',
                    letterSpacing: '0.3px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.45)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(2, 132, 199, 0.35)';
                  }}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" /> Đang gửi đăng ký...
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> GỬI ĐĂNG KÝ TÀI KHOẢN <FaArrowRight />
                    </>
                  )}
                </button>

                {/* Back to Login Link */}
                <div style={{ marginTop: '0.55rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748B' }}>
                  Đã có tài khoản nhân viên?{' '}
                  <Link to="/" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    Đăng nhập ngay <FaArrowRight style={{ fontSize: '0.72rem' }} />
                  </Link>
                </div>

              </form>
            )}

          </div>
        </section>

      </main>

      {/* Sleek Light Medical Footer */}
      <footer style={{
        padding: '0.45rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: '#475569',
        borderTop: '1px solid rgba(226, 232, 240, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(8px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        © 2026 <strong style={{ color: '#0F2C59' }}>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>
    </div>
  );
};

export default RegisterPage;
