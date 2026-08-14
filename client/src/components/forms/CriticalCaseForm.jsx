import React, { useState, useCallback } from 'react';
import { 
  FaHeartbeat, 
  FaPlus, 
  FaTrash, 
  FaChevronDown, 
  FaChevronUp, 
  FaUserInjured, 
  FaCopy, 
  FaCheck, 
  FaNotesMedical, 
  FaHospitalUser, 
  FaStethoscope, 
  FaHistory, 
  FaPills, 
  FaClock, 
  FaMapMarkerAlt 
} from 'react-icons/fa';
import CaseImageUploader from '../common/CaseImageUploader';

const CriticalCaseForm = ({ 
  criticalCases = [], 
  setCriticalCases, 
  departmentName = '',
  reportDate = '' 
}) => {
  const [expanded, setExpanded] = useState({});
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const toggleExpand = useCallback((id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Functional updater to avoid stale closure bug
  const handleChange = useCallback((id, field, value) => {
    setCriticalCases(prev =>
      prev.map(cc => {
        const itemKey = cc._id || cc.id;
        if (itemKey === id) {
          return { 
            ...cc, 
            [field]: value,
            // Đồng bộ cả snake_case để tương thích ngược 100%
            ...(field === 'patientName' ? { patient_name: value } : {}),
            ...(field === 'admissionTime' ? { admission_time: value } : {}),
            ...(field === 'medicalHistory' ? { medical_history: value } : {}),
            ...(field === 'conditionSummary' ? { condition_summary: value } : {}),
            ...(field === 'progressNotes' ? { condition_summary: value } : {})
          };
        }
        return cc;
      })
    );
  }, [setCriticalCases]);

  const addCase = useCallback(() => {
    const newId = `cc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setCriticalCases(prev => [
      ...prev,
      {
        _id: newId,
        patientName: '',
        patient_name: '',
        age: '',
        address: '',
        admissionTime: '',
        admission_time: '',
        medicalHistory: '',
        medical_history: '',
        diagnosis: '',
        conditionSummary: '',
        condition_summary: '',
        treatment: '',
        notes: 'Bàn giao tua sau theo dõi tiếp',
        images: []
      }
    ]);
    setExpanded(prev => ({ ...prev, [newId]: true }));
  }, [setCriticalCases]);

  const removeCase = useCallback((id) => {
    setCriticalCases(prev => prev.filter(cc => (cc._id || cc.id) !== id));
    setExpanded(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, [setCriticalCases]);

  // Format a single case to medical text template
  const formatSingleCaseText = (cc, index) => {
    const name = cc.patientName || cc.patient_name || 'BỆNH NHÂN CHƯA NHẬP TÊN';
    const age = cc.age ? ` - ${cc.age} tuổi` : '';
    const addr = cc.address ? ` - ${cc.address}` : '';
    const vv = cc.admissionTime || cc.admission_time || 'Chưa ghi';
    const history = cc.medicalHistory || cc.medical_history || 'Không';
    const diag = cc.diagnosis || 'Chưa có chẩn đoán';
    const condition = cc.conditionSummary || cc.condition_summary || 'Chưa cập nhật diễn biến';
    const treat = cc.treatment || 'Chưa ghi nhận xử trí';
    const note = cc.notes || 'Bàn giao tua sau theo dõi tiếp';

    return `${index + 1}/ BN: ${name.toUpperCase()}${age}${addr}
- VV: ${vv}
- Tiền căn: ${history}
- Chẩn đoán: ${diag}
- Tình trạng & Diễn biến: ${condition}
- Xử trí: ${treat}
- Hướng tiếp theo: ${note}`;
  };

  // Copy single case
  const copySingleCase = (cc, index, e) => {
    e.stopPropagation();
    const text = formatSingleCaseText(cc, index);
    navigator.clipboard.writeText(text);
    const key = cc._id || cc.id;
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Copy all critical cases to clipboard (formatted for Zalo/Briefing)
  const copyAllCases = () => {
    if (criticalCases.length === 0) return;
    
    let header = `⚡ BÁO CÁO BỆNH NHÂN NẶNG THEO DÕI${departmentName ? ` — KHOA ${departmentName.toUpperCase()}` : ''}`;
    if (reportDate) header += `\n📅 Ngày báo cáo: ${reportDate}`;
    header += `\n${'='.repeat(40)}\n`;

    const body = criticalCases.map((cc, idx) => formatSingleCaseText(cc, idx)).join(`\n${'-'.repeat(40)}\n`);
    const fullText = `${header}${body}\n${'='.repeat(40)}`;

    navigator.clipboard.writeText(fullText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2500);
  };

  return (
    <div className="form-section animate-fade-in" style={{
      marginTop: '1.5rem',
      borderLeft: '4px solid #7C3AED',
      borderRadius: 'var(--radius-md)',
      background: '#F5F3FF',
      padding: '1.25rem'
    }}>
      {/* Header */}
      <div className="critical-case-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <h3 className="section-title" style={{ margin: 0, padding: 0, border: 'none', color: '#5B21B6', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.05rem', fontWeight: '800' }}>
          <FaHeartbeat style={{ color: '#7C3AED', fontSize: '1.2rem' }} />
          BỆNH NẶNG THEO DÕI {criticalCases.length > 0 ? `(${criticalCases.length} ca)` : ''}
        </h3>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {criticalCases.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={copyAllCases}
              title="Sao chép toàn bộ danh sách ca nặng để gửi Zalo hoặc nhóm giao ban"
              style={{
                fontSize: '0.82rem',
                padding: '0.45rem 0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#EDE9FE',
                color: '#6D28D9',
                borderColor: '#DDD6FE',
                fontWeight: '700'
              }}
            >
              {copiedAll ? <><FaCheck style={{ color: '#16A34A' }} /> Đã sao chép!</> : <><FaCopy /> Sao chép mẫu Zalo</>}
            </button>
          )}

          <button
            type="button"
            className="btn btn-secondary"
            onClick={addCase}
            style={{
              fontSize: '0.85rem',
              padding: '0.45rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#7C3AED',
              color: '#FFFFFF',
              borderColor: '#6D28D9',
              fontWeight: '700',
              boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
            }}
          >
            <FaPlus /> Thêm Bệnh Nhân Nặng
          </button>
        </div>
      </div>

      {/* Empty state */}
      {criticalCases.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '2rem',
          backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)',
          border: '2px dashed #DDD6FE', color: 'var(--text-muted)'
        }}>
          <FaHeartbeat style={{ fontSize: '2.4rem', marginBottom: '0.5rem', color: '#7C3AED', opacity: 0.4 }} />
          <p style={{ margin: '0 0 0.4rem 0', fontWeight: '600', color: '#4C1D95' }}>Không có bệnh nhân nặng theo dõi nào trong ca trực.</p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Nhấn <strong>«+ Thêm Bệnh Nhân Nặng»</strong> để ghi nhận các ca bệnh nặng cần bàn giao theo dõi sát.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {criticalCases.map((cc, index) => {
            const id = cc._id || cc.id;
            const isExp = expanded[id] !== false; // Default open
            const patientDisplayName = cc.patientName || cc.patient_name || `Bệnh nhân nặng #${index + 1}`;
            const isThisCopied = copiedId === id;

            return (
              <div 
                key={id} 
                className="card animate-scale-up" 
                style={{ 
                  padding: 0, 
                  overflow: 'hidden', 
                  border: '1px solid #DDD6FE', 
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.08)',
                  backgroundColor: '#FFFFFF'
                }}
              >
                {/* Card Header Bar */}
                <div 
                  onClick={() => toggleExpand(id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: isExp ? '#EDE9FE' : '#F5F3FF',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: isExp ? '1px solid #DDD6FE' : 'none',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#7C3AED',
                      color: '#FFFFFF',
                      fontSize: '0.8rem',
                      fontWeight: '800'
                    }}>
                      {index + 1}
                    </span>
                    <span style={{ fontWeight: '800', color: '#4C1D95', fontSize: '0.95rem' }}>
                      {patientDisplayName}
                    </span>
                    {cc.age && (
                      <span style={{ fontSize: '0.8rem', color: '#6D28D9', backgroundColor: '#DDD6FE', padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: '600' }}>
                        {cc.age} tuổi
                      </span>
                    )}
                    {cc.diagnosis && (
                      <span style={{ fontSize: '0.8rem', color: '#5B21B6', maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        • {cc.diagnosis}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {/* Copy Single Case Button */}
                    <button
                      type="button"
                      onClick={(e) => copySingleCase(cc, index, e)}
                      title="Sao chép ca bệnh này"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #DDD6FE',
                        color: isThisCopied ? '#16A34A' : '#6D28D9',
                        borderRadius: '6px',
                        padding: '0.3rem 0.6rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem'
                      }}
                    >
                      {isThisCopied ? <><FaCheck /> Đã chép</> : <><FaCopy /> Chép ca</>}
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCase(id);
                      }}
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                      title="Xóa ca bệnh này"
                    >
                      <FaTrash /> Xóa
                    </button>
                    {isExp ? <FaChevronUp style={{ color: '#7C3AED' }} /> : <FaChevronDown style={{ color: '#7C3AED' }} />}
                  </div>
                </div>

                {/* Card Form Body */}
                {isExp && (
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Hàng 1: Họ tên + Tuổi + Địa chỉ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                      <div className="form-group">
                        <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                          <FaUserInjured style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                          Họ và tên bệnh nhân <span style={{ color: 'var(--brand-red)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="VD: LÊ XUÂN BẠN"
                          value={cc.patientName || cc.patient_name || ''}
                          onChange={(e) => handleChange(id, 'patientName', e.target.value)}
                          style={{ borderColor: '#DDD6FE', fontWeight: '700', color: '#1E1B4B' }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                          Tuổi / Năm sinh
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 65 hoặc 1959"
                          value={cc.age || ''}
                          onChange={(e) => handleChange(id, 'age', e.target.value)}
                          style={{ borderColor: '#DDD6FE' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                          <FaMapMarkerAlt style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                          Địa chỉ / Phường xã
                        </label>
                        <input
                          type="text"
                          placeholder="VD: P. An Lộc hoặc TTBT Tân Hiệp"
                          value={cc.address || ''}
                          onChange={(e) => handleChange(id, 'address', e.target.value)}
                          style={{ borderColor: '#DDD6FE' }}
                        />
                      </div>
                    </div>

                    {/* Hàng 2: Thời gian vào viện (VV) + Tiền căn */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
                      <div className="form-group">
                        <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                          <FaClock style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                          Thời gian vào viện (VV)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: 7h05 ngày 12/08/2026"
                          value={cc.admissionTime || cc.admission_time || ''}
                          onChange={(e) => handleChange(id, 'admissionTime', e.target.value)}
                          style={{ borderColor: '#DDD6FE' }}
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                          <FaHistory style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                          Tiền căn bệnh (Tùy chọn)
                        </label>
                        <input
                          type="text"
                          placeholder="VD: THA – Nhồi máu não, ĐTĐ Type 2..."
                          value={cc.medicalHistory || cc.medical_history || ''}
                          onChange={(e) => handleChange(id, 'medicalHistory', e.target.value)}
                          style={{ borderColor: '#DDD6FE' }}
                        />
                      </div>
                    </div>

                    {/* Hàng 3: Chẩn đoán */}
                    <div className="form-group">
                      <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                        <FaStethoscope style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                        Chẩn đoán bệnh <span style={{ color: 'var(--brand-red)' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Suy hô hấp cấp / Viêm phổi nặng / THA"
                        value={cc.diagnosis || ''}
                        onChange={(e) => handleChange(id, 'diagnosis', e.target.value)}
                        style={{ borderColor: '#DDD6FE', fontWeight: '600' }}
                        required
                      />
                    </div>

                    {/* Hàng 4: Tình trạng bệnh / Diễn biến (Giao ban & Trong ngày) - Textarea lớn */}
                    <div className="form-group">
                      <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                        <FaNotesMedical style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                        Tình trạng bệnh & Diễn biến (Giao ban & Trong ngày) <span style={{ color: 'var(--brand-red)' }}>*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Nhập chi tiết tình trạng: Tri giác, sinh hiệu (HA, SpO2, Mạch, Nhiệt độ), nước tiểu/24h, diễn biến trong ca trực và sáng nay..."
                        value={cc.conditionSummary || cc.condition_summary || ''}
                        onChange={(e) => handleChange(id, 'conditionSummary', e.target.value)}
                        style={{ borderColor: '#DDD6FE', lineHeight: '1.5', fontSize: '0.875rem' }}
                        required
                      />
                    </div>

                    {/* Hàng 5: Xử trí điều trị */}
                    <div className="form-group">
                      <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                        <FaPills style={{ marginRight: '0.35rem', color: '#7C3AED' }} />
                        Xử trí điều trị
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Oxi - KS - vận mạch - PPI, hồi sức tích cực"
                        value={cc.treatment || ''}
                        onChange={(e) => handleChange(id, 'treatment', e.target.value)}
                        style={{ borderColor: '#DDD6FE' }}
                      />
                    </div>

                    {/* Hàng 6: Hướng tiếp theo / Ghi chú (Mặc định: Bàn giao tua sau theo dõi tiếp) */}
                    <div className="form-group">
                      <label style={{ color: '#4C1D95', fontWeight: '700', fontSize: '0.85rem' }}>
                        Ghi chú / Hướng xử trí tiếp theo
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Bàn giao tua sau theo dõi tiếp"
                        value={cc.notes !== undefined ? cc.notes : 'Bàn giao tua sau theo dõi tiếp'}
                        onChange={(e) => handleChange(id, 'notes', e.target.value)}
                        style={{ borderColor: '#DDD6FE' }}
                      />
                    </div>

                    {/* Hàng 7: Hình ảnh y khoa minh họa (X-Quang, CT, ECG, sinh hiệu...) */}
                    <CaseImageUploader
                      images={cc.images}
                      onChange={(newImgs) => handleChange(id, 'images', newImgs)}
                      theme="purple"
                      patientName={cc.patientName || cc.patient_name}
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

export default CriticalCaseForm;
