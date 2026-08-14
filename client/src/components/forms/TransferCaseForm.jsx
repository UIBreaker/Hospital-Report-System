import React, { useState, useCallback } from 'react';
import { FaAmbulance, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaUserInjured } from 'react-icons/fa';
import CaseImageUploader from '../common/CaseImageUploader';

const TransferCaseForm = ({ transferCases = [], setTransferCases }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Functional updater to avoid stale closure bug with multiple cases
  const handleChange = useCallback((id, field, value) => {
    setTransferCases(prev =>
      prev.map(tc => {
        const itemKey = tc._id || tc.id;
        if (itemKey === id) {
          return { 
            ...tc, 
            [field]: value,
            // Đồng bộ cả snake_case để tương thích ngược 100%
            ...(field === 'patientName' ? { patient_name: value } : {}),
            ...(field === 'admissionTime' ? { admission_time: value } : {}),
            ...(field === 'clinicalSymptoms' ? { clinical_symptoms: value } : {}),
            ...(field === 'clinicalTests' ? { clinical_tests: value } : {}),
            ...(field === 'initialTreatment' ? { initial_treatment: value } : {}),
            ...(field === 'progressNotes' ? { progress_notes: value } : {})
          };
        }
        return tc;
      })
    );
  }, [setTransferCases]);

  const addCase = useCallback(() => {
    const newId = `tc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setTransferCases(prev => [
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
        clinicalSymptoms: '',
        clinical_symptoms: '',
        clinicalTests: '',
        clinical_tests: '',
        diagnosis: '',
        initialTreatment: '',
        initial_treatment: '',
        progressNotes: '',
        progress_notes: '',
        images: []
      }
    ]);
    setExpanded(prev => ({ ...prev, [newId]: true }));
  }, [setTransferCases]);

  const removeCase = useCallback((id) => {
    setTransferCases(prev => prev.filter(tc => (tc._id || tc.id) !== id));
    setExpanded(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setTransferCases]);

  return (
    <div className="form-section animate-fade-in" style={{
      marginTop: '1.5rem',
      borderLeft: '4px solid #D97706',
      borderRadius: 'var(--radius-md)',
      background: '#FFFBEB',
      padding: '1.25rem'
    }}>
      <div className="transfer-case-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: '#B45309', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '800' }}>
          <FaAmbulance />
          BỆNH CHUYỂN VIỆN {transferCases.length > 0 ? `(${transferCases.length} ca)` : ''}
        </h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addCase}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#FEF3C7', color: '#92400E', borderColor: '#FDE68A', fontWeight: '700' }}
        >
          <FaPlus /> Thêm Ca Chuyển Viện
        </button>
      </div>

      {transferCases.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem',
          backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)',
          border: '2px dashed #FDE68A', color: 'var(--text-muted)'
        }}>
          <FaAmbulance style={{ fontSize: '2.2rem', marginBottom: '0.5rem', color: '#D97706', opacity: 0.5 }} />
          <p style={{ margin: 0, fontWeight: '500' }}>Nhấn <strong>«+ Thêm Ca Chuyển Viện»</strong> để nhập thông tin chi tiết từng ca bệnh nhân chuyển tuyến.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {transferCases.map((tCase, index) => {
            const id = tCase._id || tCase.id || `legacy_${index}`;
            const isExpanded = expanded[id] !== false; // default expanded
            const displayName = tCase.patientName || tCase.patient_name || '';
            const displayAge = tCase.age ? ` (${tCase.age} tuổi)` : '';
            return (
              <div
                key={id}
                style={{
                  border: `1px solid ${isExpanded ? '#FCD34D' : '#E2E8F0'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: isExpanded ? '0 4px 14px rgba(217, 119, 6, 0.12)' : 'none',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#FEF3C7' : '#F8FAFC',
                    borderBottom: isExpanded ? '1px solid #FCD34D' : 'none',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleExpand(id)}
                >
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: isExpanded ? '#92400E' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚑 Ca #{index + 1}
                    {displayName && (
                      <span style={{ fontWeight: '600', color: '#B45309', fontSize: '0.9rem' }}>— {displayName}{displayAge}</span>
                    )}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeCase(id); }}
                      style={{
                        background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C',
                        padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: '600'
                      }}
                    >
                      <FaTrash style={{ fontSize: '0.7rem' }} /> Xóa ca
                    </button>
                    <span style={{ color: '#92400E', fontSize: '0.85rem' }}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem' }}>
                    {/* Hàng 1: Họ tên (40%), Tuổi (25%), Giờ vào (35%) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label style={{ fontWeight: '700', color: '#0F2C59' }}>
                          <FaUserInjured style={{ marginRight: '4px', color: '#D97706' }} /> Họ và tên bệnh nhân <span style={{ color: '#DC2626' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={tCase.patientName || tCase.patient_name || ''}
                          onChange={(e) => handleChange(id, 'patientName', e.target.value)}
                          placeholder="VD: Nguyễn Văn A"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: '#0F2C59' }}>Tuổi / Năm sinh</label>
                        <input
                          type="text"
                          value={tCase.age || ''}
                          onChange={(e) => handleChange(id, 'age', e.target.value)}
                          placeholder="VD: 45 tuổi (hoặc 1981)"
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ fontWeight: '700', color: '#0F2C59' }}>Giờ / Ngày vào viện</label>
                        <input
                          type="text"
                          value={tCase.admissionTime || tCase.admission_time || ''}
                          onChange={(e) => handleChange(id, 'admissionTime', e.target.value)}
                          placeholder="VD: 08:30 ngày 14/08/2026"
                        />
                      </div>
                    </div>

                    {/* Hàng 2: Địa chỉ riêng biệt */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Địa chỉ thường trú / Nơi ở</label>
                      <input
                        type="text"
                        value={tCase.address || ''}
                        onChange={(e) => handleChange(id, 'address', e.target.value)}
                        placeholder="VD: P. An Lộc, Thị xã Bình Long, Tỉnh Bình Phước"
                      />
                    </div>

                    {/* Hàng 3: Lý do vào viện */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Lý do vào viện</label>
                      <input
                        type="text"
                        value={tCase.reason || ''}
                        onChange={(e) => handleChange(id, 'reason', e.target.value)}
                        placeholder="VD: Đau bụng dữ dội, khó thở, chấn thương do tai nạn..."
                      />
                    </div>

                    {/* Hàng 4: Lâm sàng (Triệu chứng, Khám thực thể, Sinh hiệu) */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Lâm sàng / Triệu chứng khám / Sinh hiệu</label>
                      <textarea
                        value={tCase.clinicalSymptoms || tCase.clinical_symptoms || ''}
                        onChange={(e) => handleChange(id, 'clinicalSymptoms', e.target.value)}
                        placeholder="Tri giác, tiếp xúc, da niêm, sinh hiệu (Mạch, HA, SpO2, Nhịp thở, Nhiệt độ), khám thực thể vùng tổn thương..."
                        rows={2}
                        className="note-field"
                      />
                    </div>

                    {/* Hàng 5: Cận lâm sàng */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Cận lâm sàng / X-Quang / Siêu âm / Xét nghiệm</label>
                      <textarea
                        value={tCase.clinicalTests || tCase.clinical_tests || ''}
                        onChange={(e) => handleChange(id, 'clinicalTests', e.target.value)}
                        placeholder="Kết quả xét nghiệm máu, hình ảnh X-Quang, siêu âm, CT Scanner..."
                        rows={2}
                        className="note-field"
                      />
                    </div>

                    {/* Hàng 5: Chẩn đoán */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#B45309' }}>
                        Chẩn đoán xác định / Chuyển tuyến <span style={{ color: '#DC2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={tCase.diagnosis || ''}
                        onChange={(e) => handleChange(id, 'diagnosis', e.target.value)}
                        placeholder="VD: Viêm ruột thừa cấp vỡ mủ / Nhồi máu cơ tim cấp..."
                        style={{ fontWeight: '600', borderColor: '#FDE68A' }}
                        required
                      />
                    </div>

                    {/* Hàng 6: Xử trí ban đầu */}
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Xử trí cấp cứu ban đầu tại khoa</label>
                      <textarea
                        value={tCase.initialTreatment || tCase.initial_treatment || ''}
                        onChange={(e) => handleChange(id, 'initialTreatment', e.target.value)}
                        placeholder="Các biện pháp cấp cứu, thuốc đã dùng, dịch truyền, đặt nội khí quản..."
                        rows={2}
                        className="note-field"
                      />
                    </div>

                    {/* Hàng 7: Diễn biến chuyển viện */}
                    <div className="form-group">
                      <label style={{ fontWeight: '700', color: '#0F2C59' }}>Diễn biến / Hội chẩn / Tình trạng lúc chuyển viện</label>
                      <textarea
                        value={tCase.progressNotes || tCase.progress_notes || ''}
                        onChange={(e) => handleChange(id, 'progressNotes', e.target.value)}
                        placeholder="Tình trạng sinh hiệu lúc chuyển (Mạch, HA, SpO2), hội chẩn viện, lý do chuyển tuyến trên..."
                        rows={3}
                        className="note-field"
                      />
                    </div>

                    {/* Hàng 8: Hình ảnh y khoa minh họa (X-Quang, CT, Vết thương...) */}
                    <CaseImageUploader
                      images={tCase.images}
                      onChange={(newImgs) => handleChange(id, 'images', newImgs)}
                      theme="amber"
                      patientName={tCase.patientName || tCase.patient_name}
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

export default TransferCaseForm;
