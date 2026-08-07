CREATE DATABASE IF NOT EXISTS hospital_report CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_report;

-- users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  department_code VARCHAR(50) NOT NULL,
  department_name NVARCHAR(255) NOT NULL,
  role ENUM('department', 'admin') DEFAULT 'department',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- reports table
CREATE TABLE reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_code VARCHAR(50) NOT NULL,
  report_date DATE NOT NULL,
  doctor_name NVARCHAR(255) NOT NULL,
  room NVARCHAR(255),
  shift_time NVARCHAR(100),
  report_data JSON NOT NULL,
  status ENUM('draft', 'submitted') DEFAULT 'submitted',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_dept_date (department_code, report_date)
);

-- transfer_cases table
CREATE TABLE transfer_cases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  patient_name NVARCHAR(255),
  age NVARCHAR(50),
  address NVARCHAR(500),
  admission_time NVARCHAR(255),
  reason NVARCHAR(500),
  clinical_tests TEXT,
  diagnosis TEXT,
  initial_treatment TEXT,
  progress_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
);
