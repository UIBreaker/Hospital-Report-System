import React from 'react';

export const FIELD_LABELS = {
  pk21_tongSo: 'Tổng số khám (PK21)',
  pk21_tongSoKham: 'Tổng số khám (PK21)',
  pk21_ngoaiTru: 'Ngoại trú (PK21)',
  pk21_nhapVien: 'Nhập viện (PK21)',
  pk21_chuyenVien: 'Chuyển viện (PK21)',
  nhapVien: 'Nhập viện',
  tongSoKham: 'Tổng số khám',
  benhCu: 'Bệnh cũ',
  benhMoi: 'Bệnh mới',
  xuatVien: 'Xuất viện',
  chuyenVien: 'Chuyển viện',
  chuyenKhoa: 'Chuyển khoa',
  hienCon: 'Hiện còn',
  tuVong: 'Tử vong',
  nangXinVe: 'Nặng xin về',
  thoMay: 'Thở máy',
  cpap: 'Thở CPAP',
  oxy: 'Thở Oxy',
  phauThuat: 'Phẫu thuật',
  thuThuat: 'Thủ thuật',
  sinhThuong: 'Sinh thường',
  moDe: 'Mổ đẻ',
  capCuu: 'Cấp cứu',
  chanDoan: 'Chẩn đoán',
  ghiChu: 'Ghi chú',
  noiDung: 'Nội dung',
  dienBien: 'Diễn biến',
  soCaChayThan: 'Số ca chạy thận',
  soCaLocMau: 'Số ca lọc máu',
  bsTrucTNT: 'BS trực TNT',
  bsSieuAm: 'BS trực Siêu âm',
  bsXquangCT: 'BS trực Xquang – CT Scan',
  themGio: 'Ghi chú trực thêm giờ',
  nhanSu: 'Thành phần nhân sự ca trực',
  techniques: 'Thống kê kỹ thuật Chẩn đoán hình ảnh',
  tongSoCaMo: 'Tổng số ca mổ',
  cc_ctch: 'Mổ CC - Chấn thương chỉnh hình',
  cc_ngoaiTH: 'Mổ CC - Ngoại tổng hợp',
  cc_san: 'Mổ CC - Sản khoa',
  ct_ctch: 'Mổ CT - Chấn thương chỉnh hình',
  ct_ngoaiTH: 'Mổ CT - Ngoại tổng hợp',
  ct_san: 'Mổ CT - Sản khoa',
  tongSo: 'Tổng số lượt',
  baoHiem: 'Bảo hiểm y tế (BHYT)',
  noiTru: 'Bệnh nhân nội trú',
  ngoaiTru: 'Bệnh nhân ngoại trú',
  tongSoSieuAm: 'Tổng số siêu âm',
  tongSoXquang: 'Tổng số X-quang',
  tongSoCT: 'Tổng số CT Scanner',
  tongSoXetNghiem: 'Tổng số xét nghiệm',
  huyetHoc: 'Huyết học',
  sinhHoa: 'Sinh hóa',
  viSinh: 'Vi sinh',
  dongMau: 'Đông máu',
  nuocTieu: 'Nước tiểu',
  khamNgoaiTru: 'Khám ngoại trú',
  dieuTriNoiTru: 'Điều trị nội trú',
  chamCuu: 'Châm cứu',
  xoaBop: 'Xoa bóp / Bấm huyệt',
  vatLyTriLieu: 'Vật lý trị liệu',
  soCaMo: 'Số ca mổ',
  soCaGayMe: 'Số ca gây mê',
  soCaTienMe: 'Số ca tiền mê',
  soCaHoiTinh: 'Số ca hồi tỉnh'
};

export const SECTION_LABELS = {
  hscc: 'Khối Hồi Sức Cấp Cứu (HSCC)',
  tnt: 'Khối Thận Nhân Tạo (TNT)',
  pk21: 'Phòng Khám 21 (Cấp Cứu Ngoại Viện)',
  mat: 'Chuyên Khoa Mắt',
  tmh: 'Chuyên Khoa Tai Mũi Họng',
  rhm: 'Chuyên Khoa Răng Hàm Mặt',
  khuA: 'Khu A',
  khuB: 'Khu B',
  noiA: 'Khu Nội Tổng Hợp',
  noiB: 'Khu Nội Tim Mạch'
};

const ReportDataViewer = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
        Chưa có số liệu chuyên môn được nhập từ khoa phòng.
      </div>
    );
  }

  const flatFields = [];
  const nestedSections = [];
  const arrayTables = [];
  const noteFields = [];

  Object.entries(data).forEach(([key, val]) => {
    if (val === null || val === undefined || val === '') return;

    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object') {
        arrayTables.push({ key, val });
      } else {
        flatFields.push({ key, val: val.join(', ') });
      }
    } else if (typeof val === 'object') {
      nestedSections.push({ key, val });
    } else if (typeof val === 'string' && val.length > 40) {
      noteFields.push({ key, val });
    } else {
      flatFields.push({ key, val });
    }
  });

  if (flatFields.length === 0 && nestedSections.length === 0 && arrayTables.length === 0 && noteFields.length === 0) {
    return (
      <div style={{ padding: '1.25rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px dashed #CBD5E1', color: '#64748B', fontStyle: 'italic', textAlign: 'center' }}>
        Chưa có số liệu chuyên môn được nhập từ khoa phòng.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {flatFields.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
          {flatFields.map(({ key, val }) => (
            <div key={key} style={{ padding: '0.75rem 1rem', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block', fontWeight: '600', marginBottom: '0.2rem' }}>
                {FIELD_LABELS[key] || key}
              </span>
              <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F2C59' }}>
                {String(val)}
              </span>
            </div>
          ))}
        </div>
      )}

      {arrayTables.map(({ key, val }) => (
        <div key={key} style={{ padding: '1rem 1.25rem', backgroundColor: '#F0F9FF', borderRadius: '8px', border: '1px solid #BAE6FD', overflowX: 'auto' }}>
          <h5 style={{ margin: '0 0 0.75rem 0', color: '#0369A1', fontWeight: '800', fontSize: '0.95rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            📊 {FIELD_LABELS[key] || (key === 'techniques' ? 'Thống Kê Kỹ Thuật Chẩn Đoán Hình Ảnh' : key)}
          </h5>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#FFFFFF', borderRadius: '6px', overflow: 'hidden', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#E0F2FE', color: '#0369A1', borderBottom: '2px solid #BAE6FD' }}>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: '700' }}>Kỹ thuật / Hạng mục</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Tổng số</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Bảo hiểm (BHYT)</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Nội trú</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '700' }}>Ngoại trú</th>
              </tr>
            </thead>
            <tbody>
              {val.map((item, idx) => (
                <tr key={item.name || idx} style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }}>
                  <td style={{ padding: '0.65rem 0.85rem', fontWeight: '700', color: '#0F2C59' }}>{item.name || `Mục ${idx + 1}`}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '800', color: '#0284C7' }}>{item.tongSo !== '' && item.tongSo !== undefined ? item.tongSo : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.baoHiem !== '' && item.baoHiem !== undefined ? item.baoHiem : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.noiTru !== '' && item.noiTru !== undefined ? item.noiTru : '—'}</td>
                  <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center', color: '#334155' }}>{item.ngoaiTru !== '' && item.ngoaiTru !== undefined ? item.ngoaiTru : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {nestedSections.map(({ key, val }) => {
        const title = SECTION_LABELS[key] || `Khối / Phần: ${key.toUpperCase()}`;
        const subFields = Object.entries(val).filter(([_, v]) => v !== null && v !== undefined && v !== '');
        if (subFields.length === 0) return null;

        return (
          <div key={key} style={{ padding: '0.85rem 1rem', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #BBF7D0' }}>
            <h5 style={{ margin: '0 0 0.65rem 0', color: '#166534', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase' }}>
              {title}
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.6rem' }}>
              {subFields.map(([subKey, subVal]) => (
                <div key={subKey} style={{ padding: '0.5rem 0.75rem', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #DCFCE7' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block', fontWeight: '600' }}>
                    {FIELD_LABELS[subKey] || subKey}
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#15803D' }}>
                    {String(subVal)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {noteFields.map(({ key, val }) => (
        <div key={key} style={{ padding: '0.85rem 1rem', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #FDE68A' }}>
          <span style={{ fontSize: '0.75rem', color: '#92400E', fontWeight: '700', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
            📝 {FIELD_LABELS[key] || key}
          </span>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#78350F', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReportDataViewer;
