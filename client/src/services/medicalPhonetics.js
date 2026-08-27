// Medical Phonetics & Abbreviation Normalizer for Vietnamese Speech Synthesis

const MEDICAL_ABBREVIATIONS = [
  // Common Hospital abbreviations
  { regex: /\bBHYT\b/gi, replacement: 'Bảo hiểm y tế' },
  { regex: /\bBH\b/gi, replacement: 'Bảo hiểm' },
  { regex: /\bHSCC\b/gi, replacement: 'Hồi sức cấp cứu' },
  { regex: /\bTNT\b/gi, replacement: 'Thận nhân tạo' },
  { regex: /\bCTĐK\b/gi, replacement: 'Chạy thận định kỳ' },
  { regex: /\bCTDK\b/gi, replacement: 'Chạy thận định kỳ' },
  { regex: /\bCDHA\b/gi, replacement: 'Chẩn đoán hình ảnh' },
  { regex: /\bCĐHA\b/gi, replacement: 'Chẩn đoán hình ảnh' },
  { regex: /\bCTCH\b/gi, replacement: 'Chấn thương chỉnh hình' },
  { regex: /\bYHCT\s*[-–—]\s*PHCN\b/gi, replacement: 'Y học cổ truyền và Phục hồi chức năng' },
  { regex: /\bYHCT\b/gi, replacement: 'Y học cổ truyền' },
  { regex: /\bPHCN\b/gi, replacement: 'Phục hồi chức năng' },
  { regex: /\bGMHS\b/gi, replacement: 'Gây mê hồi sức' },
  { regex: /\bTMH\b/gi, replacement: 'Tai Mũi Họng' },
  { regex: /\bRHM\b/gi, replacement: 'Răng Hàm Mặt' },
  { regex: /\bLCK\b/gi, replacement: 'Liên Chuyên Khoa' },
  { regex: /\bXN\b/gi, replacement: 'Xét nghiệm' },
  { regex: /\bPK\s*21\b/gi, replacement: 'Phòng khám 21' },
  { regex: /\bPK\b/gi, replacement: 'Phòng khám' },
  { regex: /\bTTYT\b/gi, replacement: 'Trung tâm y tế' },
  { regex: /\bKCB\b/gi, replacement: 'Khám chữa bệnh' },
  { regex: /\bBGĐ\b/gi, replacement: 'Ban Giám Đốc' },
  { regex: /\bBGD\b/gi, replacement: 'Ban Giám Đốc' },
  { regex: /\bKHNV\b/gi, replacement: 'Kế hoạch nghiệp vụ' },
  { regex: /\bTCCB\b/gi, replacement: 'Tổ chức cán bộ' },
  { regex: /\bNgoại\s*TH\b/gi, replacement: 'Ngoại tổng hợp' },
  { regex: /\bNgoai\s*TH\b/gi, replacement: 'Ngoại tổng hợp' },
  
  // Medical Diagnostics & Equipment
  { regex: /\bCT\s*Scanner\b/gi, replacement: 'Xi ti xờ can nơ' },
  { regex: /\bCT\s*Scan\b/gi, replacement: 'Xi ti xờ can' },
  { regex: /\bCT\b/gi, replacement: 'Xi ti' },
  { regex: /\bX[-‑–—]?quang\b/gi, replacement: 'Ích quang' },
  { regex: /\bX[-‑–—]?Quang\b/gi, replacement: 'Ích quang' },
  { regex: /\bECG\b/gi, replacement: 'Điện tâm đồ' },
  { regex: /\bEEG\b/gi, replacement: 'Điện não đồ' },
  { regex: /\bSpO2\b/gi, replacement: 'Ét pê o hai' },
  { regex: /\bSPO2\b/gi, replacement: 'Ét pê o hai' },
  { regex: /\bCPAP\b/gi, replacement: 'Thở xê páp' },
  { regex: /\bCpap\b/gi, replacement: 'Thở xê páp' },
  { regex: /\bICU\b/gi, replacement: 'Ai xi u' },
  { regex: /\bIV\b/gi, replacement: 'Tiêm tĩnh mạch' },
  { regex: /\bIM\b/gi, replacement: 'Tiêm bắp' },
  
  // Clinical labels
  { regex: /\bLS\s*:/gi, replacement: 'Lâm sàng:' },
  { regex: /\bCLS\s*:/gi, replacement: 'Cận lâm sàng:' },
  { regex: /\bCĐ\s*:/gi, replacement: 'Chẩn đoán:' },
  { regex: /\bXT\s*:/gi, replacement: 'Xử trí:' },
  { regex: /\bBN\b/gi, replacement: 'Bệnh nhân' },
  { regex: /\bBS\b/gi, replacement: 'Bác sĩ' },
  { regex: /\bĐD\b/gi, replacement: 'Điều dưỡng' },
  { regex: /\bKTV\b/gi, replacement: 'Kỹ thuật viên' },
  { regex: /\bHSBA\b/gi, replacement: 'Hồ sơ bệnh án' },
  { regex: /\bHA\b/gi, replacement: 'Huyết áp' },
  { regex: /\bST\s*chênh\s*lên\b/gi, replacement: 'Ét tê chênh lên' },
  { regex: /\bCOPD\b/gi, replacement: 'Bệnh phổi tắc nghẽn mạn tính' },
  { regex: /\bGERD\b/gi, replacement: 'Trào ngược dạ dày thực quản' },
  { regex: /\b(mmHg)\b/gi, replacement: 'mi li mét thủy ngân' },
  { regex: /\b(lần\/phút|l\/p)\b/gi, replacement: 'lần một phút' },
  { regex: /\b(nhịp\/phút)\b/gi, replacement: 'nhịp một phút' },
  { regex: /\b(\d+)\s*°C\b/gi, replacement: '$1 độ C' },
  
  // Formatting cleanups
  { regex: /\s*•\s*/g, replacement: ', ' },
  { regex: /\s*❖\s*/g, replacement: '. ' },
  { regex: /\s*📌\s*/g, replacement: '. ' },
  { regex: /\s*⭐\s*/g, replacement: '. ' },
  { regex: /\s*—\s*/g, replacement: ' ' },
  { regex: /\/+/g, replacement: ' trên ' }
];

export const normalizeMedicalSpeechText = (text) => {
  if (!text) return '';
  let normalized = String(text);

  MEDICAL_ABBREVIATIONS.forEach(({ regex, replacement }) => {
    normalized = normalized.replace(regex, replacement);
  });

  // Clean extra spaces & punctuation
  normalized = normalized
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s*\.\s*/g, '. ')
    .replace(/\.{2,}/g, '.')
    .trim();

  return normalized;
};

export default normalizeMedicalSpeechText;
