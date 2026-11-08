@echo off
title sport.NAVOIY - Internetga Chiqarish (Online Tunnel)
chcp 65001 >nul
echo ========================================================
echo   sport.NAVOIY - Online Do'kon va Admin Panel
echo   Internetga xavfsiz HTTPS havola orqali chiqarilmoqda...
echo ========================================================
cd /d "%~dp0"

:: Server ishga tushirish (orqa fonda)
start /b py server.py >nul 2>&1

echo Tunnel ulanmoqda, 3 soniya kuting...
ping 127.0.0.1 -n 4 >nul

:: Cloudflared tunnelni ishga tushirish
"%~dp0tools\cloudflared.exe" tunnel --url http://127.0.0.1:8000
pause
