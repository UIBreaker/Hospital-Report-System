import React, { useState, useCallback } from 'react';
import { FaAmbulance, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TransferCaseForm = ({ transferCases = [], setTransferCases }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // IMPORTANT: use functional updater to avoid stale closure bug with multiple cases
  const handleChange = useCallback((id, field, value) => {
    setTransferCases(prev =>
      prev.map(tc => {
        const itemKey = tc._id || tc.id;
        if (itemKey === id) {
          return { 
            ...tc, 
            [field]: value,
            // Đồng bộ cả snake_case để tránh mất dữ liệu
            ...(field === 'patientName' ? { patient_name: value } : {}),
            ...(field === 'admissionTime' ? { admission_time: value } : {}),
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
        patientName: '',   // Họ tên, tuổi, địa chỉ (combined)
        patient_name: '',
        admissionTime: '',
        admission_time: '',
        reason: '',
        clinicalTests: '',
        clinical_tests: '',
        diagnosis: '',
        initialTreatment: '',
        initial_treatment: '',
        progressNotes: '',
        progress_notes: ''
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
      borderLeft: '4px solid var(--danger)',
      borderRadius: 'var(--radius-md)',
      background: '#FFFAFA'
    }}>
      <div className="transfer-case-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FaAmbulance />
          BỆNH CHUYỂN VIỆN {transferCases.length > 0 ? `(${transferCases.length} ca)` : ''}
        </h3>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addCase}
          style={{ fontSize: '0.85rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FaPlus /> Thêm Ca Chuyển Viện
        </button>
      </div>

      {transferCases.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem',
          backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)',
          border: '2px dashed var(--border)', color: 'var(--text-muted)'
        }}>
          <FaAmbulance style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.4 }} />
          <p style={{ margin: 0 }}>Nhấn <strong>«+ Thêm Ca Chuyển Viện»</strong> để nhập thông tin chi tiết từng ca bệnh chuyển viện.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transferCases.map((tCase, index) => {
            const id = tCase._id || tCase.id || `legacy_${index}`;
            const isExpanded = expanded[id] !== false; // default expanded
            const displayName = tCase.patientName || tCase.patient_name || '';
            return (
              <div
                key={id}
                style={{
                  border: `1px solid ${isExpanded ? '#FCA5A5' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isExpanded ? '#FFF' : '#F8FAFC',
                  boxShadow: isExpanded ? '0 2px 8px rgba(211,47,47,0.08)' : 'none',
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
                    backgroundColor: isExpanded ? '#FEF2F2' : '#F1F5F9',
                    borderBottom: isExpanded ? '1px solid #FCA5A5' : 'none',
                    userSelect: 'none'
                  }}
                  onClick={() => toggleExpand(id)}
                >
                  <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: isExpanded ? '#B91C1C' : 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    🚑 Ca #{index + 1}
                    {displayName && (
                      <span style={{ fontWeight: '500', color: '#64748B', fontSize: '0.9rem' }}>— {displayName}</span>
                    )}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeCase(id); }}
                      style={{
                        background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#B91C1C',
                        padding: '0.25rem 0.6rem', borderRadius: '4px', cursor: 'pointer',
                        fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem'
                      }}
                    >
                      <FaTrash style={{ fontSize: '0.7rem' }} /> Xóa
                    </button>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                </div>

                {/* Content */}
                {isExpanded && (
                  <div style={{ padding: '1.25rem 1rem' }}>
                    <div className="form-grid" style={{ marginBottom: '0.75rem' }}>
                      <div className="form-group full-width">
                        <label>Họ tên, tuổi, địa chỉ</label>
                        <input
                          type="text"
                          value={tCase.patientName || tCase.patient_name || ''}
                          onChange={(e) => handleChange(id, 'patientName', e.target.value)}
                          placeholder="VD: Nguyễn Văn A, 45 tuổi, Bình Long, Bình Phước"
                        />
                      </div>
                      <div className="form-group">
                        <label>Giờ / Ngày vào viện</label>
                        <input
                          type="text"
                          value={tCase.admissionTime || tCase.admission_time || ''}
                          onChange={(e) => handleChange(id, 'admissionTime', e.target.value)}
                          placeholder="08:30 ngày 06/08/2026"
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Lý do vào viện</label>
                      <input
                        type="text"
                        value={tCase.reason || ''}
                        onChange={(e) => handleChange(id, 'reason', e.target.value)}
                        placeholder="Đau bụng dữ dội, khó thở..."
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Cận lâm sàng / X-Quang / Xét nghiệm</label>
                      <textarea
                        value={tCase.clinicalTests || tCase.clinical_tests || ''}
                        onChange={(e) => handleChange(id, 'clinicalTests', e.target.value)}
                        placeholder="Kết quả xét nghiệm, hình ảnh X-Quang..."
                        rows={2}
                        className="note-field"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Chẩn đoán</label>
                      <input
                        type="text"
                        value={tCase.diagnosis || ''}
                        onChange={(e) => handleChange(id, 'diagnosis', e.target.value)}
                        placeholder="Chẩn đoán lâm sàng..."
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                      <label>Xử trí ban đầu</label>
                      <textarea
                        value={tCase.initialTreatment || tCase.initial_treatment || ''}
                        onChange={(e) => handleChange(id, 'initialTreatment', e.target.value)}
                        placeholder="Các biện pháp xử trí đã thực hiện..."
                        rows={2}
                        className="note-field"
                      />
                    </div>

                    <div className="form-group">
                      <label>Diễn biến / Hội chẩn / Tình trạng lúc chuyển</label>
                      <textarea
                        value={tCase.progressNotes || tCase.progress_notes || ''}
                        onChange={(e) => handleChange(id, 'progressNotes', e.target.value)}
                        placeholder="Tình trạng bệnh nhân, kết quả hội chẩn, lý do chuyển viện..."
                        rows={3}
                        className="note-field"
                      />
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

export default TransferCaseForm;
