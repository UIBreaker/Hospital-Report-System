import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const NgoaiTongHopForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.benhChuyenVien) || 0;

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={formData.benhCu || ''} onChange={(e) => handleChange('benhCu', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới</label><input type="number" min="0" step="1" value={formData.benhMoi || ''} onChange={(e) => handleChange('benhMoi', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh xuất</label><input type="number" min="0" step="1" value={formData.benhXuat || ''} onChange={(e) => handleChange('benhXuat', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh chuyển viện</label><input type="number" min="0" step="1" value={formData.benhChuyenVien || ''} onChange={(e) => handleChange('benhChuyenVien', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh chuyển khoa</label><input type="number" min="0" step="1" value={formData.benhChuyenKhoa || ''} onChange={(e) => handleChange('benhChuyenKhoa', e.target.value)} /></div>
          <div className="form-group"><label>Tử vong</label><input type="number" min="0" step="1" value={formData.tuVong || ''} onChange={(e) => handleChange('tuVong', e.target.value)} /></div>
          <div className="form-group"><label>Hiện còn</label><input type="number" min="0" step="1" value={formData.hienCon || ''} onChange={(e) => handleChange('hienCon', e.target.value)} /></div>
          <div className="form-group"><label>Hậu phẫu</label><input type="number" min="0" step="1" value={formData.hauPhau || ''} onChange={(e) => handleChange('hauPhau', e.target.value)} /></div>
        </div>
      </div>

      {(chuyenVienCount > 0 || transferCases.length > 0) && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} />
      )}

      <div className="form-section">
        <div className="form-group full-width">
          <label>Tổng số khám bệnh</label>
          <input type="number" min="0" step="1" value={formData.tongSoKham || ''} onChange={(e) => handleChange('tongSoKham', e.target.value)} />
        </div>
      </div>
    </div>
  );
};

export default NgoaiTongHopForm;
