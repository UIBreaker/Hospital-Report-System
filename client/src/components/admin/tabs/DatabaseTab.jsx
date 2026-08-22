import React, { useState, useEffect } from 'react';
import {
  FaDatabase,
  FaSync,
  FaSpinner,
  FaHdd,
  FaLayerGroup,
  FaCalendarAlt,
  FaTable,
  FaFileAlt,
  FaChartPie,
  FaServer,
  FaCheckCircle
} from 'react-icons/fa';
import reportService from '../../../services/reportService';
import MedicalLoader from '../../common/MedicalLoader';

const DatabaseTab = ({ date }) => {
  const [loadingDb, setLoadingDb] = useState(false);
  const [dbStats, setDbStats] = useState(null);
  const [dbError, setDbError] = useState('');
  const [lastDbUpdate, setLastDbUpdate] = useState('');

  // Daily payload stats
  const [payloadDate, setPayloadDate] = useState(() => date || new Date().toISOString().split('T')[0]);
  const [payloadData, setPayloadData] = useState(null);
  const [loadingPayload, setLoadingPayload] = useState(false);
  const [payloadError, setPayloadError] = useState('');

  useEffect(() => {
    if (date) {
      setPayloadDate(date);
    }
  }, [date]);

  const fetchDatabaseStats = async () => {
    setLoadingDb(true);
    setDbError('');
    try {
      const res = await reportService.getDatabaseStats();
      if (res && res.success) {
        setDbStats(res.data);
        setLastDbUpdate(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      setDbError(err.response?.data?.error || err.message || 'Lỗi khi tải thông số database');
    } finally {
      setLoadingDb(false);
    }
  };

  const fetchPayloadStats = async (targetDate) => {
    const d = targetDate || payloadDate;
    setLoadingPayload(true);
    setPayloadError('');
    try {
      const res = await reportService.getReportsPayloadSize(d);
      if (res && res.success) {
        setPayloadData(res.data);
      }
    } catch (err) {
      setPayloadError(err.response?.data?.error || err.message || 'Lỗi khi tính dung lượng báo cáo');
    } finally {
      setLoadingPayload(false);
    }
  };

  useEffect(() => {
    fetchDatabaseStats();
    fetchPayloadStats(payloadDate);
  }, []);

  const handleDateChange = (newDate) => {
    setPayloadDate(newDate);
    fetchPayloadStats(newDate);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 1. Header Toolbar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '0.85rem 1.35rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.85rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            flexShrink: 0
          }}>
            <FaDatabase />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0F2C59', margin: 0, lineHeight: 1.2 }}>
              Trạng Thái & Dung Lượng Cơ Sở Dữ Liệu
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Giám sát dung lượng CSDL Aiven MySQL 8.4 SSL và lưu lượng báo cáo phát sinh.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {lastDbUpdate && (
            <span style={{
              fontSize: '0.78rem',
              color: '#64748B',
              backgroundColor: '#F8FAFC',
              padding: '0.35rem 0.65rem',
              borderRadius: '6px',
              border: '1px solid #E2E8F0',
              fontWeight: '600'
            }}>
              Cập nhật: <strong style={{ color: '#0F2C59' }}>{lastDbUpdate}</strong>
            </span>
          )}

          <button
            type="button"
            onClick={() => {
              fetchDatabaseStats();
              fetchPayloadStats(payloadDate);
            }}
            disabled={loadingDb || loadingPayload}
            style={{
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.95rem',
              fontWeight: '800',
              fontSize: '0.82rem',
              cursor: (loadingDb || loadingPayload) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}
          >
            <FaSync className={(loadingDb || loadingPayload) ? 'spinner' : ''} size={11} />
            {(loadingDb || loadingPayload) ? 'Đang kiểm tra...' : 'Làm Mới Dữ Liệu'}
          </button>
        </div>
      </div>

      {dbError && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FECACA',
          color: '#DC2626',
          padding: '0.75rem 1rem',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          ⚠️ <strong>Lỗi kết nối cơ sở dữ liệu:</strong> {dbError}
        </div>
      )}

      {/* 2. Top Summary Stat Cards Grid (3 Cards) */}
      {dbStats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Card 1: Storage Size */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #2563EB',
            boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <FaHdd />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#0F2C59', lineHeight: '1.1' }}>
                {dbStats.physicalStorage?.usedMb !== undefined
                  ? `${dbStats.physicalStorage.usedMb} MB`
                  : (dbStats.totalDataSizeMb !== undefined ? `${dbStats.totalDataSizeMb} MB` : '0.44 MB')}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0F2C59', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
                DUNG LƯỢNG SỬ DỤNG
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                Giới hạn: <strong>{dbStats.physicalStorage?.totalMb || 1024} MB</strong> ({dbStats.physicalStorage?.usagePercentage || 0}%)
              </div>
            </div>
          </div>

          {/* Card 2: Report Records */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #7C3AED',
            boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#EDE9FE',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <FaFileAlt />
            </div>
            <div>
              <div style={{ fontSize: '1.85rem', fontWeight: '900', color: '#6D28D9', lineHeight: '1.1' }}>
                {dbStats.tables?.find(t => t.tableName === 'reports')?.rowsCount ?? dbStats.totalRows ?? 0}
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#6D28D9', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
                BẢN GHI BÁO CÁO
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                Tổng số <strong>{dbStats.totalRows || 0}</strong> dòng trong CSDL
              </div>
            </div>
          </div>

          {/* Card 3: Connection Status */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            border: '1px solid #E2E8F0',
            borderLeft: '4px solid #10B981',
            boxShadow: '0 2px 10px rgba(15, 44, 89, 0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              flexShrink: 0
            }}>
              <FaCheckCircle />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#15803D', lineHeight: '1.2' }}>
                Hoạt động tốt
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '800', color: '#065F46', textTransform: 'uppercase', letterSpacing: '0.4px', marginTop: '0.2rem' }}>
                TRẠNG THÁI KẾT NỐI
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '0.1rem' }}>
                MySQL 8.4 Serverless SSL
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Physical Storage Progress Card */}
      {dbStats?.physicalStorage && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '1.15rem 1.35rem',
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.88rem', color: '#0F2C59' }}>
              <FaServer style={{ color: '#2563EB' }} /> Dung Lượng Ổ Đĩa Vật Lý Máy Chủ Cloud Aiven (Gói 1.0 GB)
            </div>
            <span style={{
              padding: '0.15rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: '800',
              backgroundColor: dbStats.physicalStorage.statusLevel === 'safe' ? '#DCFCE7' : '#FEF3C7',
              color: dbStats.physicalStorage.statusLevel === 'safe' ? '#065F46' : '#92400E'
            }}>
              {dbStats.physicalStorage.statusText}
            </span>
          </div>

          <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.5rem' }}>
            <div
              style={{
                height: '100%',
                width: `${Math.min(dbStats.physicalStorage.usagePercentage || 0, 100)}%`,
                backgroundColor: dbStats.physicalStorage.statusLevel === 'safe' ? '#10B981' : '#F59E0B',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748B', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span>Đã dùng: <strong style={{ color: '#0F2C59' }}>{dbStats.physicalStorage.usedMb} MB</strong> ({dbStats.physicalStorage.usagePercentage}%)</span>
            <span>Còn trống: <strong style={{ color: '#10B981' }}>{dbStats.physicalStorage.freeMb} MB</strong></span>
            <span>Tổng cấp phát: <strong style={{ color: '#0F2C59' }}>{dbStats.physicalStorage.totalMb} MB (1.0 GB)</strong></span>
          </div>
        </div>
      )}

      {/* 4. MySQL Tables Detail Table */}
      {dbStats?.tables && dbStats.tables.length > 0 && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: '800', fontSize: '0.88rem', color: '#0F2C59', textTransform: 'uppercase' }}>
            <FaTable style={{ color: '#2563EB' }} /> Chi Tiết Kích Thước Các Bảng Dữ Liệu (MySQL)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '800' }}>TÊN BẢNG</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '800', textAlign: 'center' }}>SỐ DÒNG</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '800', textAlign: 'right' }}>DỮ LIỆU (KB)</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '800', textAlign: 'right' }}>CHỈ MỤC INDEX</th>
                  <th style={{ padding: '0.65rem 1rem', fontWeight: '800', textAlign: 'right' }}>TỔNG DUNG LƯỢNG</th>
                </tr>
              </thead>
              <tbody>
                {dbStats.tables.map((t, idx) => (
                  <tr
                    key={t.tableName}
                    style={{
                      borderBottom: '1px solid #F1F5F9',
                      backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                    }}
                  >
                    <td style={{ padding: '0.65rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#0F2C59' }}>{t.tableName}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'center', fontWeight: '600' }}>{t.rowsCount?.toLocaleString() || 0}</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#0284C7' }}>{t.dataSizeKb || '0'} KB</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', color: '#64748B' }}>{t.indexSizeKb || '0'} KB</td>
                    <td style={{ padding: '0.65rem 1rem', textAlign: 'right', fontWeight: '800', color: '#0F2C59' }}>{t.sizeKb ? `${t.sizeKb} KB` : `${t.sizeMb} MB`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Daily Payload Size Breakdown Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E2E8F0',
        padding: '1.25rem',
        boxShadow: '0 2px 8px rgba(15, 44, 89, 0.04)'
      }}>
        {/* Header with Date Picker */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.85rem',
          marginBottom: '1rem',
          paddingBottom: '0.85rem',
          borderBottom: '1px solid #E2E8F0'
        }}>
          <div>
            <h4 style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F2C59', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <FaChartPie style={{ color: '#2563EB' }} /> Dung Lượng Dữ Liệu Báo Cáo Theo Ngày
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0.2rem 0 0 0' }}>
              Chi tiết kích thước văn bản và ảnh đính kèm của từng khoa phòng.
            </p>
          </div>

          {/* Date Picker Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            backgroundColor: '#EFF6FF',
            padding: '0.35rem 0.75rem',
            borderRadius: '8px',
            border: '1.5px solid #BFDBFE'
          }}>
            <FaCalendarAlt style={{ color: '#2563EB', fontSize: '0.85rem' }} />
            <input
              type="date"
              value={payloadDate}
              onChange={(e) => handleDateChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontWeight: '700',
                color: '#1E40AF',
                fontSize: '0.85rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
          </div>
        </div>

        {payloadError && (
          <div style={{ padding: '0.75rem 1rem', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {payloadError}
          </div>
        )}

        {loadingPayload ? (
          <MedicalLoader
            text="Đang tính toán dung lượng báo cáo các khoa phòng..."
            subtext="Hệ thống đang quét kích thước văn bản và tệp hình ảnh"
            minHeight="280px"
          />
        ) : !payloadData || !payloadData.departments || payloadData.departments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748B' }}>
            <FaTable style={{ fontSize: '2.5rem', color: '#CBD5E1', marginBottom: '0.5rem' }} />
            <p>Chưa có dữ liệu dung lượng báo cáo cho ngày {payloadDate}.</p>
          </div>
        ) : (
          <>
            {/* Payload summary bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
              backgroundColor: '#F8FAFC',
              padding: '0.85rem 1.15rem',
              borderRadius: '10px',
              border: '1px solid #E2E8F0'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>TỔNG DUNG LƯỢNG NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#1E40AF', marginTop: '0.15rem' }}>
                  {payloadData.grandTotalKb !== undefined
                    ? (payloadData.grandTotalKb >= 1024
                        ? `${(payloadData.grandTotalKb / 1024).toFixed(2)} MB`
                        : `${payloadData.grandTotalKb} KB`)
                    : `${payloadData.totalKb || 0} KB`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>DUNG LƯỢNG VĂN BẢN</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#475569', marginTop: '0.15rem' }}>
                  {payloadData.grandTotalTextKb !== undefined
                    ? `${payloadData.grandTotalTextKb} KB`
                    : (payloadData.totalTextKb !== undefined ? `${payloadData.totalTextKb} KB` : '0 KB')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>DUNG LƯỢNG HÌNH ẢNH</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#7C3AED', marginTop: '0.15rem' }}>
                  {payloadData.grandTotalImageKb !== undefined
                    ? `${payloadData.grandTotalImageKb} KB`
                    : (payloadData.totalImageKb !== undefined ? `${payloadData.totalImageKb} KB` : '0 KB')}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748B' }}>SỐ KHOA ĐÃ NỘP</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '900', color: '#15803D', marginTop: '0.15rem' }}>
                  {payloadData.submittedCount || 0}/{payloadData.totalDepartmentsCount || payloadData.departments?.length || 12}
                </div>
              </div>
            </div>

            {/* Department Breakdown Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#0F2C59' }}>
                    <th style={{ padding: '0.65rem 0.85rem', width: '45px', textAlign: 'center', fontWeight: '800' }}>STT</th>
                    <th style={{ padding: '0.65rem 0.85rem', fontWeight: '800' }}>KHOA / PHÒNG</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '800' }}>TRẠNG THÁI</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', fontWeight: '800' }}>CA ĐẶC BIỆT</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '800' }}>TEXT (KB)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '800' }}>HÌNH ẢNH (KB)</th>
                    <th style={{ padding: '0.65rem 0.85rem', textAlign: 'right', fontWeight: '800' }}>TỔNG DUNG LƯỢNG</th>
                    <th style={{ padding: '0.65rem 0.85rem', width: '160px', fontWeight: '800' }}>TỶ TRỌNG (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {payloadData.departments.map((dept, idx) => {
                    const totalDeptKb = dept.totalKb || 0;
                    const hasLargePayload = totalDeptKb > 500;
                    const hasMediumPayload = totalDeptKb > 100;
                    const pct = dept.percentage || 0;

                    return (
                      <tr
                        key={dept.departmentCode || idx}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA'
                        }}
                      >
                        <td style={{ padding: '0.65rem 0.85rem', color: '#94A3B8', fontWeight: '600', textAlign: 'center' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          <div style={{ fontWeight: '700', color: dept.submitted ? '#0F2C59' : '#94A3B8' }}>
                            {dept.departmentName}
                          </div>
                          {dept.submitted && dept.doctorName && (
                            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                              BS: {dept.doctorName}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          {dept.submitted ? (
                            <span style={{ backgroundColor: '#DCFCE7', color: '#065F46', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '800' }}>
                              ✓ Đã nộp
                            </span>
                          ) : (
                            <span style={{ backgroundColor: '#F1F5F9', color: '#94A3B8', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.72rem', fontWeight: '700' }}>
                              Chưa nộp
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'center' }}>
                          {dept.submitted ? (
                            <span style={{ fontWeight: dept.totalCasesCount > 0 ? '700' : '400', color: dept.totalCasesCount > 0 ? '#1E40AF' : '#94A3B8' }}>
                              {dept.totalCasesCount > 0 ? `${dept.totalCasesCount} ca` : '0 ca'}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: '#475569' }}>
                          {dept.submitted ? `${dept.textKb || 0} KB` : '0 KB'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right', color: (dept.imageKb || 0) > 0 ? '#7C3AED' : '#94A3B8', fontWeight: (dept.imageKb || 0) > 0 ? '700' : '400' }}>
                          {dept.submitted ? `${dept.imageKb || 0} KB` : '0 KB'}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem', textAlign: 'right' }}>
                          {dept.submitted ? (
                            <span style={{
                              backgroundColor: hasLargePayload ? '#FEE2E2' : hasMediumPayload ? '#FEF3C7' : '#DBEAFE',
                              color: hasLargePayload ? '#991B1B' : hasMediumPayload ? '#92400E' : '#1E40AF',
                              fontWeight: '800',
                              fontSize: '0.78rem',
                              padding: '0.18rem 0.55rem',
                              borderRadius: '6px'
                            }}>
                              {totalDeptKb >= 1024 ? `${(totalDeptKb / 1024).toFixed(1)} MB` : `${totalDeptKb} KB`}
                            </span>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: '0.78rem' }}>0 KB</span>
                          )}
                        </td>
                        <td style={{ padding: '0.65rem 0.85rem' }}>
                          {dept.submitted && pct > 0 ? (
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: '700', marginBottom: '2px', color: '#64748B' }}>
                                <span>{pct}%</span>
                              </div>
                              <div style={{ height: '5px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${Math.min(pct, 100)}%`,
                                    backgroundColor: hasLargePayload ? '#EF4444' : hasMediumPayload ? '#F59E0B' : '#3B82F6',
                                    borderRadius: '3px'
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#CBD5E1', fontSize: '0.75rem' }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DatabaseTab;
