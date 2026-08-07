import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const SanForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.benhChuyenVien) || 0;

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">CHỈ SỐ NỘI TRÚ CHUNG</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={formData.benhCu || ''} onChange={(e) => handleChange('benhCu', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới</label><input type="number" min="0" step="1" value={formData.benhMoi || ''} onChange={(e) => handleChange('benhMoi', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh xuất</label><input type="number" min="0" step="1" value={formData.benhXuat || ''} onChange={(e) => handleChange('benhXuat', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh chuyển viện</label><input type="number" min="0" step="1" value={formData.benhChuyenVien || ''} onChange={(e) => handleChange('benhChuyenVien', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh chuyển khoa</label><input type="number" min="0" step="1" value={formData.benhChuyenKhoa || ''} onChange={(e) => handleChange('benhChuyenKhoa', e.target.value)} /></div>
          <div className="form-group"><label>Hiện có</label><input type="number" min="0" step="1" value={formData.hienCo || ''} onChange={(e) => handleChange('hienCo', e.target.value)} /></div>
        </div>
      </div>

      {chuyenVienCount > 0 && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} count={chuyenVienCount} />
      )}

      <div className="form-section">
        <h3 className="section-title">CHỈ SỐ SẢN KHOA ĐẶC THÙ</h3>
        <div className="form-grid">
          <div className="form-group"><label>Hậu phẫu</label><input type="number" min="0" step="1" value={formData.hauPhau || ''} onChange={(e) => handleChange('hauPhau', e.target.value)} /></div>
          <div className="form-group"><label>Tổng số khám</label><input type="text" value={formData.tongSoKham || ''} onChange={(e) => handleChange('tongSoKham', e.target.value)} placeholder="VD: 36/11" /></div>
          <div className="form-group"><label>Sanh thường</label><input type="number" min="0" step="1" value={formData.sanhThuong || ''} onChange={(e) => handleChange('sanhThuong', e.target.value)} /></div>
          <div className="form-group"><label>Sanh hút</label><input type="number" min="0" step="1" value={formData.sanhHut || ''} onChange={(e) => handleChange('sanhHut', e.target.value)} /></div>
          <div className="form-group"><label>Chờ sanh</label><input type="number" min="0" step="1" value={formData.choSanh || ''} onChange={(e) => handleChange('choSanh', e.target.value)} /></div>
          <div className="form-group"><label>Siêu âm</label><input type="number" min="0" step="1" value={formData.sieuAm || ''} onChange={(e) => handleChange('sieuAm', e.target.value)} /></div>
          <div className="form-group"><label>Chuyển viện ngoại trú</label><input type="number" min="0" step="1" value={formData.chuyenVienNgoaiTru || ''} onChange={(e) => handleChange('chuyenVienNgoaiTru', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};

export default SanForm;
