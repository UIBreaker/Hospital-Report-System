import React from 'react';

const YHocCoTruyenForm = ({ formData, setFormData }) => {
  const noiTru = formData.noiTru || { benhCu: '', benhMoi: '', xuat: '', hienCon: '' };
  const ngoaiTru = formData.ngoaiTru || { benhCu: '', benhMoi: '', xuat: '', hienCon: '' };
  const keToa = formData.keToa || { tongSo: '', bhyt: '', dichVu: '' };

  const handleNoiTruChange = (field, value) => {
    const updated = { ...noiTru, [field]: value };
    // Auto-calculate hienCon for noiTru if inputs are valid numbers
    if (field !== 'hienCon') {
      const cu = Number(updated.benhCu) || 0;
      const moi = Number(updated.benhMoi) || 0;
      const xuat = Number(updated.xuat) || 0;
      if (updated.benhCu !== '' || updated.benhMoi !== '' || updated.xuat !== '') {
        updated.hienCon = (cu + moi - xuat).toString();
      }
    }
    setFormData({ ...formData, noiTru: updated });
  };

  const handleNgoaiTruChange = (field, value) => {
    setFormData({ ...formData, ngoaiTru: { ...ngoaiTru, [field]: value } });
  };

  const handleKeToaChange = (field, value) => {
    setFormData({ ...formData, keToa: { ...keToa, [field]: value } });
  };

  return (
    <div className="department-form">
      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ BỆNH NHÂN</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Loại</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bệnh cũ</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bệnh mới</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Xuất</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Hiện còn</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Nội trú</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={noiTru.benhCu || ''} onChange={(e) => handleNoiTruChange('benhCu', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={noiTru.benhMoi || ''} onChange={(e) => handleNoiTruChange('benhMoi', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={noiTru.xuat || ''} onChange={(e) => handleNoiTruChange('xuat', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={noiTru.hienCon || ''} onChange={(e) => handleNoiTruChange('hienCon', e.target.value)} style={{ width: '100%' }} /></td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>Ngoại trú</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={ngoaiTru.benhCu || ''} onChange={(e) => handleNgoaiTruChange('benhCu', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={ngoaiTru.benhMoi || ''} onChange={(e) => handleNgoaiTruChange('benhMoi', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={ngoaiTru.xuat || ''} onChange={(e) => handleNgoaiTruChange('xuat', e.target.value)} style={{ width: '100%' }} /></td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input type="number" min="0" step="1" value={ngoaiTru.hienCon || ''} onChange={(e) => handleNgoaiTruChange('hienCon', e.target.value)} style={{ width: '100%' }} /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">KÊ TOA</h3>
        <div className="form-grid">
          <div className="form-group"><label>Tổng số TS</label><input type="number" min="0" step="1" value={keToa.tongSo || ''} onChange={(e) => handleKeToaChange('tongSo', e.target.value)} /></div>
          <div className="form-group"><label>BHYT</label><input type="number" min="0" step="1" value={keToa.bhyt || ''} onChange={(e) => handleKeToaChange('bhyt', e.target.value)} /></div>
          <div className="form-group"><label>Dịch vụ</label><input type="number" min="0" step="1" value={keToa.dichVu || ''} onChange={(e) => handleKeToaChange('dichVu', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
};

export default YHocCoTruyenForm;
