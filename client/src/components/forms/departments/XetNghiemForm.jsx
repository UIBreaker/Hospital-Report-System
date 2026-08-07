import React from 'react';

const XetNghiemForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="department-form animate-fade-in">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ XÉT NGHIỆM THỰC HIỆN</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Tổng số lượt xét nghiệm</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tongSo || ''} 
              onChange={(e) => handleChange('tongSo', e.target.value)} 
              placeholder="Nhập tổng số xét nghiệm"
            />
          </div>

          <div className="form-group">
            <label>Bảo hiểm y tế (BHYT)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.baoHiem || ''} 
              onChange={(e) => handleChange('baoHiem', e.target.value)} 
              placeholder="Nhập số lượt BHYT"
            />
          </div>

          <div className="form-group">
            <label>Bệnh nhân Nội trú</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.noiTru || ''} 
              onChange={(e) => handleChange('noiTru', e.target.value)} 
              placeholder="Nhập số lượt Nội trú"
            />
          </div>

          <div className="form-group">
            <label>Bệnh nhân Ngoại trú</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.ngoaiTru || ''} 
              onChange={(e) => handleChange('ngoaiTru', e.target.value)} 
              placeholder="Nhập số lượt Ngoại trú"
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">GHI CHÚ THÊM GIỜ & CA TRỰC</h3>
        <div className="form-group full-width">
          <label>Chi tiết xét nghiệm thêm giờ / Cấp cứu phát sinh</label>
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleChange('themGio', e.target.value)} 
            placeholder="Nhập ghi chú xét nghiệm thêm giờ, ca cấp cứu đêm hoặc sự cố máy xét nghiệm..." 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default XetNghiemForm;
