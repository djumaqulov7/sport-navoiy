@echo off
title sport.NAVOIY Server v2.0
chcp 65001 >nul
echo ========================================================
echo   sport.NAVOIY - Futbol Ekipirovkasi Online Do'koni
echo   Server ishga tushirilmoqda...
echo ========================================================
cd /d "%~dp0"
start "" "http://127.0.0.1:8000"
python server.py
if errorlevel 1 (
    echo Python topilmadi yoki xatolik yuz berdi. "py" bilan urinib ko'ramiz...
    py server.py
)
pause
