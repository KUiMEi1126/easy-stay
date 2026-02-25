@echo off
chcp 65001 >nul
echo.
echo ========================================
echo EasyStay Initial Setup
echo ========================================
echo.
echo Installing dependencies for all projects...
echo.

cd /d "%~dp0"

echo [1/3] Installing server dependencies...
cd server
call npm install
if errorlevel 1 (
    echo Error: Failed to install server dependencies
    pause
    exit /b 1
)
echo Server dependencies installed successfully!
echo.

echo [2/3] Installing admin-client dependencies...
cd ..\admin-client
call npm install
if errorlevel 1 (
    echo Error: Failed to install admin-client dependencies
    pause
    exit /b 1
)
echo Admin-client dependencies installed successfully!
echo.

echo [3/3] Installing mobile-client dependencies...
cd ..\mobile-client
call npm install
if errorlevel 1 (
    echo Error: Failed to install mobile-client dependencies
    pause
    exit /b 1
)
echo Mobile-client dependencies installed successfully!
echo.

echo ========================================
echo All dependencies installed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run start-dev.bat to start all services
echo 2. Or run each service manually in separate terminals:
echo    - cd server ^&^& npm run dev
echo    - cd admin-client ^&^& npm run dev
echo    - cd mobile-client ^&^& npm run dev
echo.
pause
