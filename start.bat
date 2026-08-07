@echo off
title He Thong Bao Cao Giao Ban - Benh Vien Binh Long
echo ================================================
echo   HE THONG BAO CAO GIAO BAN - BINH LONG
echo   Dang kiem tra va khoi dong cac dich vu...
echo ================================================
echo.

REM Kiem tra va khoi dong MySQL Service neu chua chay
echo [MySQL] Kiem tra MySQL Service...
sc query MySQL >nul 2>&1
if %errorLevel% equ 0 (
    sc query MySQL | find "RUNNING" >nul 2>&1
    if %errorLevel% neq 0 (
        echo [MySQL] Dang khoi dong MySQL Service...
        net start MySQL >nul 2>&1
        timeout /t 3 /nobreak >nul
        echo [MySQL] MySQL da san sang!
    ) else (
        echo [MySQL] MySQL dang chay san sang.
    )
) else (
    echo [MySQL] Service chua cai dat. Thu khoi dong thu cong...
    start /B "MySQL" "C:\xampp\mysql\bin\mysqld.exe" --console
    timeout /t 4 /nobreak >nul
    echo [MySQL] MySQL da khoi dong.
)
echo.

REM Khoi dong Backend Node.js
echo [Backend] Dang khoi dong Backend (Port 3001)...
cd /d "%~dp0server"
start "Backend - Hospital Report" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [Backend] Backend da chay tai http://localhost:3001
echo.

REM Khoi dong Frontend Vite
echo [Frontend] Dang khoi dong Frontend (Port 5173)...
cd /d "%~dp0client"
start "Frontend - Hospital Report" cmd /k "npm run dev"
timeout /t 3 /nobreak >nul
echo [Frontend] Frontend da chay tai http://localhost:5173
echo.

REM Mo trinh duyet
echo [Browser] Dang mo trinh duyet...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo ================================================
echo   TAT CA DICH VU DA KHOI DONG THANH CONG!
echo   Truy cap: http://localhost:5173
echo ================================================
echo.
echo Ban co the thu nho cua so nay.
