import React, { useState } from 'react';
import { FaAmbulance, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const TransferCaseForm = ({ transferCases = [], setTransferCases }) => {
  const [expanded, setExpanded] = useState({});

  const toggleExpand = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleChange = (index, field, value) => {
    const updatedCases = [...transferCases];
    updatedCases[index] = { ...updatedCases[index], [field]: value };
    setTransferCases(updatedCases);
  };

  const addCase = () => {
    const newIndex = transferCases.length;
    setTransferCases([
      ...transferCases,
      {
        patientName: '',
        admissionTime: '',
        reason: '',
        clinicalTests: '',
        diagnosis: '',
        initialTreatment: '',
        progressNotes: ''
      }
    ]);
    setExpanded(prev => ({ ...prev, [newIndex]: true }));
  };

  const removeCase = (index) => {
    const updatedCases = transferCases.filter((_, i) => i !== index);
    setTransferCases(updatedCases);
  };

  return (
    <div className="form-section animate-fade-in" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--danger)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: 'var(--danger)' }}>
          <FaAmbulance style={{ marginRight: '8px' }} />
          BỆNH CHUYỂN VIỆN {transferCases.length > 0 ? `(${transferCases.length} ca)` : ''}
        </h3>
        <button 
          type="button" 
          className="btn btn-secondary transfer-btn" 
          onClick={addCase}
          style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }}
        >
          <FaPlus /> Thêm Ca Chuyển Viện
        </button>
      </div>

      {transferCases.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
          Nhấn nút <strong>"+ Thêm Ca Chuyển Viện"</strong> ở trên để nhập thông tin chi tiết từng ca chuyển viện.
        </div>
      ) : (
        transferCases.map((tCase, index) => {
          const isExpanded = expanded[index] ?? true;
          return (
            <div 
              key={index} 
              className="sub-section" 
              style={{ 
                marginBottom: '1rem', 
                border: '1px solid var(--border)', 
                borderRadius: 'var(--radius-md)',
                backgroundColor: isExpanded ? '#FFF' : '#F8FAFC',
                boxShadow: isExpanded ? 'var(--shadow-sm)' : 'none',
                overflow: 'hidden'
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  justify: 'space-between', 
                  alignItems: 'center', 
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  backgroundColor: '#F1F5F9',
                  borderBottom: isExpanded ? '1px solid var(--border)' : 'none',
                  userSelect: 'none'
                }} 
                onClick={() => toggleExpand(index)}
              >
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary)' }}>
                  🚑 Ca chuyển viện #{index + 1} {tCase.patientName ? `— ${tCase.patientName}` : ''}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); removeCase(index); }} 
                    className="btn btn-danger btn-sm"
                    title="Xóa ca này"
                    style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    <FaTrash /> Xóa
                  </button>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                </div>
              </div>
              
              {isExpanded && (
                <div className="form-grid" style={{ padding: '1rem', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Họ tên, tuổi, địa chỉ</label>
                    <input 
                      type="text" 
                      value={tCase.patientName || ''} 
                      onChange={(e) => handleChange(index, 'patientName', e.target.value)} 
                      placeholder="VD: Nguyễn Văn A, 45T, Bình Long" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Giờ/ngày vào viện</label>
                    <input 
                      type="text" 
                      value={tCase.admissionTime || ''} 
                      onChange={(e) => handleChange(index, 'admissionTime', e.target.value)} 
                      placeholder="VD: 08:30 15/10/2023" 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Lý do vào viện</label>
                    <input 
                      type="text" 
                      value={tCase.reason || ''} 
                      onChange={(e) => handleChange(index, 'reason', e.target.value)} 
                      placeholder="Lý do vào viện..." 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Cận lâm sàng / X-Quang / XN</label>
                    <textarea 
                      value={tCase.clinicalTests || ''} 
                      onChange={(e) => handleChange(index, 'clinicalTests', e.target.value)} 
                      placeholder="Kết quả cận lâm sàng..." 
                      rows={2} 
                      className="note-field" 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Chẩn đoán</label>
                    <input 
                      type="text" 
                      value={tCase.diagnosis || ''} 
                      onChange={(e) => handleChange(index, 'diagnosis', e.target.value)} 
                      placeholder="Chẩn đoán..." 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Xử trí ban đầu</label>
                    <textarea 
                      value={tCase.initialTreatment || ''} 
                      onChange={(e) => handleChange(index, 'initialTreatment', e.target.value)} 
                      placeholder="Các biện pháp xử trí..." 
                      rows={2} 
                      className="note-field" 
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Diễn biến / Hội chẩn / Tình trạng lúc chuyển</label>
                    <textarea 
                      value={tCase.progressNotes || ''} 
                      onChange={(e) => handleChange(index, 'progressNotes', e.target.value)} 
                      placeholder="Tình trạng diễn biến..." 
                      rows={3} 
                      className="note-field" 
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransferCaseForm;
