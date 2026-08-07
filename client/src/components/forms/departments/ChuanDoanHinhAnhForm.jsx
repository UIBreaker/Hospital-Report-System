import React, { useEffect } from 'react';

const defaultTechniques = [
  { name: 'CT Scan', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' },
  { name: 'Xquang', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' },
  { name: 'Siêu âm', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' },
  { name: 'Nội soi', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' },
  { name: 'ECG', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' },
  { name: 'HHK', tongSo: '', baoHiem: '', noiTru: '', ngoaiTru: '' }
];

const ChuanDoanHinhAnhForm = ({ formData, setFormData }) => {
  const techniques = formData.techniques || defaultTechniques;

  useEffect(() => {
    if (!formData.techniques) {
      setFormData(prev => ({ ...prev, techniques: defaultTechniques }));
    }
  }, [formData.techniques, setFormData]);

  const handleTechniqueChange = (index, field, value) => {
    const updated = [...techniques];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, techniques: updated });
  };

  return (
    <div className="department-form">
      <div className="form-section">
        <div className="form-grid">
          <div className="form-group">
            <label>Phòng Siêu âm</label>
            <input type="text" value={formData.bsSieuAm || ''} onChange={(e) => setFormData({...formData, bsSieuAm: e.target.value})} placeholder="BS trực siêu âm" />
          </div>
          <div className="form-group">
            <label>Phòng Xquang – CT Scan</label>
            <input type="text" value={formData.bsXquangCT || ''} onChange={(e) => setFormData({...formData, bsXquangCT: e.target.value})} placeholder="BS trực Xquang - CT" />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ KỸ THUẬT</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Kỹ thuật</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tổng số</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Bảo hiểm</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nội trú</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ngoại trú</th>
              </tr>
            </thead>
            <tbody>
              {techniques.map((tech, index) => (
                <tr key={tech.name}>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold' }}>{tech.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input type="number" min="0" step="1" value={tech.tongSo || ''} onChange={(e) => handleTechniqueChange(index, 'tongSo', e.target.value)} style={{ width: '100%' }} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input type="number" min="0" step="1" value={tech.baoHiem || ''} onChange={(e) => handleTechniqueChange(index, 'baoHiem', e.target.value)} style={{ width: '100%' }} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input type="number" min="0" step="1" value={tech.noiTru || ''} onChange={(e) => handleTechniqueChange(index, 'noiTru', e.target.value)} style={{ width: '100%' }} />
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input type="number" min="0" step="1" value={tech.ngoaiTru || ''} onChange={(e) => handleTechniqueChange(index, 'ngoaiTru', e.target.value)} style={{ width: '100%' }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THÊM GIỜ</h3>
        <div className="form-group full-width">
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => setFormData({...formData, themGio: e.target.value})} 
            placeholder="Ghi chú thêm giờ..." 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default ChuanDoanHinhAnhForm;
