@echo off
cd /d "%~dp0"

REM Kiểm tra và bật MySQL
sc query MySQL >nul 2>&1
if %errorLevel% equ 0 (
    sc query MySQL | find "RUNNING" >nul 2>&1
    if %errorLevel% neq 0 (
        net start MySQL >nul 2>&1
    )
) else (
    tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
    if "%ERRORLEVEL%"=="1" (
        start /B "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone --console
    )
)

REM Chờ MySQL khởi động (dùng ping thay cho timeout để chạy nền không bị lỗi)
ping 127.0.0.1 -n 11 > nul

REM Chạy Backend ngầm
cd /d "%~dp0server"
start /B "" node server.js

REM Chờ Backend khởi động
ping 127.0.0.1 -n 4 > nul

REM Mở giao diện trên trình duyệt
start "" "http://localhost:3001"
