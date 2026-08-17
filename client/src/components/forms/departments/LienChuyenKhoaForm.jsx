import React, { useEffect } from 'react';
import TransferCaseForm from '../TransferCaseForm';
import { FaCalculator, FaEye, FaTooth, FaHeadSideCough, FaUserMd } from 'react-icons/fa';

const LienChuyenKhoaForm = ({ formData, setFormData, transferCases, setTransferCases }) => {
  const tmh_tongSo = Number(formData.tmh_tongSo) || 0;
  const tmh_thuThuat = Number(formData.tmh_thuThuat) || 0;

  const mat_tongSo = Number(formData.mat_tongSo) || 0;
  const mat_thuThuat = Number(formData.mat_thuThuat) || 0;

  const rhm_noi_tongSo = Number(formData.rhm_noi_tongSo) || 0;
  const rhm_noi_thuThuat = Number(formData.rhm_noi_thuThuat) || 0;

  const daLieu_tongSo = Number(formData.daLieu_tongSo) || 0;

  // Auto calculate sum for 4 Chuyên Khoa
  const autoTong4CK_tongSo = tmh_tongSo + mat_tongSo + rhm_noi_tongSo + daLieu_tongSo;
  const autoTong4CK_thuThuat = tmh_thuThuat + mat_thuThuat + rhm_noi_thuThuat;

  // Auto update when individual values change unless user manually overridden
  useEffect(() => {
    setFormData(prev => {
      const updated = { ...prev };
      let changed = false;

      if (!prev.manualTong4CK_tongSo && prev.tong4ck_tongSo !== autoTong4CK_tongSo) {
        updated.tong4ck_tongSo = autoTong4CK_tongSo;
        changed = true;
      }

      if (!prev.manualTong4CK_thuThuat && prev.tong4ck_thuThuat !== autoTong4CK_thuThuat) {
        updated.tong4ck_thuThuat = autoTong4CK_thuThuat;
        changed = true;
      }

      return changed ? updated : prev;
    });
  }, [tmh_tongSo, tmh_thuThuat, mat_tongSo, mat_thuThuat, rhm_noi_tongSo, rhm_noi_thuThuat, daLieu_tongSo, autoTong4CK_tongSo, autoTong4CK_thuThuat, setFormData]);

  const handleChange = (field, value) => {
    const numValue = value === '' ? '' : Math.max(0, parseInt(value, 10) || 0);
    const updated = { ...formData, [field]: numValue };

    if (field === 'tong4ck_tongSo') {
      updated.manualTong4CK_tongSo = true;
    } else if (field === 'tong4ck_thuThuat') {
      updated.manualTong4CK_thuThuat = true;
    }

    setFormData(updated);
  };

  const handleTextChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const resetAutoCalcTongSo = () => {
    setFormData(prev => {
      const copy = { ...prev };
      delete copy.manualTong4CK_tongSo;
      copy.tong4ck_tongSo = autoTong4CK_tongSo;
      return copy;
    });
  };

  const resetAutoCalcThuThuat = () => {
    setFormData(prev => {
      const copy = { ...prev };
      delete copy.manualTong4CK_thuThuat;
      copy.tong4ck_thuThuat = autoTong4CK_thuThuat;
      return copy;
    });
  };

  return (
    <div className="department-form animate-fade-in">
      {/* 1. TAI MŨI HỌNG (TMH) */}
      <div className="form-section">
        <h3 className="section-title" style={{ color: '#0F2C59', borderLeft: '4px solid #2563EB', paddingLeft: '0.6rem' }}>
          👂 TAI MŨI HỌNG (TMH)
        </h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Tổng số khám TMH</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tmh_tongSo ?? ''} 
              onChange={(e) => handleChange('tmh_tongSo', e.target.value)} 
              placeholder="VD: 15" 
            />
          </div>
          <div className="form-group">
            <label>Thủ thuật TMH</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tmh_thuThuat ?? ''} 
              onChange={(e) => handleChange('tmh_thuThuat', e.target.value)} 
              placeholder="VD: 3" 
            />
          </div>
        </div>
      </div>

      {/* 2. MẮT */}
      <div className="form-section">
        <h3 className="section-title" style={{ color: '#0F2C59', borderLeft: '4px solid #0D9488', paddingLeft: '0.6rem' }}>
          👁️ MẮT
        </h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Tổng số khám MẮT</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.mat_tongSo ?? ''} 
              onChange={(e) => handleChange('mat_tongSo', e.target.value)} 
              placeholder="VD: 12" 
            />
          </div>
          <div className="form-group">
            <label>Thủ thuật MẮT</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.mat_thuThuat ?? ''} 
              onChange={(e) => handleChange('mat_thuThuat', e.target.value)} 
              placeholder="VD: 2" 
            />
          </div>
        </div>
      </div>

      {/* 3. RĂNG HÀM MẶT */}
      <div className="form-section">
        <h3 className="section-title" style={{ color: '#0F2C59', borderLeft: '4px solid #7C3AED', paddingLeft: '0.6rem' }}>
          🦷 RĂNG HÀM MẶT (RHM)
        </h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Tổng số khám Răng Hàm Mặt</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.rhm_noi_tongSo ?? ''} 
              onChange={(e) => handleChange('rhm_noi_tongSo', e.target.value)} 
              placeholder="VD: 20" 
            />
          </div>
          <div className="form-group">
            <label>Thủ thuật Răng Hàm Mặt</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.rhm_noi_thuThuat ?? ''} 
              onChange={(e) => handleChange('rhm_noi_thuThuat', e.target.value)} 
              placeholder="VD: 5" 
            />
          </div>
        </div>
      </div>

      {/* 4. DA LIỄU & TIẾP NHẬN / CHUYỂN VIỆN */}
      <div className="form-section">
        <h3 className="section-title" style={{ color: '#0F2C59', borderLeft: '4px solid #D97706', paddingLeft: '0.6rem' }}>
          🩺 DA LIỄU, NHẬP VIỆN & CHUYỂN VIỆN
        </h3>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="form-group">
            <label>Tổng số khám DA LIỄU</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.daLieu_tongSo ?? ''} 
              onChange={(e) => handleChange('daLieu_tongSo', e.target.value)} 
              placeholder="VD: 8" 
            />
          </div>
          <div className="form-group">
            <label>Nhập viện (Số ca)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.nhapVien_tongSo ?? ''} 
              onChange={(e) => handleChange('nhapVien_tongSo', e.target.value)} 
              placeholder="VD: 1" 
            />
          </div>
          <div className="form-group">
            <label>Chuyển viện (Số ca)</label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.chuyenVien_tongSo ?? ''} 
              onChange={(e) => handleChange('chuyenVien_tongSo', e.target.value)} 
              placeholder="VD: 0" 
            />
          </div>
        </div>
      </div>

      {/* 5. TỔNG SỐ 4 CHUYÊN KHOA (4CK) */}
      <div className="form-section" style={{ backgroundColor: '#F0FDF4', border: '1.5px solid #BBF7D0', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3 className="section-title" style={{ margin: 0, color: '#166534', borderLeft: '4px solid #16A34A', paddingLeft: '0.6rem' }}>
            📊 TỔNG SỐ 4 CHUYÊN KHOA (4CK)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: '600' }}>
            ✨ Tự động cộng tổng (TMH + Mắt + Răng Hàm Mặt + Da liễu)
          </span>
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tổng số 4CK</span>
              {formData.manualTong4CK_tongSo && (
                <button 
                  type="button" 
                  onClick={resetAutoCalcTongSo} 
                  style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', fontWeight: '700' }}
                >
                  <FaCalculator /> Tính tự động
                </button>
              )}
            </label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tong4ck_tongSo ?? autoTong4CK_tongSo} 
              onChange={(e) => handleChange('tong4ck_tongSo', e.target.value)} 
              placeholder="VD: 55" 
              style={{
                backgroundColor: formData.manualTong4CK_tongSo ? '#FFFFFF' : '#DCFCE7',
                borderColor: formData.manualTong4CK_tongSo ? 'var(--warning)' : '#86EFAC',
                fontWeight: '800',
                color: '#14532D',
                fontSize: '1.1rem'
              }}
            />
            <small style={{ color: '#15803D', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Công thức: {tmh_tongSo} + {mat_tongSo} + {rhm_noi_tongSo} + {daLieu_tongSo} = {autoTong4CK_tongSo}
            </small>
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Tổng Thủ thuật 4CK</span>
              {formData.manualTong4CK_thuThuat && (
                <button 
                  type="button" 
                  onClick={resetAutoCalcThuThuat} 
                  style={{ background: 'none', border: 'none', color: '#16A34A', cursor: 'pointer', fontSize: '0.75rem', textDecoration: 'underline', fontWeight: '700' }}
                >
                  <FaCalculator /> Tính tự động
                </button>
              )}
            </label>
            <input 
              type="number" 
              min="0" 
              step="1" 
              value={formData.tong4ck_thuThuat ?? autoTong4CK_thuThuat} 
              onChange={(e) => handleChange('tong4ck_thuThuat', e.target.value)} 
              placeholder="VD: 10" 
              style={{
                backgroundColor: formData.manualTong4CK_thuThuat ? '#FFFFFF' : '#DCFCE7',
                borderColor: formData.manualTong4CK_thuThuat ? 'var(--warning)' : '#86EFAC',
                fontWeight: '800',
                color: '#14532D',
                fontSize: '1.1rem'
              }}
            />
            <small style={{ color: '#15803D', fontSize: '0.75rem', marginTop: '0.2rem' }}>
              Công thức: {tmh_thuThuat} + {mat_thuThuat} + {rhm_noi_thuThuat} = {autoTong4CK_thuThuat}
            </small>
          </div>
        </div>
      </div>

      {/* 6. GHI CHÚ THÊM GIỜ & CA TRỰC */}
      <div className="form-section">
        <h3 className="section-title">📝 GHI CHÚ THÊM GIỜ & DIỄN BIẾN CA TRỰC</h3>
        <div className="form-group full-width">
          <label>Chi tiết thêm giờ / Bệnh nhân nặng / Bàn giao ca</label>
          <textarea 
            value={formData.themGio || ''} 
            onChange={(e) => handleTextChange('themGio', e.target.value)} 
            placeholder="Nhập chi tiết ca trực thêm giờ, diễn biến đặc biệt của 4 chuyên khoa..." 
            rows={3}
            className="note-field"
          />
        </div>
      </div>

      {/* 7. CA CHUYỂN VIỆN */}
      <TransferCaseForm transferCases={transferCases} setTransferCases={setTransferCases} />
    </div>
  );
};

export default LienChuyenKhoaForm;
