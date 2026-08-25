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
  FaCheck
} from 'react-icons/fa';
import authService from '../../services/authService';
import MedicalAuthBackground from '../../components/common/MedicalAuthBackground';

const DEPARTMENTS = [
  { code: 'personal', name: '👤 Tài khoản cá nhân (Không thuộc khoa nào - Chỉ dùng Form phân quyền)' },
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
      justifyContent: 'center',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      boxSizing: 'border-box',
      padding: '2rem 1.5rem'
    }}>

      {/* Synchronized Dynamic Medical Background (ECG Canvas, Nano Particles, Auroras, Dot Grid) */}
      <MedicalAuthBackground />

      {/* Main Container Grid */}
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '3rem',
        alignItems: 'center',
        position: 'relative',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>

        {/* ================= LEFT COLUMN: BRAND & REGISTRATION INFO ================= */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 10px 25px rgba(2, 132, 199, 0.22), 0 0 0 3.5px rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            marginBottom: '0.2rem'
          }}>
            <img 
              src="/logo.png" 
              alt="Logo TTYT Bình Long" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {/* Headings */}
          <div>
            <div style={{
              display: 'inline-block',
              padding: '0.3rem 0.85rem',
              borderRadius: '20px',
              backgroundColor: 'rgba(2, 132, 199, 0.12)',
              border: '1px solid rgba(2, 132, 199, 0.28)',
              color: '#0369A1',
              fontSize: '0.76rem',
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              marginBottom: '0.6rem'
            }}>
              TTYT KHU VỰC BÌNH LONG • CỔNG NHÂN VIÊN
            </div>

            <h1 style={{
              fontSize: '2rem',
              fontWeight: '900',
              color: '#0F2C59',
              lineHeight: '1.2',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.5px'
            }}>
              Đăng Ký Tài Khoản
            </h1>

            <p style={{
              fontSize: '0.92rem',
              color: '#334155',
              lineHeight: '1.5',
              margin: 0,
              fontWeight: '500'
            }}>
              Tạo tài khoản cán bộ nhân viên hoặc tài khoản cá nhân để được phân quyền nhập và theo dõi biểu mẫu chuyên môn.
            </p>
          </div>

          {/* Feature Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '0.65rem 0.95rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0
              }}>
                <FaShieldAlt />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.86rem' }}>Bảo mật & Phê duyệt</div>
                <div style={{ color: '#64748B', fontSize: '0.76rem' }}>Mọi tài khoản đều được Admin xác thực trước khi kích hoạt</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              backgroundColor: 'rgba(255, 255, 255, 0.75)',
              backdropFilter: 'blur(10px)',
              padding: '0.65rem 0.95rem',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: '0 4px 14px rgba(15, 44, 89, 0.04)'
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: '#EFF6FF',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0
              }}>
                <FaUser />
              </div>
              <div>
                <div style={{ fontWeight: '800', color: '#0F2C59', fontSize: '0.86rem' }}>Tùy chọn Tài khoản cá nhân</div>
                <div style={{ color: '#64748B', fontSize: '0.76rem' }}>Có thể đăng ký tài khoản tự do để làm việc với các form phân quyền</div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= RIGHT COLUMN: CRISP WHITE REGISTRATION CARD ================= */}
        <section style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: '100%',
            maxWidth: '520px',
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            padding: '2rem 2.2rem',
            boxShadow: '0 25px 60px rgba(15, 44, 89, 0.16), 0 2px 6px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            boxSizing: 'border-box'
          }}>

            {/* Top Shield Icon Badge */}
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              border: '1.5px solid #DBEAFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 0.75rem auto',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)'
            }}>
              <FaUserPlus style={{ fontSize: '1.55rem', color: '#2563EB' }} />
            </div>

            {/* Heading */}
            <h3 style={{
              fontSize: '1.35rem',
              fontWeight: '800',
              color: '#0F2C59',
              margin: '0 0 0.2rem 0',
              textAlign: 'center',
              letterSpacing: '0.2px'
            }}>
              Tạo Tài Khoản Mới
            </h3>

            <p style={{
              fontSize: '0.82rem',
              color: '#64748B',
              margin: '0 0 1.25rem 0',
              textAlign: 'center'
            }}>
              Điền thông tin bên dưới để gửi yêu cầu cấp tài khoản
            </p>

            {/* Error Alert */}
            {errorMsg && (
              <div style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '0.65rem 0.95rem',
                color: '#991B1B',
                fontSize: '0.82rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                lineHeight: '1.4'
              }}>
                <FaInfoCircle style={{ flexShrink: 0 }} />
                <span>{typeof errorMsg === 'string' ? errorMsg : (errorMsg?.message || 'Lỗi đăng ký')}</span>
              </div>
            )}

            {/* Success State */}
            {successData ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <FaCheckCircle style={{ fontSize: '3.8rem', color: '#10B981', marginBottom: '1rem' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: '#0F2C59', margin: '0 0 0.5rem 0' }}>
                  Đăng Ký Thành Công!
                </h3>
                <div style={{
                  backgroundColor: '#F0FDF4',
                  border: '1.5px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '1.1rem',
                  fontSize: '0.88rem',
                  color: '#166534',
                  lineHeight: '1.5',
                  marginBottom: '1.5rem',
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    Tài khoản: <strong>@{successData.username}</strong> ({successData.full_name})
                  </p>
                  <p style={{ margin: 0 }}>
                    ⏳ Hồ sơ của bạn đã được chuyển đến <strong>Quản Trị Viên (Admin)</strong> để kiểm tra và phê duyệt kích hoạt. Vui lòng liên hệ Admin sau khi đăng ký.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <Link
                    to="/"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      backgroundColor: '#2563EB',
                      color: '#FFFFFF',
                      textDecoration: 'none',
                      padding: '0.7rem 1.6rem',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '0.9rem',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    <FaArrowLeft /> Trở về Trang Đăng Nhập
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                
                {/* Field 1: Full Name */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.35rem'
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
                      fontSize: '0.9rem'
                    }} />
                    <input
                      type="text"
                      placeholder="VD: BS. Nguyễn Văn A, ĐD. Trần Thị B..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem 0.7rem 2.55rem',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#F8FAFC',
                        color: '#0F2C59',
                        fontWeight: '600',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0284C7';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.backgroundColor = '#F8FAFC';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Field 2: Department Selector with Personal Account Option */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.35rem'
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
                      fontSize: '0.9rem'
                    }} />
                    <select
                      value={departmentCode}
                      onChange={(e) => setDepartmentCode(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem 0.7rem 2.55rem',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '0.88rem',
                        outline: 'none',
                        backgroundColor: departmentCode === 'personal' ? '#EFF6FF' : '#F8FAFC',
                        color: departmentCode === 'personal' ? '#1E40AF' : '#0F2C59',
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
                    <div style={{ fontSize: '0.74rem', color: '#2563EB', marginTop: '0.3rem', fontWeight: '600' }}>
                      💡 Tài khoản cá nhân sẽ không thuộc khoa cố định và dùng cho các biểu mẫu được Admin cấp quyền riêng.
                    </div>
                  )}
                </div>

                {/* Field 3: Username */}
                <div>
                  <label style={{
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: '#334155',
                    display: 'block',
                    marginBottom: '0.35rem'
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
                      fontSize: '0.9rem'
                    }} />
                    <input
                      type="text"
                      placeholder="VD: nguyenvana, nam.nv..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._]/g, ''))}
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem 0.7rem 2.55rem',
                        border: '1.5px solid #E2E8F0',
                        borderRadius: '10px',
                        fontSize: '0.9rem',
                        outline: 'none',
                        backgroundColor: '#F8FAFC',
                        color: '#0F2C59',
                        fontWeight: '600',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#0284C7';
                        e.target.style.backgroundColor = '#FFFFFF';
                        e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.12)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#E2E8F0';
                        e.target.style.backgroundColor = '#F8FAFC';
                        e.target.style.boxShadow = 'none';
                      }}
                      required
                    />
                  </div>
                </div>

                {/* Field 4: Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.35rem'
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
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem 2.2rem 0.7rem 2.3rem',
                          border: '1.5px solid #E2E8F0',
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
                      fontWeight: '700',
                      color: '#334155',
                      display: 'block',
                      marginBottom: '0.35rem'
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
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.7rem 2.2rem 0.7rem 2.3rem',
                          border: `1.5px solid ${isPasswordMatch ? '#10B981' : confirmPassword ? '#EF4444' : '#E2E8F0'}`,
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
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isPasswordMatch ? '#10B981' : '#EF4444', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {isPasswordMatch ? <><FaCheck /> Mật khẩu xác nhận trùng khớp</> : <>⚠️ Mật khẩu xác nhận chưa khớp</>}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '0.8rem 1rem',
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: '800',
                    fontSize: '0.96rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.32)',
                    transition: 'all 0.2s ease',
                    marginTop: '0.5rem',
                    letterSpacing: '0.2px'
                  }}
                  onMouseOver={(e) => {
                    if (!loading) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 6px 18px rgba(16, 185, 129, 0.42)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(16, 185, 129, 0.32)';
                  }}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="spinner" /> Đang gửi đăng ký...
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Gửi Đăng Ký Tài Khoản <FaArrowRight />
                    </>
                  )}
                </button>

                {/* Back to Login Link */}
                <div style={{ marginTop: '0.85rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748B' }}>
                  Đã có tài khoản?{' '}
                  <Link to="/" style={{ color: '#0284C7', fontWeight: '800', textDecoration: 'none' }}>
                    Đăng nhập ngay
                  </Link>
                </div>

              </form>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '2rem',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'rgba(15, 44, 89, 0.75)',
        fontWeight: '600',
        zIndex: 10,
        position: 'relative'
      }}>
        © 2026 Trung Tâm Y Tế Khu Vực Bình Long — Hệ Thống Báo Cáo Giao Ban Trực Toàn Viện
      </footer>
    </div>
  );
};

export default RegisterPage;
