import React from 'react';

const GayMeHoiSucForm = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const calculateTotal = () => {
    const cc = ['cc_ctch', 'cc_ngoaiTH', 'cc_san'].reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    const ct = ['ct_ctch', 'ct_ngoaiTH', 'ct_san'].reduce((sum, field) => sum + (Number(formData[field]) || 0), 0);
    return cc + ct;
  };

  return (
    <div className="department-form animate-fade-in">
      <div className="form-section">
        <h3 className="section-title">THÔNG TIN CA TRỰC & NHÂN SỰ GÂY MÊ HỒI SỨC</h3>
        <div className="form-group full-width">
          <label>Thành phần nhân sự ca trực</label>
          <textarea 
            value={formData.nhanSu || ''} 
            onChange={(e) => handleChange('nhanSu', e.target.value)} 
            placeholder="Ghi chú bác sĩ phẫu thuật, kíp mổ, kỹ thuật viên gây mê trực ca..." 
            rows={2}
            className="note-field"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">THỐNG KÊ CA PHẪU THUẬT (MỔ)</h3>
        
        <div className="form-group full-width" style={{ marginBottom: '1.25rem' }}>
          <label>Tổng số ca mổ (Cấp cứu + Chương trình)</label>
          <input 
            type="number" 
            min="0" 
            step="1" 
            value={formData.tongSoCaMo !== undefined ? formData.tongSoCaMo : calculateTotal()} 
            onChange={(e) => handleChange('tongSoCaMo', e.target.value)} 
            placeholder="Tự động tính hoặc nhập tay số ca mổ"
          />
          <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '4px', fontSize: '0.8rem' }}>
            * Tự động tổng hợp từ các mục mổ cấp cứu và mổ chương trình bên dưới.
          </small>
        </div>

        <div className="form-grid">
          <div className="sub-section" style={{ borderLeft: '4px solid var(--brand-red)' }}>
            <h4 style={{ color: 'var(--brand-red)' }}>Mổ cấp cứu</h4>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Chấn thương chỉnh hình (CTCH)</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.cc_ctch || ''} 
                onChange={(e) => handleChange('cc_ctch', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Ngoại tổng hợp</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.cc_ngoaiTH || ''} 
                onChange={(e) => handleChange('cc_ngoaiTH', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
            <div className="form-group">
              <label>Sản khoa</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.cc_san || ''} 
                onChange={(e) => handleChange('cc_san', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
          </div>

          <div className="sub-section" style={{ borderLeft: '4px solid var(--brand-blue-light)' }}>
            <h4 style={{ color: 'var(--brand-blue-light)' }}>Mổ chương trình (Kế hoạch)</h4>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Chấn thương chỉnh hình (CTCH)</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.ct_ctch || ''} 
                onChange={(e) => handleChange('ct_ctch', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label>Ngoại tổng hợp</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.ct_ngoaiTH || ''} 
                onChange={(e) => handleChange('ct_ngoaiTH', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
            <div className="form-group">
              <label>Sản khoa</label>
              <input 
                type="number" 
                min="0" 
                step="1" 
                value={formData.ct_san || ''} 
                onChange={(e) => handleChange('ct_san', e.target.value)} 
                placeholder="Số ca"
              />
            </div>
          </div>
        </div>

        <div className="sub-section" style={{ marginTop: '1.25rem', borderLeft: '4px solid var(--brand-green)' }}>
          <h4 style={{ color: 'var(--brand-green)' }}>Theo dõi post-op / Hồi tỉnh</h4>
          <div className="form-group">
            <label>Bệnh nhân hiện còn theo dõi tại Hồi tỉnh</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.hienCon || ''} 
              onChange={(e) => handleChange('hienCon', e.target.value)} 
              placeholder="Nhập số bệnh nhân hiện còn"
              style={{ maxWidth: '240px' }} 
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">GHI CHÚ THÊM GIỜ & DIỄN BIẾN MỔ</h3>
        <div className="form-group full-width">
          <label>Chi tiết thêm giờ / Ca mổ phát sinh ngoài giờ</label>
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleChange('themGio', e.target.value)} 
            placeholder="Ghi chú thời gian, kíp mổ, phương pháp mổ hoặc sự cố phát sinh ngoài giờ..." 
            rows={4}
            className="note-field"
          />
        </div>
      </div>
    </div>
  );
};

export default GayMeHoiSucForm;
