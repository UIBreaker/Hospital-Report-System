import React, { useState, useCallback } from 'react';
import { FaProcedures, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaUserInjured, FaNotesMedical } from 'react-icons/fa';

const SurgeryCaseForm = ({ surgeryCases = [], setSurgeryCases }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleChange = useCallback((id, field, value) => {
    setSurgeryCases(prev =>
      prev.map(sc => sc._id === id ? { ...sc, [field]: value } : sc)
    );
  }, [setSurgeryCases]);

  const addCase = useCallback(() => {
    const newId = `sc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setSurgeryCases(prev => [
      ...prev,
      {
        _id: newId,
        patientName: '',
        birthYear: '',
        address: '',
        admissionTime: '',
        reason: '',
        preoperativeDiagnosis: '',
        consultationOrder: '',
        postoperativeDiagnosis: '',
        currentStatus: ''
      }
    ]);
    setExpanded(prev => ({ ...prev, [newId]: true }));
  }, [setSurgeryCases]);

  const removeCase = useCallback((id) => {
    setSurgeryCases(prev => prev.filter(sc => sc._id !== id));
    setExpanded(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setSurgeryCases]);

  return (
    <div className="form-section animate-fade-in" style={{
      marginTop: '1.5rem',
      borderLeft: '4px solid #0284C7',
      borderRadius: 'var(--radius-md)',
      background: '#F0F9FF',
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '800' }}>
          <FaProcedures />
          BỆNH PHẪU THUẬT (BỆNH MỔ) {surgeryCases.length > 0 ? `(${surgeryCases.length} ca)` : ''}
        </h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addCase}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#E0F2FE', color: '#0369A1', borderColor: '#BAE6FD' }}
        >
          <FaPlus /> Thêm Ca Phẫu Thuật (Mổ)
        </button>
      </div>

      {surgeryCases.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '1.5rem',
          backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)',
          border: '2px dashed #BAE6FD', color: 'var(--text-muted)'
        }}>
          <FaProcedures style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4, color: '#0284C7' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Không có ca phẫu thuật trong ca trực. Nhấn <strong>«+ Thêm Ca Phẫu Thuật (Mổ)»</strong> nếu có bệnh nhân mổ cấp cứu hoặc chương trình.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {surgeryCases.map((sCase, index) => {
            const id = sCase._id || `legacy_sc_${index}`;
            const isExpanded = expanded[id] !== false;
            return (
              <div
                key={id}
                style={{
                  border: `1px solid ${isExpanded ? '#7DD3FC' : '#E2E8F0'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: isExpanded ? '0 2px 8px rgba(2, 132, 199, 0.08)' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.7rem 1rem',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#E0F2FE' : '#F8FAFC',
                    borderBottom: isExpanded ? '1px solid #BAE6FD' : 'none',
                  }}
                  onClick={() => toggleExpand(id)}
                >
                  <span style={{ fontWeight: '700', color: '#0369A1', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <FaUserInjured />
                    Ca Mổ #{index + 1}: {sCase.patientName ? sCase.patientName : '(Chưa nhập tên bệnh nhân)'}
                    {sCase.preoperativeDiagnosis && <span style={{ fontWeight: '400', color: '#64748B', fontSize: '0.85rem' }}>— {sCase.preoperativeDiagnosis}</span>}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); removeCase(id); }}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      title="Xóa ca mổ này"
                    >
                      <FaTrash /> Xóa
                    </button>
                    {isExpanded ? <FaChevronUp size={12} color="#0369A1" /> : <FaChevronDown size={12} color="#0369A1" />}
                  </div>
                </div>

                {/* Form fields */}
                {isExpanded && (
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Họ và Tên Bệnh Nhân <span style={{ color: 'var(--brand-red)' }}>*</span></label>
                        <input
                          type="text"
                          placeholder="VD: Nguyễn Văn A"
                          value={sCase.patientName || sCase.patient_name || ''}
                          onChange={(e) => handleChange(id, 'patientName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Năm sinh / Tuổi</label>
                        <input
                          type="text"
                          placeholder="VD: 1985 (39T)"
                          value={sCase.birthYear || sCase.birth_year || sCase.age || ''}
                          onChange={(e) => handleChange(id, 'birthYear', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Thời Gian Vào Viện</label>
                        <input
                          type="text"
                          placeholder="VD: 08h30 ngày 12/08/2026"
                          value={sCase.admissionTime || sCase.admission_time || ''}
                          onChange={(e) => handleChange(id, 'admissionTime', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Địa Chỉ</label>
                        <input
                          type="text"
                          placeholder="VD: P. An Lộc, TX. Bình Long"
                          value={sCase.address || ''}
                          onChange={(e) => handleChange(id, 'address', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Lý Do Nhập Viện</label>
                        <input
                          type="text"
                          placeholder="VD: Đau hố chậu phải âm ỉ"
                          value={sCase.reason || ''}
                          onChange={(e) => handleChange(id, 'reason', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Chẩn Đoán Trước Mổ</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Viêm ruột thừa cấp giờ thứ 14"
                          value={sCase.preoperativeDiagnosis || sCase.preoperative_diagnosis || ''}
                          onChange={(e) => handleChange(id, 'preoperativeDiagnosis', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Nội Dung Hội Chẩn / Lệnh Mổ</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Hội chẩn trực lãnh đạo viện: Mổ nội soi cắt ruột thừa cấp cứu"
                          value={sCase.consultationOrder || sCase.consultation_order || ''}
                          onChange={(e) => handleChange(id, 'consultationOrder', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Chẩn Đoán Sau Mổ</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Viêm ruột thừa mủ hoại tử"
                          value={sCase.postoperativeDiagnosis || sCase.postoperative_diagnosis || ''}
                          onChange={(e) => handleChange(id, 'postoperativeDiagnosis', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tình Trạng Hiện Tại (Hậu Phẫu)</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Hậu phẫu ổn định, tỉnh táo, sinh hiệu tốt, vết mổ khô"
                          value={sCase.currentStatus || sCase.current_status || ''}
                          onChange={(e) => handleChange(id, 'currentStatus', e.target.value)}
                        />
                      </div>
                    </div>
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

export default SurgeryCaseForm;
