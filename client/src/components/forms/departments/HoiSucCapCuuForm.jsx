import React from 'react';
import TransferCaseForm from '../TransferCaseForm';

const HoiSucCapCuuForm = ({ doctorName, formData, setFormData, transferCases, setTransferCases }) => {
  const hscc = formData.hscc || {};
  const tnt = formData.tnt || {};
  const pk21 = formData.pk21 || {};

  const handleHsccChange = (field, value) => {
    setFormData({ ...formData, hscc: { ...hscc, [field]: value } });
  };
  const handleTntChange = (field, value) => {
    setFormData({ ...formData, tnt: { ...tnt, [field]: value } });
  };
  const handlePk21Change = (field, value) => {
    setFormData({ ...formData, pk21: { ...pk21, [field]: value } });
  };

  const chuyenVienCount = (Number(hscc.chuyenVien) || 0) + (Number(pk21.pk21_chuyenVien) || 0);

  return (
    <div className="department-form">
      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>BS trực HSCC</label>
            <input type="text" value={doctorName || ''} readOnly style={{ backgroundColor: '#f5f5f5' }} />
          </div>
          <div className="form-group">
            <label>BS trực TNT</label>
            <input type="text" value={formData.bsTrucTNT || ''} onChange={(e) => setFormData({...formData, bsTrucTNT: e.target.value})} placeholder="Nhập tên BS trực TNT" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">KHỐI HỒI SỨC CẤP CỨU (HSCC)</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={hscc.benhCu || ''} onChange={(e) => handleHsccChange('benhCu', e.target.value)} placeholder="0" /></div>
          <div className="form-group"><label>Bệnh mới</label><input type="number" min="0" step="1" value={hscc.benhMoi || ''} onChange={(e) => handleHsccChange('benhMoi', e.target.value)} placeholder="0" /></div>
          <div className="form-group"><label>Xuất viện</label><input type="number" min="0" step="1" value={hscc.xuatVien || ''} onChange={(e) => handleHsccChange('xuatVien', e.target.value)} placeholder="0" /></div>
          <div className="form-group"><label>Chuyển viện</label><input type="number" min="0" step="1" value={hscc.chuyenVien || ''} onChange={(e) => handleHsccChange('chuyenVien', e.target.value)} placeholder="0" /></div>
          <div className="form-group"><label>Chuyển khoa</label><input type="number" min="0" step="1" value={hscc.chuyenKhoa || ''} onChange={(e) => handleHsccChange('chuyenKhoa', e.target.value)} placeholder="0" /></div>
          <div className="form-group"><label>Hiện còn</label><input type="number" min="0" step="1" value={hscc.hienCon || ''} onChange={(e) => handleHsccChange('hienCon', e.target.value)} placeholder="0" /></div>
          <div className="form-group" style={{ backgroundColor: '#FEF2F2', padding: '6px 10px', borderRadius: '6px', border: '1px solid #FCA5A5' }}>
            <label style={{ color: '#DC2626', fontWeight: '800' }}>🚨 Tử vong</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={hscc.tuVong || ''} 
              onChange={(e) => handleHsccChange('tuVong', e.target.value)} 
              style={{ borderColor: '#DC2626', color: '#DC2626', fontWeight: '800' }}
              placeholder="0"
            />
          </div>
          <div className="form-group"><label>Kê toa</label><input type="number" min="0" step="1" value={hscc.keToa || ''} onChange={(e) => handleHsccChange('keToa', e.target.value)} placeholder="0" /></div>
          <div className="form-group" style={{ backgroundColor: '#EFF6FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BFDBFE' }}>
            <label style={{ color: '#1D4ED8', fontWeight: '800' }}>Tổng số khám</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={hscc.tongSoKham || ''} 
              onChange={(e) => handleHsccChange('tongSoKham', e.target.value)} 
              style={{ borderColor: '#3B82F6', fontWeight: '700' }}
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="sub-section" style={{ marginTop: '15px', padding: '10px', backgroundColor: '#f9f9f9', borderRadius: '5px' }}>
          <h4>Chi tiết thêm</h4>
          <div className="form-grid">
            <div className="form-group"><label>Ngoại trú</label><input type="number" min="0" step="1" value={hscc.ngoaiTru || ''} onChange={(e) => handleHsccChange('ngoaiTru', e.target.value)} /></div>
            <div className="form-group"><label>Truyền máu</label><input type="number" min="0" step="1" value={hscc.truyenMau || ''} onChange={(e) => handleHsccChange('truyenMau', e.target.value)} /></div>
            <div className="form-group"><label>Tiểu phẫu</label><input type="number" min="0" step="1" value={hscc.tieuPhau || ''} onChange={(e) => handleHsccChange('tieuPhau', e.target.value)} /></div>
            <div className="form-group"><label>Bó bột</label><input type="number" min="0" step="1" value={hscc.boBot || ''} onChange={(e) => handleHsccChange('boBot', e.target.value)} /></div>
            <div className="form-group"><label>CC ngoại viện</label><input type="number" min="0" step="1" value={hscc.ccNgoaiVien || ''} onChange={(e) => handleHsccChange('ccNgoaiVien', e.target.value)} /></div>
          </div>
        </div>
      </div>

      {(chuyenVienCount > 0 || transferCases.length > 0) && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} />
      )}

      <div className="form-section">
        <h3 className="section-title">KHỐI THẬN NHÂN TẠO (TNT)</h3>
        <div className="form-grid">
          <div className="form-group"><label>Bệnh cũ</label><input type="number" min="0" step="1" value={tnt.tnt_benhCu || ''} onChange={(e) => handleTntChange('tnt_benhCu', e.target.value)} /></div>
          <div className="form-group"><label>Bệnh mới</label><input type="number" min="0" step="1" value={tnt.tnt_benhMoi || ''} onChange={(e) => handleTntChange('tnt_benhMoi', e.target.value)} /></div>
          <div className="form-group"><label>Xuất viện</label><input type="number" min="0" step="1" value={tnt.tnt_xuatVien || ''} onChange={(e) => handleTntChange('tnt_xuatVien', e.target.value)} /></div>
          <div className="form-group"><label>Chuyển viện</label><input type="text" value={tnt.tnt_chuyenVien || ''} onChange={(e) => handleTntChange('tnt_chuyenVien', e.target.value)} placeholder="Số hoặc '-'" /></div>
          <div className="form-group"><label>Chuyển khoa</label><input type="text" value={tnt.tnt_chuyenKhoa || ''} onChange={(e) => handleTntChange('tnt_chuyenKhoa', e.target.value)} placeholder="Số hoặc '-'" /></div>
          <div className="form-group"><label>Hiện còn</label><input type="number" min="0" step="1" value={tnt.tnt_hienCon || ''} onChange={(e) => handleTntChange('tnt_hienCon', e.target.value)} /></div>
        </div>
        <div className="sub-section" style={{ marginTop: '15px' }}>
          <div className="form-grid">
            <div className="form-group"><label>CTĐK</label><input type="number" min="0" step="1" value={tnt.tnt_ctdk || ''} onChange={(e) => handleTntChange('tnt_ctdk', e.target.value)} /></div>
            <div className="form-group"><label>Nội trú</label><input type="number" min="0" step="1" value={tnt.tnt_noiTru || ''} onChange={(e) => handleTntChange('tnt_noiTru', e.target.value)} /></div>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">PHÒNG KHÁM 21 (PK 21)</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Tổng số khám</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={pk21.pk21_tongSo || pk21.pk21_tongSoKham || ''} 
              onChange={(e) => {
                handlePk21Change('pk21_tongSo', e.target.value);
                handlePk21Change('pk21_tongSoKham', e.target.value);
              }} 
              placeholder="VD: 15"
            />
          </div>
          <div className="form-group">
            <label>Ngoại trú</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={pk21.pk21_ngoaiTru || ''} 
              onChange={(e) => handlePk21Change('pk21_ngoaiTru', e.target.value)} 
              placeholder="VD: 10"
            />
          </div>
          <div className="form-group">
            <label>Nhập viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={pk21.pk21_nhapVien || ''} 
              onChange={(e) => handlePk21Change('pk21_nhapVien', e.target.value)} 
              placeholder="VD: 3"
            />
          </div>
          <div className="form-group">
            <label>Chuyển viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={pk21.pk21_chuyenVien || ''} 
              onChange={(e) => handlePk21Change('pk21_chuyenVien', e.target.value)} 
              placeholder="VD: 2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoiSucCapCuuForm;
