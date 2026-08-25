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
  FaHeartbeat
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

  // Mark intro as already seen in this session so returning to login doesn't re-trigger it
  useEffect(() => {
    sessionStorage.setItem('portal_intro_shown', 'true');
  }, []);

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
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      overflowX: 'hidden',
      backgroundColor: '#030914',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      boxSizing: 'border-box'
    }}>

      <style>{`
        @keyframes regBloomExpand {
          0% { opacity: 0; transform: scale(0.96); filter: blur(10px); }
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
          border-color: #38BDF8 !important;
          background-color: rgba(10, 25, 50, 0.95) !important;
          box-shadow: 0 0 20px rgba(56, 189, 248, 0.45), inset 0 0 10px rgba(56, 189, 248, 0.1) !important;
        }

        .reg-feature-hover {
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reg-feature-hover:hover {
          transform: translateY(-3px) scale(1.02);
          border-color: #38BDF8 !important;
          box-shadow: 0 12px 30px rgba(56, 189, 248, 0.22) !important;
          background: rgba(15, 34, 68, 0.85) !important;
        }
      `}</style>

      {/* Synchronized Obsidian Dynamic Medical Background (ECG Canvas, Starlight Particles, Auroras) */}
      <MedicalAuthBackground />

      {/* Main Container Grid */}
      <main style={{
        flex: 1,
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1.5rem 2.5rem',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.1fr 1.15fr',
        gap: '3.5rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box',
        minHeight: 0,
        animation: 'regBloomExpand 0.85s cubic-bezier(0.16, 1, 0.3, 1) both'
      }}>

        {/* ================= LEFT COLUMN: BRAND & REGISTRATION INFO ================= */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '520px' }}>
          
          {/* Logo with Rotating Laser Rings */}
          <div style={{ position: 'relative', width: '84px', height: '84px', marginBottom: '0.2rem' }}>
            <div style={{
              position: 'absolute',
              inset: '-8px',
              borderRadius: '50%',
              border: '1.5px dashed rgba(56, 189, 248, 0.5)',
              animation: 'haloSpinSlow 16s linear infinite',
              pointerEvents: 'none'
            }} />
            <div style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '50%',
              border: '1.5px solid rgba(45, 212, 191, 0.4)',
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
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.45)',
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
              backgroundColor: 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38BDF8',
              padding: '0.3rem 0.95rem',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: '900',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '0.65rem',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)'
            }}>
              <FaHospital style={{ color: '#2DD4BF' }} /> SỞ Y TẾ THÀNH PHỐ ĐỒNG NAI
            </div>

            <h1 style={{
              fontSize: '2.15rem',
              fontWeight: '900',
              color: '#FFFFFF',
              margin: '0 0 0.15rem 0',
              lineHeight: '1.15',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              ĐĂNG KÝ TÀI KHOẢN
            </h1>

            <h2 style={{
              fontSize: '2.25rem',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              lineHeight: '1.15',
              margin: '0 0 0.55rem 0',
              backgroundImage: 'linear-gradient(135deg, #38BDF8 0%, #2DD4BF 50%, #A7F3D0 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              display: 'inline-block'
            }}>
              CỔNG Y TẾ BÌNH LONG
            </h2>

            <p style={{
              fontSize: '0.9rem',
              color: '#94A3B8',
              lineHeight: '1.5',
              margin: 0,
              maxWidth: '470px'
            }}>
              Tạo tài khoản cán bộ nhân viên khoa phòng hoặc cá nhân để được phân quyền nhập và theo dõi báo cáo giao ban y khoa trực tuyến.
            </p>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.35rem' }}>
            <div className="reg-feature-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              backgroundColor: 'rgba(11, 24, 48, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.65rem 1.05rem',
              borderRadius: '16px',
              border: '1px solid rgba(56, 189, 248, 0.22)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(2, 132, 199, 0.5) 100%)',
                border: '1px solid rgba(56, 189, 248, 0.45)',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                flexShrink: 0,
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.25)'
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#F8FAFC', fontSize: '0.88rem' }}>Bảo Mật & Phê Duyệt An Toàn</div>
                <div style={{ color: '#94A3B8', fontSize: '0.76rem' }}>Mọi tài khoản đều được Ban Giám Đốc / Admin duyệt trước khi kích hoạt</div>
              </div>
            </div>

            <div className="reg-feature-hover" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.95rem',
              backgroundColor: 'rgba(11, 24, 48, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              padding: '0.65rem 1.05rem',
              borderRadius: '16px',
              border: '1px solid rgba(45, 212, 191, 0.22)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(16, 185, 129, 0.5) 100%)',
                border: '1px solid rgba(45, 212, 191, 0.45)',
                color: '#2DD4BF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                flexShrink: 0,
                boxShadow: '0 0 15px rgba(45, 212, 191, 0.25)'
              }}>
                <FaUser />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#F8FAFC', fontSize: '0.88rem' }}>Đa Dạng Loại Hình Tài Khoản</div>
                <div style={{ color: '#94A3B8', fontSize: '0.76rem' }}>Đăng ký tài khoản theo 13 chuyên khoa hoặc tài khoản cá nhân linh hoạt</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: MASTERPIECE OBSIDIAN GLASS REGISTRATION CARD ================= */}
        <section style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: 'rgba(10, 22, 46, 0.84)',
            backdropFilter: 'blur(28px)',
            WebkitBackdropFilter: 'blur(28px)',
            borderRadius: '24px',
            padding: '1.85rem 2.15rem',
            boxShadow: '0 25px 65px rgba(0, 0, 0, 0.75), 0 0 35px rgba(14, 165, 233, 0.18), inset 0 1px 1px rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(56, 189, 248, 0.3)',
            boxSizing: 'border-box'
          }}>

            {/* Top Shield Icon Badge */}
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(14, 165, 233, 0.18)',
              border: '1.5px solid rgba(56, 189, 248, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 0 25px rgba(56, 189, 248, 0.35)'
            }}>
              <FaUserPlus style={{ fontSize: '1.65rem', color: '#38BDF8' }} />
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '1.45rem',
              fontWeight: '900',
              color: '#FFFFFF',
              margin: '0 0 0.25rem 0',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              TẠO TÀI KHOẢN MỚI
            </h3>

            <p style={{
              fontSize: '0.84rem',
              color: '#94A3B8',
              margin: '0 0 1.25rem 0',
              textAlign: 'center'
            }}>
              Điền thông tin bên dưới để gửi yêu cầu cấp quyền tài khoản
            </p>

            {/* Error Alert */}
            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.18)',
                border: '1.5px solid rgba(248, 113, 113, 0.55)',
                borderRadius: '12px',
                padding: '0.75rem 1rem',
                color: '#FECACA',
                fontSize: '0.84rem',
                marginBottom: '1.15rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.65rem',
                lineHeight: '1.4'
              }}>
                <FaInfoCircle style={{ color: '#F87171', fontSize: '1.15rem', marginTop: '1px', flexShrink: 0 }} />
                <span>{typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi đăng ký')}</span>
              </div>
            )}

            {/* Success State */}
            {successData ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <FaCheckCircle style={{ fontSize: '3.8rem', color: '#10B981', marginBottom: '1rem', filter: 'drop-shadow(0 0 15px rgba(16,185,129,0.5))' }} />
                <h3 style={{ fontSize: '1.45rem', fontWeight: '900', color: '#34D399', margin: '0 0 0.5rem 0' }}>
                  ĐĂNG KÝ THÀNH CÔNG!
                </h3>
                <div style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(52, 211, 153, 0.4)',
                  borderRadius: '14px',
                  padding: '1.2rem',
                  fontSize: '0.9rem',
                  color: '#D1FAE5',
                  lineHeight: '1.6',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Tài khoản: <strong style={{ color: '#38BDF8' }}>@{successData.username}</strong> ({successData.full_name})
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
                      gap: '0.55rem',
                      background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '0.75rem 1.6rem',
                      borderRadius: '12px',
                      fontWeight: '900',
                      fontSize: '0.92rem',
                      boxShadow: '0 6px 20px rgba(14, 165, 233, 0.4)'
                    }}
                  >
                    <FaArrowLeft /> Trở về Trang Đăng Nhập
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
                
                {/* Field 1: Full Name */}
                <div>
                  <label style={{
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#E2E8F0',
                    display: 'block',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.3px'
                  }}>
                    Họ và tên nhân viên *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaIdBadge style={{
                      position: 'absolute',
                      top: '50%',
                      left: '1rem',
                      transform: 'translateY(-50%)',
                      color: '#38BDF8',
                      fontSize: '0.92rem'
                    }} />
                    <input
                      className="reg-input-field"
                      type="text"
                      placeholder="VD: BS. Nguyễn Văn A, ĐD. Trần Thị B..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.65rem',
                        border: '1.5px solid rgba(56, 189, 248, 0.28)',
                        borderRadius: '12px',
                        fontSize: '0.92rem',
                        outline: 'none',
                        backgroundColor: 'rgba(6, 14, 28, 0.85)',
                        color: '#FFFFFF',
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
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#E2E8F0',
                    display: 'block',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.3px'
                  }}>
                    Khoa / Phòng trực thuộc *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaHospital style={{
                      position: 'absolute',
                      top: '50%',
                      left: '1rem',
                      transform: 'translateY(-50%)',
                      color: '#38BDF8',
                      fontSize: '0.92rem',
                      zIndex: 1
                    }} />
                    <select
                      className="reg-input-field"
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.65rem',
                        border: '1.5px solid rgba(56, 189, 248, 0.28)',
                        borderRadius: '12px',
                        fontSize: '0.88rem',
                        outline: 'none',
                        backgroundColor: 'rgba(6, 14, 28, 0.92)',
                        color: '#38BDF8',
                        fontWeight: '800',
                        boxSizing: 'border-box',
                        cursor: 'pointer'
                      }}
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d.code} value={d.code} style={{ backgroundColor: '#0A162E', color: '#FFFFFF' }}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {departmentCode === 'personal' && (
                    <div style={{ fontSize: '0.76rem', color: '#38BDF8', marginTop: '0.35rem', fontWeight: '700' }}>
                      💡 Tài khoản cá nhân không thuộc khoa cố định và dùng cho các biểu mẫu được Admin cấp quyền riêng.
                    </div>
                  )}
                </div>

                {/* Field 3: Username */}
                <div>
                  <label style={{
                    fontSize: '0.82rem',
                    fontWeight: '800',
                    color: '#E2E8F0',
                    display: 'block',
                    marginBottom: '0.4rem',
                    letterSpacing: '0.3px'
                  }}>
                    Tên đăng nhập mong muốn *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <FaUser style={{
                      position: 'absolute',
                      top: '50%',
                      left: '1rem',
                      transform: 'translateY(-50%)',
                      color: '#38BDF8',
                      fontSize: '0.92rem'
                    }} />
                    <input
                      className="reg-input-field"
                      type="text"
                      placeholder="VD: nguyenvana, nam.nv..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.85rem 0.75rem 2.65rem',
                        border: '1.5px solid rgba(56, 189, 248, 0.28)',
                        borderRadius: '12px',
                        fontSize: '0.92rem',
                        outline: 'none',
                        backgroundColor: 'rgba(6, 14, 28, 0.85)',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Field 4: Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      color: '#E2E8F0',
                      display: 'block',
                      marginBottom: '0.4rem',
                      letterSpacing: '0.3px'
                    }}>
                      Mật khẩu *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.9rem',
                        transform: 'translateY(-50%)',
                        color: '#38BDF8',
                        fontSize: '0.88rem'
                      }} />
                      <input
                        className="reg-input-field"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.2rem 0.75rem 2.35rem',
                          border: '1.5px solid rgba(56, 189, 248, 0.28)',
                          borderRadius: '12px',
                          fontSize: '0.88rem',
                          outline: 'none',
                          backgroundColor: 'rgba(6, 14, 28, 0.85)',
                          color: '#FFFFFF',
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
                          right: '0.65rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '0.88rem'
                        }}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      fontSize: '0.82rem',
                      fontWeight: '800',
                      color: '#E2E8F0',
                      display: 'block',
                      marginBottom: '0.4rem',
                      letterSpacing: '0.3px'
                    }}>
                      Xác nhận mật khẩu *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <FaLock style={{
                        position: 'absolute',
                        top: '50%',
                        left: '0.9rem',
                        transform: 'translateY(-50%)',
                        color: '#38BDF8',
                        fontSize: '0.88rem'
                      }} />
                      <input
                        className="reg-input-field"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.75rem 2.2rem 0.75rem 2.35rem',
                          border: `1.5px solid ${isPasswordMatch ? '#10B981' : confirmPassword ? '#EF4444' : 'rgba(56, 189, 248, 0.28)'}`,
                          borderRadius: '12px',
                          fontSize: '0.88rem',
                          outline: 'none',
                          backgroundColor: 'rgba(6, 14, 28, 0.85)',
                          color: '#FFFFFF',
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
                          right: '0.65rem',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                          fontSize: '0.88rem'
                        }}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Match indicator */}
                {confirmPassword && (
                  <div style={{ fontSize: '0.76rem', fontWeight: '800', color: isPasswordMatch ? '#34D399' : '#F87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isPasswordMatch ? <><FaCheck /> Mật khẩu xác nhận trùng khớp</> : <>⚠️ Mật khẩu xác nhận chưa khớp</>}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    background: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 40%, #10B981 100%)',
                    color: '#FFFFFF',
                    border: '1.5px solid rgba(255, 255, 255, 0.35)',
                    borderRadius: '12px',
                    fontWeight: '900',
                    fontSize: '1.02rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.65rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 8px 30px rgba(14, 165, 233, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                    transition: 'all 0.25s ease',
                    marginTop: '0.45rem',
                    letterSpacing: '0.4px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.015)';
                      e.currentTarget.style.boxShadow = '0 12px 35px rgba(14, 165, 233, 0.75)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(14, 165, 233, 0.5)';
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
                <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.84rem', color: '#94A3B8' }}>
                  Đã có tài khoản nhân viên?{' '}
                  <Link to="/" style={{ color: '#38BDF8', fontWeight: '800', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    Đăng nhập ngay <FaArrowRight style={{ fontSize: '0.75rem' }} />
                  </Link>
                </div>

              </form>
            )}

          </div>
        </section>

      </main>

      {/* Sleek Dark Obsidian Footer */}
      <footer style={{
        padding: '0.65rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.82rem',
        color: '#94A3B8',
        borderTop: '1px solid rgba(56, 189, 248, 0.15)',
        backgroundColor: 'rgba(3, 9, 20, 0.75)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 10,
        flexShrink: 0
      }}>
        © 2026 <strong style={{ color: '#E2E8F0' }}>Trung Tâm Y Tế Khu Vực Bình Long</strong> — Sở Y Tế Thành Phố Đồng Nai.
      </footer>
    </div>
  );
};

export default RegisterPage;
