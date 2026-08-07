@echo off
title Cai dat MySQL Service - Benh Vien Binh Long
echo ================================================
echo   CAI DAT MYSQL SERVICE - TU DONG KHOI DONG
echo   Benh Vien Binh Long - He Thong Giao Ban
echo ================================================
echo.

REM Kiem tra quyen Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [LOI] Vui long chay file nay voi quyen Administrator!
    echo.
    echo Huong dan: Chuot phai vao file nay > "Run as administrator"
    pause
    exit /b 1
)

echo [1/4] Dang kiem tra MySQL daemon hien tai...
taskkill /F /IM mysqld.exe >nul 2>&1
echo      Da tat tien trinh mysqld.exe cu (neu co)
echo.

echo [2/4] Dang cai MySQL thanh Windows Service...
"C:\xampp\mysql\bin\mysqld.exe" --install MySQL --defaults-file="C:\xampp\mysql\bin\my.ini"
if %errorLevel% equ 0 (
    echo      Cai dat Windows Service thanh cong!
) else (
    echo      [Canh bao] Service co the da ton tai hoac co loi. Tiep tuc...
)
echo.

echo [3/4] Cau hinh MySQL tu dong khoi dong khi bat may...
sc config MySQL start= auto >nul 2>&1
echo      Da cau hinh MySQL StartType = Automatic
echo.

echo [4/4] Dang khoi dong MySQL Service...
net start MySQL
if %errorLevel% equ 0 (
    echo      MySQL Service da khoi dong thanh cong!
) else (
    echo      [Canh bao] Co the MySQL da dang chay.
)
echo.

echo ================================================
echo   HOAN TAT! MySQL se tu dong chay khi bat may.
echo   Ban co the dong cua so nay.
echo ================================================
echo.
pause
