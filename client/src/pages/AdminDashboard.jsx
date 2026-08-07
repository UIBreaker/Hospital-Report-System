import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { FaHospitalAlt, FaCalendarAlt, FaSignOutAlt, FaTv, FaCheck, FaTimes, FaSpinner, FaSync } from 'react-icons/fa';
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
      // Fallback: show department names without status
      setStatusList([
        { departmentCode: 'hscc_tnt', departmentName: 'Hồi sức cấp cứu – Thận nhân tạo', status: 'not_submitted' },
        { departmentCode: 'cdha', departmentName: 'Chuẩn đoán hình ảnh', status: 'not_submitted' },
        { departmentCode: 'yhct_phcn', departmentName: 'Y học cổ truyền – PHCN', status: 'not_submitted' },
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
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '2px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', padding: '0.75rem', borderRadius: '12px', color: 'white' }}>
            <FaHospitalAlt size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Ban Giám Đốc</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bảng theo dõi trạng thái báo cáo giao ban</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border)' }}>
            <FaCalendarAlt color="var(--primary)" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              style={{ border: 'none', outline: 'none', padding: 0, width: 'auto', background: 'transparent' }}
            />
          </div>
          <button className="btn btn-ghost" onClick={fetchStatus} title="Làm mới">
            <FaSync className={loading ? 'spinner' : ''} />
          </button>
          <button className="btn btn-primary" onClick={handlePresentation}>
            <FaTv /> Trình chiếu
          </button>
          <button className="btn btn-secondary" onClick={logout}>
            <FaSignOutAlt /> Đăng xuất
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>{totalCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tổng số khoa</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--success)' }}>{submittedCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Đã nộp</div>
        </div>
        <div className="card" style={{ flex: 1, textAlign: 'center', background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)' }}>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400E' }}>{totalCount - submittedCount}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Chưa nộp</div>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'var(--warning-light)', color: '#92400E', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Department cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <FaSpinner className="spinner" style={{ fontSize: '2rem', color: 'var(--primary)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</p>
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
                  borderLeft: `4px solid ${isSubmitted ? 'var(--success)' : 'var(--text-light)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  animationDelay: `${index * 0.05}s`,
                  animation: 'slideUp 0.4s ease-out forwards',
                  opacity: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: '600', fontSize: '1rem' }}>{dept.departmentName}</h3>
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
                    {dept.doctorName && <p><strong>Bác sĩ:</strong> {dept.doctorName}</p>}
                    <p style={{ color: 'var(--success)', fontWeight: '500', marginTop: '0.5rem' }}>✓ Báo cáo đã được ghi nhận</p>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-light)', fontStyle: 'italic' }}>
                    Đang chờ báo cáo...
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
