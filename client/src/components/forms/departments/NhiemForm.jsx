import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const NhiemForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.chuyenVien) || 0;

  return (
    <div className="department-form animate-fade-in">
      <div className="form-section">
        <h3 className="section-title">THÔNG TIN CA TRỰC & NHÂN SỰ</h3>
        <div className="form-grid">
          <div className="form-group full-width">
            <label>Điều dưỡng trực (ĐD trực)</label>
            <input 
              type="text" 
              value={formData.dieuDuongTruc || ''} 
              onChange={(e) => handleChange('dieuDuongTruc', e.target.value)} 
              placeholder="Nhập họ tên điều dưỡng trực..." 
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN KHOA NHIỄM</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Bệnh cũ (Đang điều trị)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhCu || ''} 
              onChange={(e) => handleChange('benhCu', e.target.value)} 
              placeholder="Nhập số bệnh nhân cũ"
            />
          </div>

          <div className="form-group">
            <label>Bệnh mới nhập viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhMoi || ''} 
              onChange={(e) => handleChange('benhMoi', e.target.value)} 
              placeholder="Nhập số bệnh nhân mới"
            />
          </div>

          <div className="form-group">
            <label>Chuyển viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.chuyenVien || ''} 
              onChange={(e) => handleChange('chuyenVien', e.target.value)} 
              placeholder="Nhập số ca chuyển viện"
            />
          </div>

          <div className="form-group">
            <label>Chuyển khoa Sản</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.chuyenKhoaSan || ''} 
              onChange={(e) => handleChange('chuyenKhoaSan', e.target.value)} 
              placeholder="Nhập số ca chuyển Sản"
            />
          </div>

          <div className="form-group">
            <label>Xin xuất viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.xinXuatVien || ''} 
              onChange={(e) => handleChange('xinXuatVien', e.target.value)} 
              placeholder="Nhập số ca xin xuất viện"
            />
          </div>

          <div className="form-group">
            <label>Hiện còn điều trị</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.hienCon || ''} 
              onChange={(e) => handleChange('hienCon', e.target.value)} 
              placeholder="Nhập số BN hiện còn"
            />
          </div>
        </div>
      </div>

      {chuyenVienCount > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} count={chuyenVienCount} />
        </div>
      )}

      <div className="form-section">
        <h3 className="section-title">DIỄN BIẾN CA TRỰC & GHI CHÚ</h3>
        <div className="form-group full-width" style={{ marginBottom: '1.25rem' }}>
          <label>Diễn biến thêm giờ (Theo mốc thời gian)</label>
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleChange('themGio', e.target.value)} 
            placeholder="VD: 19h: 01 BN nhập viện chẩn đoán Sốt xuất huyết Dengue..." 
            rows={3}
            className="note-field"
          />
        </div>

        <div className="form-group full-width">
          <label>Tình hình chung ca trực</label>
          <textarea 
            value={formData.tinhHinhChung || ''} 
            onChange={(e) => handleChange('tinhHinhChung', e.target.value)} 
            placeholder="Ghi chú chi tiết tình hình ca trực, bệnh nhân nặng hoặc lưu ý bàn giao..." 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default NhiemForm;
