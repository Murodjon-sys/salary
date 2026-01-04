@echo off
echo ========================================
echo Salary Management Server - PM2 Setup
echo ========================================
echo.

REM Check if PM2 is installed
where pm2 >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo PM2 topilmadi. O'rnatilmoqda...
    call npm install -g pm2
    echo.
)

echo PM2 bilan server ishga tushirilmoqda...
call pm2 start server/index.js --name salary-server
echo.

echo ========================================
echo Server muvaffaqiyatli ishga tushdi!
echo ========================================
echo.
echo Foydali komandalar:
echo   pm2 status              - Status ko'rish
echo   pm2 logs salary-server  - Loglarni ko'rish
echo   pm2 restart salary-server - Qayta ishga tushirish
echo   pm2 stop salary-server  - To'xtatish
echo.
echo Server har kuni soat 23:59 da avtomatik yopadi.
echo ========================================

pause
