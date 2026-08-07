import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaCalendarAlt, FaSignOutAlt, FaTv, FaCheck, FaTimes, FaSpinner, FaSync } from 'react-icons/fa';
import reportService from '../services/reportService';

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  });
  
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportService.getDepartmentStatus(date);
      setStatusList(response.data || []);
    } catch (err) {
      setError('Không thể tải trạng thái báo cáo.');
      setStatusList([
        { departmentCode: 'hscc_tnt', departmentName: 'Hồi sức cấp cứu – Thận nhân tạo', status: 'not_submitted' },
        { departmentCode: 'cdha', departmentName: 'Chẩn đoán hình ảnh', status: 'not_submitted' },
        { departmentCode: 'yhct_phcn', departmentName: 'Y học cổ truyền – Phục hồi chức năng', status: 'not_submitted' },
        { departmentCode: 'ngoai_th', departmentName: 'Ngoại tổng hợp', status: 'not_submitted' },
        { departmentCode: 'ctch', departmentName: 'Chấn thương chỉnh hình', status: 'not_submitted' },
        { departmentCode: 'nhi', departmentName: 'Nhi', status: 'not_submitted' },
        { departmentCode: 'nhiem', departmentName: 'Nhiễm', status: 'not_submitted' },
        { departmentCode: 'gmhs', departmentName: 'Gây mê Hồi sức', status: 'not_submitted' },
        { departmentCode: 'san', departmentName: 'Sản', status: 'not_submitted' },
        { departmentCode: 'xn', departmentName: 'Xét nghiệm', status: 'not_submitted' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [date]);

  const handlePresentation = () => {
    window.open(`/presentation/${date}`, '_blank');
  };

  const submittedCount = statusList.filter(s => s.status === 'submitted').length;
  const totalCount = statusList.length;

  return (
    <div style={{ padding: '1.5rem 2rem', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.4s ease-out' }}>
      {/* Brand Header */}
      <header className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem 1.5rem', background: '#FFFFFF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <img src="/logo.png" alt="Logo TTYT Bình Long" className="logo-img" />
          <div>
            <h4 style={{ fontSize: '0.8rem', color: 'var(--brand-red)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              TRUNG TÂM Y TẾ KHU VỰC BÌNH LONG
            </h4>
            <h2 style={{ fontSize: '1.3rem', color: 'var(--brand-blue)', fontWeight: '800' }}>
              Ban Giám Đốc — Bảng Theo Dõi Báo Cáo Giao Ban
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-color)', padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
            <FaCalendarAlt color="var(--brand-blue-light)" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', outline: 'none', padding: 0, width: 'auto', background: 'transparent', fontWeight: '600', color: 'var(--brand-blue)' }}
            />
          </div>
          <button className="btn btn-ghost" onClick={fetchStatus} title="Làm mới dữ liệu">
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handlePresentation}>
            <FaTv /> Trình Chiếu Giao Ban
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Stats Summary Bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', borderLeft: '4px solid var(--brand-blue)' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{totalCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '600' }}>Tổng số khoa phòng</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #E8F5E9, #C8E6C9)', borderLeft: '4px solid var(--brand-green)' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: 'var(--brand-green)' }}>{submittedCount}</div>
          <div style={{ color: 'var(--brand-green)', fontSize: '0.875rem', fontWeight: '600' }}>Đã nộp báo cáo</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', borderLeft: '4px solid #D97706' }}>
          <div style={{ fontSize: '2.2rem', fontWeight: '800', color: '#92400E' }}>{totalCount - submittedCount}</div>
          <div style={{ color: '#92400E', fontSize: '0.875rem', fontWeight: '600' }}>Chưa nộp báo cáo</div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--warning-light)', color: '#92400E', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Department Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2.5rem', color: 'var(--brand-blue)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu báo cáo...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {statusList.map((dept, index) => {
            const isSubmitted = dept.status === 'submitted';
            return (
              <div 
                key={dept.departmentCode} 
                className="card"
                style={{ 
                  borderLeft: `5px solid ${isSubmitted ? 'var(--brand-green)' : 'var(--border)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animationDelay: `${index * 0.04}s`,
                  animation: 'slideUp 0.3s ease-out forwards',
                  opacity: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>{dept.departmentName}</h3>
                  {isSubmitted ? 
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FaCheck size={10} /> Đã nộp
                    </span> : 
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <FaTimes size={10} /> Chưa nộp
                    </span>
                  }
                </div>
                
                {isSubmitted ? (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {dept.doctorName && <p><strong>Bác sĩ trực:</strong> {dept.doctorName}</p>}
                    <p style={{ color: 'var(--brand-green)', fontWeight: '600', marginTop: '0.5rem' }}>✓ Đã nhận báo cáo</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    Đang chờ khoa gửi báo cáo...
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
