import React from 'react';

const GayMeHoiSucForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateTotal = () => {
    const cc = ['cc_ctch', 'cc_ngoaiTH', 'cc_san'].reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    const ct = ['ct_ctch', 'ct_ngoaiTH', 'ct_san'].reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    return cc + ct;
  };

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">THÔNG TIN CA TRỰC/NHÂN SỰ</h3>
        <div className="form-group full-width">
          <textarea 
            value={formData.nhanSu || ''} 
            onChange={(e) => handleChange('nhanSu', e.target.value)} 
            placeholder="Ghi chú nhân sự trực..." 
            rows={2}
            className="note-field"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ MỔ</h3>
        <div className="form-group full-width" style={{ marginBottom: '15px' }}>
          <label>Tổng số ca mổ</label>
          <input type="number" min="0" step="1" value={formData.tongSoCaMo !== undefined ? formData.tongSoCaMo : calculateTotal()} onChange={(e) => handleChange('tongSoCaMo', e.target.value)} />
          <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Tự động tính hoặc nhập tay</small>
        </div>

        <div className="form-grid">
          <div className="sub-section" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            <h4>Mổ cấp cứu</h4>
            <div className="form-group"><label>CTCH</label><input type="number" min="0" step="1" value={formData.cc_ctch || ''} onChange={(e) => handleChange('cc_ctch', e.target.value)} /></div>
            <div className="form-group"><label>Ngoại TH</label><input type="number" min="0" step="1" value={formData.cc_ngoaiTH || ''} onChange={(e) => handleChange('cc_ngoaiTH', e.target.value)} /></div>
            <div className="form-group"><label>Sản</label><input type="number" min="0" step="1" value={formData.cc_san || ''} onChange={(e) => handleChange('cc_san', e.target.value)} /></div>
          </div>

          <div className="sub-section" style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '4px' }}>
            <h4>Mổ chương trình</h4>
            <div className="form-group"><label>CTCH</label><input type="number" min="0" step="1" value={formData.ct_ctch || ''} onChange={(e) => handleChange('ct_ctch', e.target.value)} /></div>
            <div className="form-group"><label>Ngoại TH</label><input type="number" min="0" step="1" value={formData.ct_ngoaiTH || ''} onChange={(e) => handleChange('ct_ngoaiTH', e.target.value)} /></div>
            <div className="form-group"><label>Sản</label><input type="number" min="0" step="1" value={formData.ct_san || ''} onChange={(e) => handleChange('ct_san', e.target.value)} /></div>
          </div>
        </div>

        <div className="form-group" style={{ marginTop: '15px' }}>
          <label>Hiện còn</label>
          <input type="number" min="0" step="1" value={formData.hienCon || ''} onChange={(e) => handleChange('hienCon', e.target.value)} style={{ maxWidth: '200px' }} />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THÊM GIỜ</h3>
        <div className="form-group full-width">
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleChange('themGio', e.target.value)} 
            placeholder="Ghi chú thêm giờ..." 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default GayMeHoiSucForm;
