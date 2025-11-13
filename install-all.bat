@echo off
echo ========================================
echo NexEd Project - Install All Dependencies
echo ========================================
echo.

echo [1/3] Installing Backend Dependencies...
cd backend
if exist "package.json" (
    npm install
    if errorlevel 1 (
        echo ❌ Backend installation failed!
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Backend dependencies installed
) else (
    echo ❌ backend\package.json not found!
)
cd ..
echo.

echo [2/3] Installing Course Service Dependencies...
if exist "package.json" (
    npm install
    if errorlevel 1 (
        echo ❌ Course service installation failed!
        pause
        exit /b 1
    )
    echo ✅ Course service dependencies installed
) else (
    echo ❌ package.json not found!
)
echo.

echo [3/3] Installing Frontend Dependencies...
cd frontend
if exist "package.json" (
    npm install
    if errorlevel 1 (
        echo ❌ Frontend installation failed!
        cd ..
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ frontend\package.json not found!
)
cd ..
echo.

echo ========================================
echo ✅ All Dependencies Installed Successfully!
echo ========================================
echo.
echo Next Steps:
echo 1. Ensure MongoDB is running
echo 2. Run check-environment.bat to verify setup
echo 3. Start services using the start-*.bat files
echo.
pause
