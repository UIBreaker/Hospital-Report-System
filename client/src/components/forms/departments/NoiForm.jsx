import React, { useEffect } from 'react';
import TransferCaseForm from '../TransferCaseForm';
import { FaUserMd, FaCalculator } from 'react-icons/fa';

const NoiForm = ({ doctorName, formData, setFormData, transferCases, setTransferCases }) => {
  const benhCu = Number(formData.benhCu) || 0;
  const benhMoi = Number(formData.benhMoi) || 0;
  const chuyenKhoa = Number(formData.chuyenKhoa) || 0;
  const xuatVien = Number(formData.xuatVien) || 0;

  // Auto calculate 'hienCon' = benhCu + benhMoi - xuatVien - chuyenKhoa
  const autoHienCon = Math.max(0, benhCu + benhMoi - xuatVien - chuyenKhoa);

  // Update hienCon automatically when other values change (if hienCon isn't manually locked)
  useEffect(() => {
    if (formData.benhCu !== undefined || formData.benhMoi !== undefined || formData.xuatVien !== undefined || formData.chuyenKhoa !== undefined) {
      if (formData.manualHienCon === undefined) {
        setFormData(prev => ({ ...prev, hienCon: autoHienCon }));
      }
    }
  }, [benhCu, benhMoi, chuyenKhoa, xuatVien, setFormData, autoHienCon, formData.manualHienCon]);

  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    const updated = { ...formData, [field]: numValue };
    
    if (field === 'hienCon') {
      updated.manualHienCon = true;
    } else if (field === 'benhCu' || field === 'benhMoi' || field === 'xuatVien' || field === 'chuyenKhoa') {
      const bc = field === 'benhCu' ? (numValue || 0) : benhCu;
      const bm = field === 'benhMoi' ? (numValue || 0) : benhMoi;
      const ck = field === 'chuyenKhoa' ? (numValue || 0) : chuyenKhoa;
      const xv = field === 'xuatVien' ? (numValue || 0) : xuatVien;
      const calc = Math.max(0, bc + bm - xv - ck);
      updated.hienCon = calc;
    }
    
    setFormData(updated);
  };

  const resetAutoCalc = () => {
    setFormData(prev => {
      const copy = { ...prev };
      delete copy.manualHienCon;
      copy.hienCon = autoHienCon;
      return copy;
    });
  };

  const chuyenVienCount = Number(formData.chuyenVien) || 0;

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">🏥 BẢNG DỮ LIỆU CHUYÊN MÔN - KHOA NỘI</h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Bệnh cũ</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhCu ?? ''} 
              onChange={(e) => handleChange('benhCu', e.target.value)} 
              placeholder="VD: 44" 
            />
          </div>

          <div className="form-group">
            <label>Bệnh mới</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.benhMoi ?? ''} 
              onChange={(e) => handleChange('benhMoi', e.target.value)} 
              placeholder="VD: 14" 
            />
          </div>

          <div className="form-group">
            <label>Chuyển khoa</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.chuyenKhoa ?? ''} 
              onChange={(e) => handleChange('chuyenKhoa', e.target.value)} 
              placeholder="VD: 0" 
            />
          </div>

          <div className="form-group">
            <label>Xuất viện</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.xuatVien ?? ''} 
              onChange={(e) => handleChange('xuatVien', e.target.value)} 
              placeholder="VD: 9" 
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Hiện còn (Tự động tính toán)</span>
              {formData.manualHienCon && (
                <button 
                  type="button" 
                  onClick={resetAutoCalc} 
                  style={{ background: 'none', border: 'none', color: 'var(--brand-blue-light)', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline' }}
                >
                  <FaCalculator /> Tính tự động
                </button>
              )}
            </label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.hienCon ?? autoHienCon} 
              onChange={(e) => handleChange('hienCon', e.target.value)} 
              placeholder="VD: 49" 
              style={{
                backgroundColor: formData.manualHienCon ? '#FFF' : '#EFF6FF',
                borderColor: formData.manualHienCon ? 'var(--warning)' : 'var(--brand-blue-light)',
                fontWeight: '700',
                color: 'var(--brand-blue)'
              }}
            />
            <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Formula: (Bệnh cũ + Bệnh mới) - Xuất viện - Chuyển khoa = {autoHienCon}
            </small>
          </div>

          <div className="form-group">
            <label>Chuyển viện (Số ca)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.chuyenVien ?? ''} 
              onChange={(e) => handleChange('chuyenVien', e.target.value)} 
              placeholder="VD: 0" 
            />
          </div>
        </div>
      </div>

      {(chuyenVienCount > 0 || (transferCases && transferCases.length > 0)) && (
        <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} />
      )}
    </div>
  );
};

export default NoiForm;
