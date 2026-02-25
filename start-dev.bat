@echo off
chcp 65001 >nul
echo.
echo ========================================
echo EasyStay Local Development Environment
echo ========================================
echo.

REM Get project root directory
cd /d "%~dp0"

echo [1/3] Starting Backend Service (Server - Port 3000)...
start cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak

echo [2/3] Starting Admin Panel (Admin-Client - Port 3001)...
start cmd /k "cd admin-client && npm run dev"
timeout /t 2 /nobreak

echo [3/3] Starting Mobile App (Mobile-Client - Port 3002)...
start cmd /k "cd mobile-client && npm run dev"
timeout /t 2 /nobreak

echo.
echo ========================================
echo All services started!
echo ========================================
echo.
echo Local access addresses:
echo - Admin Panel: http://localhost:3001
echo - Mobile App:  http://localhost:3002
echo - Backend API: http://localhost:3000/api
echo.
echo Check terminal windows for errors or logs
echo.
pause
