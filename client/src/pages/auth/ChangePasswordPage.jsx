import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChangePasswordModal from '../../components/auth/ChangePasswordModal';

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const tempUser = JSON.parse(sessionStorage.getItem('temp_auth_user') || '{}');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0F2C59' }}>
      <ChangePasswordModal
        isOpen={true}
        username={tempUser.username || ''}
        fullName={tempUser.full_name || ''}
        isMandatory={true}
        onSuccess={(data) => {
          sessionStorage.removeItem('temp_auth_user');
          if (data?.token) {
            localStorage.setItem('token', data.token);
          }
          alert('Đổi mật khẩu thành công! Đang chuyển hướng vào hệ thống...');
          navigate('/');
        }}
        onClose={() => navigate('/')}
      />
    </div>
  );
};

export default ChangePasswordPage;
