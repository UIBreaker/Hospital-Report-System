import React, { useState, useCallback } from 'react';
import { FaHeartbeat, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaExclamationTriangle } from 'react-icons/fa';
import CaseImageUploader from '../common/CaseImageUploader';

const DeathCaseForm = ({ deathCases = [], setDeathCases }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const handleChange = useCallback((id, field, value) => {
    setDeathCases(prev =>
      prev.map(dc => {
        const itemKey = dc._id || dc.id;
        if (itemKey === id || String(itemKey) === String(id)) {
          return {
            ...dc,
            [field]: value,
            ...(field === 'patientName' ? { patient_name: value } : {}),
            ...(field === 'admissionTime' ? { admission_time: value } : {}),
            ...(field === 'admissionStatus' ? { admission_status: value } : {}),
            ...(field === 'clinicalSymptoms' ? { clinical_symptoms: value } : {}),
            ...(field === 'medicalHistory' ? { medical_history: value } : {}),
            ...(field === 'clinicalTests' ? { clinical_tests: value } : {}),
            ...(field === 'emergencyTreatment' ? { emergency_treatment: value } : {}),
            ...(field === 'finalOutcome' ? { final_outcome: value } : {})
          };
        }
        return dc;
      })
    );
  }, [setDeathCases]);

  const addCase = useCallback(() => {
    const newId = `dc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setDeathCases(prev => [
      ...prev,
      {
        _id: newId,
        patientName: '',
        patient_name: '',
        age: '',
        address: '',
        admissionTime: '',
        admission_time: '',
        reason: '',
        admissionStatus: '',
        admission_status: '',
        clinicalSymptoms: '',
        clinical_symptoms: '',
        medicalHistory: '',
        medical_history: '',
        clinicalTests: '',
        clinical_tests: '',
        diagnosis: '',
        emergencyTreatment: '',
        emergency_treatment: '',
        finalOutcome: '',
        final_outcome: '',
        images: []
      }
    ]);
    setExpanded(prev => ({ ...prev, [newId]: true }));
  }, [setDeathCases]);

  const removeCase = useCallback((id) => {
    setDeathCases(prev => prev.filter(dc => {
      const itemKey = dc._id || dc.id;
      return itemKey !== id && String(itemKey) !== String(id);
    }));
    setExpanded(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setDeathCases]);

  return (
    <div className="form-section animate-fade-in" style={{
      marginTop: '1.5rem',
      borderLeft: '4px solid #DC2626',
      borderRadius: 'var(--radius-md)',
      background: '#FEF2F2',
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '800' }}>
          <FaHeartbeat style={{ color: '#DC2626' }} />
          BÁO CÁO BỆNH NHÂN TỬ VONG {deathCases.length > 0 ? `(${deathCases.length} ca)` : ''}
        </h3>
        <button
          type="button"
          className="btn btn-danger"
          onClick={addCase}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#DC2626' }}
        >
          <FaPlus /> Thêm Ca Tử Vong
        </button>
      </div>

      {deathCases.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '1.5rem',
          backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)',
          border: '2px dashed #FCA5A5', color: 'var(--text-muted)'
        }}>
          <FaHeartbeat style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4, color: '#DC2626' }} />
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Không có ca tử vong trong ca trực. Nhấn <strong>«+ Thêm Ca Tử Vong»</strong> nếu có trường hợp tử vong cần báo cáo giao ban khẩn cấp.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {deathCases.map((dCase, index) => {
            const id = dCase._id || dCase.id || `legacy_dc_${index}`;
            const isExpanded = expanded[id] !== false;
            return (
              <div
                key={id}
                style={{
                  border: `1px solid ${isExpanded ? '#F87171' : '#E2E8F0'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: isExpanded ? '0 2px 8px rgba(220, 38, 38, 0.1)' : 'none',
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
                    backgroundColor: isExpanded ? '#FEE2E2' : '#F8FAFC',
                    borderBottom: isExpanded ? '1px solid #FECACA' : 'none',
                  }}
                  onClick={() => toggleExpand(id)}
                >
                  <span style={{ fontWeight: '700', color: '#991B1B', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <FaExclamationTriangle style={{ color: '#DC2626' }} />
                    Hồ Sơ Tử Vong #{index + 1}: {dCase.patientName ? dCase.patientName : '(Chưa nhập tên bệnh nhân)'}
                    {dCase.diagnosis && <span style={{ fontWeight: '400', color: '#64748B', fontSize: '0.85rem' }}>— {dCase.diagnosis}</span>}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={(e) => { e.stopPropagation(); removeCase(id); }}
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                      title="Xóa hồ sơ này"
                    >
                      <FaTrash /> Xóa
                    </button>
                    {isExpanded ? <FaChevronUp size={12} color="#991B1B" /> : <FaChevronDown size={12} color="#991B1B" />}
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
                          placeholder="VD: Trần Thị B"
                          value={dCase.patientName || dCase.patient_name || ''}
                          onChange={(e) => handleChange(id, 'patientName', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tuổi / Năm sinh</label>
                        <input
                          type="text"
                          placeholder="VD: 72T"
                          value={dCase.age || ''}
                          onChange={(e) => handleChange(id, 'age', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Thời Gian Vào Viện</label>
                        <input
                          type="text"
                          placeholder="VD: 21h15 ngày 12/08/2026"
                          value={dCase.admissionTime || dCase.admission_time || ''}
                          onChange={(e) => handleChange(id, 'admissionTime', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Địa Chỉ</label>
                        <input
                          type="text"
                          placeholder="VD: Xã Thanh Lương, TX. Bình Long"
                          value={dCase.address || ''}
                          onChange={(e) => handleChange(id, 'address', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Lý Do Vào Viện</label>
                        <input
                          type="text"
                          placeholder="VD: Khó thở dữ dội, đau tức ngực trái"
                          value={dCase.reason || ''}
                          onChange={(e) => handleChange(id, 'reason', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Tình Trạng Lúc Vào Khoa (Mạch, HA, đồng tử, tim phổi...)</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Mạch 0, HA không đo được, đồng tử 2 bên giãn 4mm, mất phản xạ ánh sáng..."
                          value={dCase.admissionStatus || dCase.admission_status || ''}
                          onChange={(e) => handleChange(id, 'admissionStatus', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Tiền Sử Bệnh</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Tăng huyết áp, Đái tháo đường type 2, Nhồi máu cơ tim cũ"
                          value={dCase.medicalHistory || dCase.medical_history || ''}
                          onChange={(e) => handleChange(id, 'medicalHistory', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: '#B91C1C' }}>Lâm Sàng / Triệu Chứng Khám / Sinh Hiệu</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Tri giác hôn mê sâu, Glasgow 3đ, thở ngáp cá, tím tái toàn thân, SpO2 không đo được..."
                          value={dCase.clinicalSymptoms || dCase.clinical_symptoms || ''}
                          onChange={(e) => handleChange(id, 'clinicalSymptoms', e.target.value)}
                          className="note-field"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: '#B91C1C' }}>Kết Quả Cận Lâm Sàng / ECG</label>
                        <textarea
                          rows={2}
                          placeholder="VD: ECG: Rung thất, sau đó đường đẳng điện; XQ ngực mờ rải rác 2 phế trường..."
                          value={dCase.clinicalTests || dCase.clinical_tests || ''}
                          onChange={(e) => handleChange(id, 'clinicalTests', e.target.value)}
                          className="note-field"
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Chẩn Đoán Tử Vong</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Ngưng tuần hoàn hô hấp ngoại viện do Nhồi máu cơ tim cấp diện rộng / THA - ĐTĐ"
                          value={dCase.diagnosis || ''}
                          onChange={(e) => handleChange(id, 'diagnosis', e.target.value)}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div className="form-group">
                        <label>Xử Trí Cấp Cứu</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Hồi sinh tim phổi nâng cao (CPR 45p), đặt NKQ bóp bóng, sốc điện 200J x 3 lần, Adrenalin 1mg x 10 ống..."
                          value={dCase.emergencyTreatment || dCase.emergency_treatment || ''}
                          onChange={(e) => handleChange(id, 'emergencyTreatment', e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Kết Quả Cuối Cùng & Hướng Xử Lý Thi Thể</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Bệnh nhân tử vong lúc 22h00 ngày 12/08/2026. Đã giải thích tình trạng cho người nhà, làm thủ tục bàn giao thi thể đưa về an táng."
                          value={dCase.finalOutcome || dCase.final_outcome || ''}
                          onChange={(e) => handleChange(id, 'finalOutcome', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Hình ảnh y khoa minh họa (ECG, X-Quang, CT, hồ sơ...) */}
                    <CaseImageUploader
                      images={dCase.images}
                      onChange={(newImgs) => handleChange(id, 'images', newImgs)}
                      theme="red"
                      patientName={dCase.patientName || dCase.patient_name}
                    />
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

export default DeathCaseForm;
