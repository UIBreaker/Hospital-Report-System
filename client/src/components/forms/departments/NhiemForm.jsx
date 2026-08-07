import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const NhiemForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.chuyenVien) || 0;

  return (
    <div className="department-form">
      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>Điều dưỡng trực (ĐD)</label>
            <input type="text" value={formData.dieuDuongTruc || ''} onChange={(e) => handleChange('dieuDuongTruc', e.target.value)} placeholder="Nhập tên ĐD trực" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={formData.benhCu || ''} onChange={(e) => handleChange('benhCu', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới</label><input type="number" min="0" step="1" value={formData.benhMoi || ''} onChange={(e) => handleChange('benhMoi', e.target.value)} /></div>
          <div className="form-group"><label>Chuyển viện</label><input type="number" min="0" step="1" value={formData.chuyenVien || ''} onChange={(e) => handleChange('chuyenVien', e.target.value)} /></div>
          <div className="form-group"><label>Chuyển khoa Sản</label><input type="number" min="0" step="1" value={formData.chuyenKhoaSan || ''} onChange={(e) => handleChange('chuyenKhoaSan', e.target.value)} /></div>
          <div className="form-group"><label>Xin xuất viện</label><input type="number" min="0" step="1" value={formData.xinXuatVien || ''} onChange={(e) => handleChange('xinXuatVien', e.target.value)} /></div>
          <div className="form-group"><label>Hiện còn</label><input type="number" min="0" step="1" value={formData.hienCon || ''} onChange={(e) => handleChange('hienCon', e.target.value)} /></div>
        </div>
      </div>

      {chuyenVienCount > 0 && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} count={chuyenVienCount} />
      )}

      <div className="form-section">
        <h3 className="section-title">GHI CHÚ</h3>
        <div className="form-group full-width" style={{ marginBottom: '15px' }}>
          <label>Thêm giờ</label>
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleChange('themGio', e.target.value)} 
            placeholder="VD: 19h: 01 BN nhập viện..." 
            rows={3}
            className="note-field"
          />
        </div>
        <div className="form-group full-width">
          <label>Tình hình chung</label>
          <textarea 
            value={formData.tinhHinhChung || ''} 
            onChange={(e) => handleChange('tinhHinhChung', e.target.value)} 
            placeholder="Ghi chú tình hình trực chung" 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default NhiemForm;
