import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const NhiForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.chuyenVien) || 0;

  return (
    <div className="department-form animate-fade-in">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN NỘI TRÚ KHOA NHI</h3>
        
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
            <label>Bệnh mới (Từ Phòng khám)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhMoi_pk || ''} 
              onChange={(e) => handleChange('benhMoi_pk', e.target.value)} 
              placeholder="Nhập số bệnh mới từ PK"
            />
          </div>

          <div className="form-group">
            <label>Bệnh mới (Từ Cấp cứu)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhMoi_cc || ''} 
              onChange={(e) => handleChange('benhMoi_cc', e.target.value)} 
              placeholder="Nhập số bệnh mới từ CC"
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
              placeholder="Nhập số chuyển viện"
            />
          </div>

          <div className="form-group">
            <label>Xuất viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.xuat || ''} 
              onChange={(e) => handleChange('xuat', e.target.value)} 
              placeholder="Nhập số ca xuất viện"
            />
          </div>
        </div>

        <div className="sub-section" style={{ marginTop: '1.25rem', borderLeft: '4px solid var(--primary-light)' }}>
          <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: 700 }}>Hiện có tại khoa</h4>
          <div className="form-group">
            <label>Số lượng bệnh nhân hiện có & Ghi chú phân loại bệnh</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.hienCo || ''} 
                onChange={(e) => handleChange('hienCo', e.target.value)} 
                placeholder="Số BN hiện có"
                style={{ width: '35%' }} 
              />
              <input 
                type="text" 
                value={formData.hienCoGhiChu || ''} 
                onChange={(e) => handleChange('hienCoGhiChu', e.target.value)} 
                placeholder="Ghi chú bệnh lý (VD: SXH: 9, Viêm phổi: 5...)" 
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
        <h3 className="section-title">THỐNG KÊ PHÒNG KHÁM NHI</h3>
        <div className="sub-section" style={{ borderLeft: '4px solid var(--brand-green)' }}>
          <div className="form-group">
            <label>Số lượt khám & Chi tiết chuyển viện / nhập viện tại phòng khám</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={formData.pk || ''} 
                onChange={(e) => handleChange('pk', e.target.value)} 
                placeholder="Lượt khám (VD: 45/42)" 
                style={{ width: '40%' }} 
              />
              <input 
                type="text" 
                value={formData.pkGhiChu || ''} 
                onChange={(e) => handleChange('pkGhiChu', e.target.value)} 
                placeholder="Ghi chú phòng khám (VD: CV: 2, Nhập viện: 4...)" 
                style={{ width: '60%' }} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NhiForm;
