USE hospital_report;

INSERT INTO users (username, password_hash, department_code, department_name, role) VALUES
('hscctnt.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'hscc_tnt', 'Hồi sức cấp cứu – Thận nhân tạo', 'department'),
('cdha.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'cdha', 'Chuẩn đoán hình ảnh', 'department'),
('yhctphcn.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'yhct_phcn', 'Y học cổ truyền – Phục hồi chức năng', 'department'),
('nth.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'ngoai_th', 'Ngoại tổng hợp', 'department'),
('ctch.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'ctch', 'Chấn thương chỉnh hình', 'department'),
('nhi.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'nhi', 'Nhi', 'department'),
('nhiem.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'nhiem', 'Nhiễm', 'department'),
('gmhs.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'gmhs', 'Gây mê Hồi sức', 'department'),
('san.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'san', 'Sản', 'department'),
('xn.bvbl', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'xn', 'Xét nghiệm', 'department'),
('admin', '$2b$10$P6qiqatgseZ31AOk6DdQe.iosBVo0IL6yiQEvnJtdPxA/pOczEjWa', 'admin', 'Ban Giám đốc', 'admin');
