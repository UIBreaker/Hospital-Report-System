@echo off
title Dong phan mem
echo ================================================
echo   DANG TAT PHAN MEM BAO CAO GIAO BAN...
echo ================================================
echo.

REM Tat server Node.js
taskkill /F /IM node.exe >nul 2>&1
echo [OK] Da tat Backend.

REM Kiem tra xem MySQL co dang chay khong
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    REM Neu MySQL khong chay duoi dang service, thi tat no (de tranh tat nham service dang hoat dong)
    sc query MySQL | find "RUNNING" >nul 2>&1
    if %errorLevel% neq 0 (
        taskkill /F /IM mysqld.exe >nul 2>&1
        echo [OK] Da tat MySQL tam thoi.
    ) else (
        echo [INFO] MySQL dang chay duoi dang dich vu nen khong the tat ngang.
    )
)

echo.
echo ================================================
echo   DA TAT PHAN MEM HOAN TOAN!
echo ================================================
timeout /t 3
