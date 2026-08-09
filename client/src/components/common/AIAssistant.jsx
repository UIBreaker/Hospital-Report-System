import React, { useState, useEffect, useRef } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaUserShield, FaKey, FaQuestionCircle, FaHospital, FaCode, FaCheck, FaInfoCircle } from 'react-icons/fa';

const DEPARTMENTS = [
  { code: 'noi.bvbl', name: 'Khoa Nội', key: 'noi', pass: '123' },
  { code: 'hscctnt.bvbl', name: 'Hồi sức cấp cứu – Thận nhân tạo', key: 'hscc_tnt', pass: '123' },
  { code: 'cdha.bvbl', name: 'Chẩn đoán hình ảnh', key: 'cdha', pass: '123' },
  { code: 'yhctphcn.bvbl', name: 'Y học cổ truyền – PHCN', key: 'yhct_phcn', pass: '123' },
  { code: 'nth.bvbl', name: 'Ngoại tổng hợp', key: 'ngoai_th', pass: '123' },
  { code: 'ctch.bvbl', name: 'Chấn thương chỉnh hình', key: 'ctch', pass: '123' },
  { code: 'nhi.bvbl', name: 'Khoa Nhi', key: 'nhi', pass: '123' },
  { code: 'nhiem.bvbl', name: 'Khoa Nhiễm', key: 'nhiem', pass: '123' },
  { code: 'gmhs.bvbl', name: 'Gây mê Hồi sức', key: 'gmhs', pass: '123' },
  { code: 'san.bvbl', name: 'Khoa Sản', key: 'san', pass: '123' },
  { code: 'xn.bvbl', name: 'Khoa Xét nghiệm', key: 'xn', pass: '123' },
];

const INITIAL_MESSAGES = [
  {
    sender: 'ai',
    text: '👋 Xin chào quý Bác sĩ và Cán bộ y tế! Tôi là Trợ Lý AI của Hệ Thống Báo Cáo Giao Ban – TTYT Khu Vực Bình Long.',
    time: 'Vừa xong'
  },
  {
    sender: 'ai',
    text: '💡 Bạn đang công tác tại Khoa/Phòng nào? Hãy chọn khoa bên dưới để tôi hướng dẫn và cấp tài khoản đăng nhập nhé! (Lưu ý: Trừ tài khoản Admin)',
    showDeptPicker: true,
    time: 'Vừa xong'
  }
];

const QUICK_QUESTIONS = [
  { id: 'author', label: '👨‍💻 Ai là tác giả phát triển phần mềm?' },
  { id: 'dept_account', label: '🔑 Cấp tài khoản cho khoa của tôi' },
  { id: 'test_ui_guide', label: '🧪 Chạy Test Playwright UI Mode' },
  { id: 'lorem_guide', label: '📝 Hướng dẫn phím tắt "lorem + Enter"' },
  { id: 'transfer_guide', label: '🚑 Hướng dẫn nhập ca Bệnh Chuyển Viện' },
  { id: 'presentation_guide', label: '📺 Hướng dẫn Trình Chiếu Giao Ban' },
  { id: 'admin_info', label: '🛡️ Tài khoản Quản trị viên (Admin)' }
];

const AIAssistant = ({ onAutoFillLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowNotificationBadge(false);
    }
  }, [messages, isOpen]);

  const handleSelectDept = (dept) => {
    const userMsg = { sender: 'user', text: `Tôi thuộc ${dept.name}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const aiMsg = {
      sender: 'ai',
      text: `✅ Đã tìm thấy tài khoản cho ${dept.name}:\n\n👤 Tên đăng nhập: ${dept.code}\n🔒 Mật khẩu mặc định: ${dept.pass}\n\n👉 Bạn có thể nhấn nút "Điền Tự Động" bên dưới để đăng nhập ngay lập tức!`,
      deptData: dept,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg, aiMsg]);
  };

  const handleQuickQuestion = (qId) => {
    let userText = '';
    let aiResponse = '';
    let showDepts = false;

    if (qId === 'author') {
      userText = 'Ai là người phát triển phần mềm này?';
      aiResponse = '👨‍💻 THÔNG TIN TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM:\n\n✨ Họ và tên: NGUYỄN VŨ NHẬT NAM\n🎓 Chức danh: Kỹ sư / Lập trình viên Frontend & Fullstack\n📅 Năm sinh: 2004\n🏥 Đơn vị công tác: Phòng Kế hoạch - Nghiệp vụ (KHNV) – Trung Tâm Y Tế Khu Vực Bình Long\n💻 Đơn vị phát triển phần mềm: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long\n\n🚀 Sứ mệnh & Đóng góp chuyển đổi số y tế:\n• Trực tiếp thiết kế kiến trúc và lập trình toàn bộ Hệ Thống Báo Cáo Giao Ban Trực Tuyến (React 18, Node.js Express, CSDL Cloud MySQL).\n• Tự động hóa quy trình nộp và tổng hợp số liệu cho toàn bộ 11 khoa lâm sàng và cận lâm sàng.\n• Xây dựng Động cơ Trình Chiếu Giao Ban Slide 4K chuyên dụng phục vụ các phiên họp giao ban định kỳ của Ban Giám Đốc.\n• Tích hợp Trợ Lý AI thông minh và Hệ thống kiểm thử tự động Playwright E2E đảm bảo phần mềm vận hành ổn định 24/7.';
    } else if (qId === 'dept_account') {
      userText = 'Cấp tài khoản đăng nhập cho khoa của tôi';
      aiResponse = '🔑 Bạn đang trực tại khoa nào dưới đây? Hãy nhấp vào tên khoa để nhận tài khoản và mật khẩu tương ứng:';
      showDepts = true;
    } else if (qId === 'lorem_guide') {
      userText = 'Cách dùng phím tắt lorem tự sinh chữ?';
      aiResponse = '📝 TÍNH NĂNG TỰ ĐỘNG SINH DỮ LIỆU TẠM (LOREM):\n\n1. Bạn đặt con trỏ chuột vào bất kỳ ô nhập văn bản nào (như Lý do vào viện, Cận lâm sàng, Chẩn đoán, Xử trí ban đầu, Diễn biến...).\n2. Gõ từ khóa: lorem\n3. Nhấn phím ENTER ↵\n\n✨ Hệ thống sẽ ngay lập tức tự động sinh ra một đoạn văn bản mẫu chuẩn (dummy text) để lấp vào chỗ trống một cách nhanh chóng!';
    } else if (qId === 'transfer_guide') {
      userText = 'Cách nhập báo cáo ca Bệnh Chuyển Viện?';
      aiResponse = '🚑 HƯỚNG DẪN NHẬP CA BỆNH CHUYỂN VIỆN:\n\n1. Trong form báo cáo của khoa, cuộn đến phần "BỆNH CHUYỂN VIỆN".\n2. Nhấn nút "+ Thêm Ca Chuyển Viện".\n3. Điền các trường: Họ tên & tuổi bệnh nhân, Giờ vào viện, Lý do, Cận lâm sàng, Chẩn đoán, Xử trí và Diễn biến lúc chuyển.\n4. Bạn có thể thêm 2 ca, 3 ca hoặc nhiều ca tùy theo ca trực mà không sợ bị mất thông tin!';
    } else if (qId === 'presentation_guide') {
      userText = 'Cách xem Trình Chiếu Giao Ban?';
      aiResponse = '📺 HƯỚNG DẪN TRÌNH CHIẾU GIAO BAN:\n\n1. Đăng nhập bằng tài khoản Quản trị viên (admin).\n2. Chọn ngày báo cáo và nhấn nút "Trình chiếu giao ban" (hệ thống sẽ mở ngay trong cùng tab).\n3. Dùng phím mũi tên Trái/Phải hoặc phím Cách (Space) để chuyển slide.\n4. Nhấn phím F để bật chế độ Toàn màn hình hoặc bấm nút "Chữ to (+)" ở thanh dưới để phóng to chữ cho phòng họp dễ quan sát!';
    } else if (qId === 'test_ui_guide') {
      userText = 'Cách chạy test quan sát click chuột (UI Mode)?';
      aiResponse = '🧪 HƯỚNG DẪN CHẠY TEST TỰ ĐỘNG VỚI PLAYWRIGHT UI MODE:\n\n1. Mở Terminal / PowerShell tại thư mục dự án.\n2. Chạy một trong các lệnh sau:\n\n   👉 Xem giao diện tương tác UI Mode (quan sát từng bước click chuột, xem timeline & chụp ảnh DOM):\n   npx playwright test --ui\n   (hoặc: npm run test:ui)\n\n   👉 Mở trình duyệt Chrome thật để nhìn chuột tự bấm trực tiếp:\n   npm run test:headed\n\n   👉 Chạy toàn bộ 48 bài test nhanh:\n   npm test\n\n✨ Playwright sẽ tự động mở cửa sổ trình duyệt, đăng nhập, nạp biểu mẫu và thực hiện mọi thao tác bấm chuột tự động 100%!';
    } else if (qId === 'admin_info') {
      userText = 'Tài khoản Quản trị viên (Admin) là gì?';
      aiResponse = '🛡️ TÀI KHOẢN QUẢN TRỊ VIÊN (ADMIN):\n\n• Tài khoản Admin: Khnv / Mật khẩu: Khnv@2026\n• Dành riêng cho Ban Giám Đốc và Phòng Kế Hoạch Nghiệp Vụ (KHNV).\n• Admin có quyền tổng hợp toàn bộ các khoa phòng, chỉnh sửa báo cáo và điều khiển trình chiếu slide giao ban.';
    }

    const newMsgs = [
      { sender: 'user', text: userText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      { sender: 'ai', text: aiResponse, showDeptPicker: showDepts, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ];
    setMessages(prev => [...prev, ...newMsgs]);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const query = inputVal.trim().toLowerCase();
    const userMsg = { sender: 'user', text: inputVal.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setInputVal('');

    let aiReply = '';
    let showDepts = false;
    let matchedDept = null;

    // Check if query mentions Playwright / Testing / UI mode
    if (query.includes('playwright') || query.includes('test') || query.includes('--ui') || query.includes('kiểm thử') || query.includes('click chuột')) {
      aiReply = '🧪 HƯỚNG DẪN CHẠY TEST GIAO DIỆN (UI MODE):\n\nĐể quan sát Playwright tự động click chuột và chạy từng bước kiểm thử trên giao diện trực quan:\n\n1. Mở cửa sổ Terminal / PowerShell trên máy tính.\n2. Gõ lệnh:\n   npx playwright test --ui\n   (hoặc: npm run test:ui)\n\n3. Để mở trực tiếp trình duyệt Chrome tự động thao tác:\n   npm run test:headed\n\n🎉 Cửa sổ Playwright Test Runner sẽ xuất hiện với đầy đủ dòng thời gian (timeline), ảnh chụp màn hình từng bước và nhật ký chi tiết!';
    }
    // Check if query mentions author
    else if (query.includes('tác giả') || query.includes('ai tạo') || query.includes('ai làm') || query.includes('phát triển') || query.includes('nhật nam') || query.includes('nguyễn vũ')) {
      aiReply = '👨‍💻 THÔNG TIN TÁC GIẢ & NHÀ PHÁT TRIỂN PHẦN MỀM:\n\n✨ Họ và tên: NGUYỄN VŨ NHẬT NAM\n🎓 Chức danh: Kỹ sư / Lập trình viên Frontend & Fullstack\n📅 Năm sinh: 2004\n🏥 Đơn vị công tác: Phòng Kế hoạch - Nghiệp vụ (KHNV) – Trung Tâm Y Tế Khu Vực Bình Long\n💻 Đơn vị phát triển phần mềm: Hệ Thống Báo Cáo Giao Ban Trực Tuyến – Trung Tâm Y Tế Khu Vực Bình Long\n\n🚀 Sứ mệnh & Đóng góp chuyển đổi số y tế:\n• Trực tiếp thiết kế kiến trúc và lập trình toàn bộ Hệ Thống Báo Cáo Giao Ban Trực Tuyến.\n• Tự động hóa quy trình nộp và tổng hợp số liệu cho toàn bộ 11 khoa lâm sàng và cận lâm sàng.\n• Xây dựng Động cơ Trình Chiếu Giao Ban Slide 4K chuyên dụng phục vụ các phiên họp giao ban định kỳ của Ban Giám Đốc.\n• Tích hợp Trợ Lý AI thông minh và Hệ thống kiểm thử tự động Playwright E2E đảm bảo phần mềm vận hành ổn định 24/7.';
    }
    // Check if query matches a department
    else {
      matchedDept = DEPARTMENTS.find(d => 
        query.includes(d.name.toLowerCase()) || 
        query.includes(d.key) || 
        query.includes(d.code.split('.')[0])
      );

      if (matchedDept) {
        aiReply = `✅ Đây là tài khoản đăng nhập của ${matchedDept.name}:\n\n👤 Tên đăng nhập: ${matchedDept.code}\n🔒 Mật khẩu: ${matchedDept.pass}\n\n👉 Bạn có thể nhấn nút "Điền Tự Động" bên dưới để đăng nhập!`;
      } else if (query.includes('admin') || query.includes('quản trị')) {
        aiReply = '🛡️ Tài khoản Quản trị viên (Admin) chỉ dành riêng cho Ban Giám Đốc và Phòng KHNV để điều hành giao ban. Hệ thống không cấp tự động tài khoản này.';
      } else if (query.includes('tài khoản') || query.includes('mật khẩu') || query.includes('khoa') || query.includes('đăng nhập')) {
        aiReply = '🔑 Bạn vui lòng chọn khoa phòng của bạn trong danh sách bên dưới để tôi cung cấp tài khoản chính xác nhé:';
        showDepts = true;
      } else if (query.includes('lorem')) {
        aiReply = '📝 Gõ "lorem" rồi nhấn Enter trong bất kỳ ô văn bản nào, hệ thống sẽ tự động tạo một đoạn văn bản mẫu chuẩn để lấp chỗ trống ngay lập tức!';
      } else {
        aiReply = `Dạ tôi đã ghi nhận câu hỏi của bạn. Hệ Thống Báo Cáo Giao Ban được phát triển bởi Nguyễn Vũ Nhật Nam (2004). Bạn có thể chọn các câu hỏi có sẵn bên dưới hoặc chọn khoa phòng để nhận tài khoản đăng nhập nhé!`;
        showDepts = true;
      }
    }

    const aiMsg = {
      sender: 'ai',
      text: aiReply,
      showDeptPicker: showDepts,
      deptData: matchedDept,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
  };

  return (
    <>
      {/* Floating AI Button (Bottom Right) */}
      <div className="ai-floating-container" style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="ai-floating-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              backgroundColor: '#0F2C59', color: '#FFFFFF',
              border: '2px solid #3B82F6', borderRadius: '999px',
              padding: '0.75rem 1.35rem', cursor: 'pointer',
              boxShadow: '0 8px 25px rgba(15, 44, 89, 0.45)',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(15, 44, 89, 0.6)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(15, 44, 89, 0.45)'; }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              backgroundColor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FaRobot style={{ fontSize: '1rem', color: '#FFF' }} />
            </div>
            <div className="ai-btn-text" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', letterSpacing: '0.3px' }}>Trợ Lý Y Tế AI</div>
              <div className="ai-btn-sub" style={{ fontSize: '0.7rem', color: '#93C5FD' }}>Hỏi đáp & Lấy tài khoản khoa</div>
            </div>
            {showNotificationBadge && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                width: '12px', height: '12px', borderRadius: '50%',
                backgroundColor: '#EF4444', border: '2px solid #FFF',
                animation: 'pulse 1.5s infinite'
              }} />
            )}
          </button>
        )}
      </div>

      {/* Chatbox Window */}
      {isOpen && (
        <div className="ai-chatbox-window" style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem',
          width: 'calc(100vw - 3rem)', maxWidth: '420px', height: '580px',
          maxHeight: 'calc(100vh - 3rem)',
          backgroundColor: '#FFFFFF', borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(15, 44, 89, 0.35)',
          border: '1px solid #E2E8F0',
          display: 'flex', flexDirection: 'column',
          zIndex: 10000, overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {/* Chat Header */}
          <div style={{
            background: 'linear-gradient(135deg, #0F2C59 0%, #1E40AF 100%)',
            color: '#FFFFFF', padding: '1rem 1.2rem',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <FaRobot style={{ fontSize: '1.2rem' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  Trợ Lý Y Tế AI <span style={{ fontSize: '0.65rem', backgroundColor: '#10B981', color: '#FFF', padding: '1px 6px', borderRadius: '999px' }}>Online</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#93C5FD' }}>TTYT Khu Vực Bình Long • Hỗ trợ trực tuyến</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem', opacity: 0.8 }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            backgroundColor: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '0.85rem'
          }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{
                  maxWidth: '85%', padding: '0.75rem 1rem',
                  borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  backgroundColor: msg.sender === 'user' ? '#1E40AF' : '#FFFFFF',
                  color: msg.sender === 'user' ? '#FFFFFF' : '#1E293B',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  fontSize: '0.85rem', lineHeight: '1.5', whiteSpace: 'pre-line',
                  border: msg.sender === 'user' ? 'none' : '1px solid #E2E8F0'
                }}>
                  {msg.text}

                  {/* Auto-fill button if dept account provided */}
                  {msg.deptData && onAutoFillLogin && (
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.6rem', borderTop: '1px dashed #CBD5E1' }}>
                      <button
                        onClick={() => {
                          onAutoFillLogin(msg.deptData.code, msg.deptData.pass);
                          setIsOpen(false);
                        }}
                        style={{
                          width: '100%', padding: '0.45rem 0.8rem',
                          backgroundColor: '#10B981', color: '#FFF',
                          border: 'none', borderRadius: '6px', cursor: 'pointer',
                          fontWeight: '700', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                        }}
                      >
                        <FaCheck /> Điền Tự Động Vào Ô Đăng Nhập
                      </button>
                    </div>
                  )}
                </div>

                {/* Department Picker Buttons Grid */}
                {msg.showDeptPicker && (
                  <div style={{
                    marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', maxWidth: '100%'
                  }}>
                    {DEPARTMENTS.map((dept) => (
                      <button
                        key={dept.code}
                        onClick={() => handleSelectDept(dept)}
                        style={{
                          padding: '0.35rem 0.65rem', backgroundColor: '#FFFFFF',
                          color: '#0F2C59', border: '1.5px solid #BFDBFE',
                          borderRadius: '999px', fontSize: '0.75rem', fontWeight: '600',
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#EFF6FF'; e.currentTarget.style.borderColor = '#2563EB'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#BFDBFE'; }}
                      >
                        🏥 {dept.name}
                      </button>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '0.65rem', color: '#94A3B8', marginTop: '3px', padding: '0 4px' }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions Carousel */}
          <div style={{
            padding: '0.5rem 0.75rem', backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E2E8F0', overflowX: 'auto', whiteSpace: 'nowrap',
            display: 'flex', gap: '0.4rem'
          }}>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.id}
                onClick={() => handleQuickQuestion(q.id)}
                style={{
                  padding: '0.35rem 0.75rem', backgroundColor: '#F1F5F9',
                  color: '#334155', border: '1px solid #CBD5E1',
                  borderRadius: '999px', fontSize: '0.72rem', fontWeight: '600',
                  cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#DBEAFE'; e.currentTarget.style.color = '#1E40AF'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#F1F5F9'; e.currentTarget.style.color = '#334155'; }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '0.75rem', backgroundColor: '#FFFFFF',
              borderTop: '1px solid #E2E8F0', display: 'flex', gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi hoặc tên khoa phòng..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{
                flex: 1, padding: '0.55rem 0.85rem', fontSize: '0.85rem',
                border: '1.5px solid #CBD5E1', borderRadius: '999px',
                outline: 'none', backgroundColor: '#F8FAFC'
              }}
            />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                backgroundColor: inputVal.trim() ? '#2563EB' : '#94A3B8',
                color: '#FFFFFF', border: 'none', cursor: inputVal.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}
            >
              <FaPaperPlane style={{ fontSize: '0.85rem' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
