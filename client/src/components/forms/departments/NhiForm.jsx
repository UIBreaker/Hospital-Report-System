import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const NhiForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const chuyenVienCount = Number(formData.chuyenVien) || 0;

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={formData.benhCu || ''} onChange={(e) => handleChange('benhCu', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới (Phòng khám)</label><input type="number" min="0" step="1" value={formData.benhMoi_pk || ''} onChange={(e) => handleChange('benhMoi_pk', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới (Cấp cứu)</label><input type="number" min="0" step="1" value={formData.benhMoi_cc || ''} onChange={(e) => handleChange('benhMoi_cc', e.target.value)} /></div>
          <div className="form-group"><label>Chuyển viện</label><input type="number" min="0" step="1" value={formData.chuyenVien || ''} onChange={(e) => handleChange('chuyenVien', e.target.value)} /></div>
          <div className="form-group"><label>Xuất viện</label><input type="number" min="0" step="1" value={formData.xuat || ''} onChange={(e) => handleChange('xuat', e.target.value)} /></div>
          
          <div className="form-group">
            <label>Hiện có</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input type="number" min="0" step="1" value={formData.hienCo || ''} onChange={(e) => handleChange('hienCo', e.target.value)} style={{ width: '40%' }} />
              <input type="text" value={formData.hienCoGhiChu || ''} onChange={(e) => handleChange('hienCoGhiChu', e.target.value)} placeholder="VD: SXH: 9" style={{ width: '60%' }} />
            </div>
          </div>
          
          <div className="form-group">
            <label>Phòng khám</label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <input type="text" value={formData.pk || ''} onChange={(e) => handleChange('pk', e.target.value)} placeholder="VD: 45/42" style={{ width: '40%' }} />
              <input type="text" value={formData.pkGhiChu || ''} onChange={(e) => handleChange('pkGhiChu', e.target.value)} placeholder="VD: CV: 2" style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </div>

      {chuyenVienCount > 0 && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} count={chuyenVienCount} />
      )}
    </div>
  );
};

export default NhiForm;
