import React from 'react';

const XetNghiemForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ</h3>
        <div className="form-grid">
          <div className="form-group"><label>Tổng số</label><input type="number" min="0" step="1" value={formData.tongSo || ''} onChange={(e) => handleChange('tongSo', e.target.value)} /></div>
          <div className="form-group"><label>Bảo hiểm</label><input type="number" min="0" step="1" value={formData.baoHiem || ''} onChange={(e) => handleChange('baoHiem', e.target.value)} /></div>
          <div className="form-group"><label>Nội trú</label><input type="number" min="0" step="1" value={formData.noiTru || ''} onChange={(e) => handleChange('noiTru', e.target.value)} /></div>
          <div className="form-group"><label>Ngoại trú</label><input type="number" min="0" step="1" value={formData.ngoaiTru || ''} onChange={(e) => handleChange('ngoaiTru', e.target.value)} /></div>
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

export default XetNghiemForm;
