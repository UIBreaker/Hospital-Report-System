import React, { useState } from 'react';
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
  FaArrowLeft
} from 'react-icons/fa';
import authService from '../../services/authService';

const DEPARTMENTS = [
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
  const [departmentCode, setDepartmentCode] = useState('lck');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

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
      setErrorMsg(err.response?.data?.error || err.message || 'Đăng ký không thành công. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0A192F 0%, #0F2C59 50%, #1E40AF 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      boxSizing: 'border-box',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.45)',
        overflow: 'hidden',
        animation: 'fadeInUp 0.35s ease-out'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#0F2C59',
          backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.3) 0%, transparent 60%)',
          padding: '2rem 1.8rem 1.5rem',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 0.85rem',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            padding: '8px',
            boxShadow: '0 4px 15px rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/logo.png" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '900', margin: '0.35rem 0 0 0', color: '#FFFFFF' }}>
            Đăng Ký Tài Khoản Nhân Viên
          </h2>
        </div>

        {/* Body */}
        <div style={{ padding: '2rem 2.2rem' }}>
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
                fontSize: '0.9rem',
                color: '#166534',
                lineHeight: 1.5,
                marginBottom: '1.8rem',
                textAlign: 'left'
              }}>
                <div>👤 Họ tên: <strong>{successData.full_name}</strong></div>
                <div>🔑 Tên đăng nhập: <strong>{successData.username}</strong></div>
                <div>🏥 Khoa phòng: <strong>{successData.department_name}</strong></div>
                <hr style={{ border: 'none', borderTop: '1px solid #DCFCE7', margin: '0.65rem 0' }} />
                <div style={{ fontSize: '0.85rem', color: '#15803D' }}>
                  ⏳ <strong>Hồ sơ đang chờ phê duyệt:</strong> Vui lòng thông báo Quản trị viên (Admin phòng KHNV) để kích hoạt tài khoản của bạn.
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem 2rem',
                  fontWeight: '800',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(37, 99, 235, 0.35)'
                }}
              >
                Về Trang Đăng Nhập
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  fontSize: '0.86rem',
                  fontWeight: '600',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaExclamationTriangle /> {errorMsg}
                </div>
              )}

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Họ và tên nhân viên *
                </label>
                <div style={{ position: 'relative' }}>
                  <FaIdBadge style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ví dụ: BS. Nguyễn Văn A, ĐD. Trần Thị B..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Khoa / Phòng trực thuộc *
                </label>
                <div style={{ position: 'relative' }}>
                  <FaHospital style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <select
                    value={departmentCode}
                    onChange={(e) => setDepartmentCode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.92rem',
                      fontWeight: '700',
                      color: '#0F2C59',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                      cursor: 'pointer'
                    }}
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                  Tên đăng nhập mong muốn *
                </label>
                <div style={{ position: 'relative' }}>
                  <FaUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Viết liền không dấu (VD: bs.vana, dd.hoa...)"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem 0.65rem 2.4rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: '#0F2C59', marginBottom: '0.35rem', textTransform: 'uppercase' }}>
                    Xác nhận mật khẩu *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '10px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.92rem',
                      fontWeight: '600',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.8rem',
                  fontSize: '0.98rem',
                  fontWeight: '800',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                  marginBottom: '1.25rem'
                }}
              >
                {loading ? <><FaSpinner className="spinner" /> Đang đăng ký...</> : <><FaUserPlus /> Đăng Ký Tài Khoản</>}
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#64748B' }}>
                Đã có tài khoản?{' '}
                <Link to="/" style={{ color: '#2563EB', fontWeight: '800', textDecoration: 'none' }}>
                  Đăng nhập ngay
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
