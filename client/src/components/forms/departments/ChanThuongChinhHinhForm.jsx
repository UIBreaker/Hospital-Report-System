import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const ChanThuongChinhHinhForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.benhChuyenVien) || 0;

  return (
    <div className="department-form animate-fade-in">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN NỘI TRÚ</h3>
        
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
            <label>Bệnh mới (Nhập viện)</label>
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
            <label>Bệnh xuất viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhXuat || ''} 
              onChange={(e) => handleChange('benhXuat', e.target.value)} 
              placeholder="Nhập số bệnh xuất"
            />
          </div>

          <div className="form-group">
            <label>Bệnh chuyển viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhChuyenVien || ''} 
              onChange={(e) => handleChange('benhChuyenVien', e.target.value)} 
              placeholder="Nhập số chuyển viện"
            />
          </div>

          <div className="form-group">
            <label>Bệnh chuyển khoa</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhChuyenKhoa || ''} 
              onChange={(e) => handleChange('benhChuyenKhoa', e.target.value)} 
              placeholder="Nhập số chuyển khoa"
            />
          </div>

          <div className="form-group">
            <label>Tử vong</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tuVong || ''} 
              onChange={(e) => handleChange('tuVong', e.target.value)} 
              placeholder="Nhập số ca tử vong"
            />
          </div>
        </div>

        <div className="sub-section" style={{ marginTop: '1.25rem', borderLeft: '4px solid var(--primary-light)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Hiện còn tại khoa</h4>
          <div className="form-group">
            <label>Số lượng bệnh nhân & Ghi chú phòng / buồng</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.hienCon || ''} 
                onChange={(e) => handleChange('hienCon', e.target.value)} 
                placeholder="Số lượng"
                style={{ width: '35%' }} 
              />
              <input 
                type="text" 
                value={formData.hienConGhiChu || ''} 
                onChange={(e) => handleChange('hienConGhiChu', e.target.value)} 
                placeholder="Ghi chú vị trí/phòng (VD: 7HP, 2 phòng mổ...)" 
                style={{ width: '65%' }} 
              />
            </div>
          </div>
        </div>
      </div>

      {chuyenVienCount > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} count={chuyenVienCount} />
        </div>
      )}

      <div className="form-section">
        <h3 className="section-title">THÔNG TIN KHÁM BỆNH & TUYẾN TRÊN</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Tổng số lượt khám bệnh</label>
            <input 
              type="text" 
              value={formData.tongSoKham || ''} 
              onChange={(e) => handleChange('tongSoKham', e.target.value)} 
              placeholder="VD: 58/53 (Tổng số / BHYT)" 
            />
          </div>
          <div className="form-group">
            <label>Chuyển viện tuyến trên</label>
            <input 
              type="text" 
              value={formData.chuyenVienTT || ''} 
              onChange={(e) => handleChange('chuyenVienTT', e.target.value)} 
              placeholder="Nhập chi tiết ca chuyển viện tuyến trên"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChanThuongChinhHinhForm;
