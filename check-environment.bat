@echo off
echo ========================================
echo NexEd Project Environment Checker
echo ========================================
echo.

echo [1/6] Checking Node.js...
node --version
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js ^>= 14.0.0
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)
echo.

echo [2/6] Checking npm...
npm --version
if errorlevel 1 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    echo ✅ npm is installed
)
echo.

echo [3/6] Checking MongoDB...
mongod --version
if errorlevel 1 (
    echo ❌ MongoDB not found! Please install MongoDB
    echo Download from: https://www.mongodb.com/try/download/community
) else (
    echo ✅ MongoDB is installed
)
echo.

echo [4/6] Checking if MongoDB is running...
netstat -an | findstr "27017" >nul
if errorlevel 1 (
    echo ⚠️  MongoDB might not be running on port 27017
    echo Try: net start MongoDB
) else (
    echo ✅ MongoDB is running on port 27017
)
echo.

echo [5/6] Checking project files...
if exist "backend\server.js" (
    echo ✅ Backend server found
) else (
    echo ❌ Backend server not found!
)

if exist "src\server.js" (
    echo ✅ Course service found
) else (
    echo ❌ Course service not found!
)

if exist "frontend\package.json" (
    echo ✅ Frontend found
) else (
    echo ❌ Frontend not found!
)
echo.

echo [6/6] Checking environment files...
if exist "backend\.env" (
    echo ✅ backend\.env found
) else (
    echo ❌ backend\.env not found! Please create it.
)

if exist ".env" (
    echo ✅ .env found (for course service)
) else (
    echo ❌ .env not found! Please create it.
)

if exist "frontend\.env" (
    echo ✅ frontend\.env found
) else (
    echo ❌ frontend\.env not found! Please create it.
)
echo.

echo [7/7] Checking dependencies...
echo.
echo Backend dependencies:
if exist "backend\node_modules" (
    echo ✅ Backend dependencies installed
) else (
    echo ⚠️  Backend dependencies not installed
    echo Run: cd backend ^&^& npm install
)

echo Course service dependencies:
if exist "node_modules" (
    echo ✅ Course service dependencies installed
) else (
    echo ⚠️  Course service dependencies not installed
    echo Run: npm install
)

echo Frontend dependencies:
if exist "frontend\node_modules" (
    echo ✅ Frontend dependencies installed
) else (
    echo ⚠️  Frontend dependencies not installed
    echo Run: cd frontend ^&^& npm install
)

echo.
echo ========================================
echo Environment Check Complete!
echo ========================================
echo.
echo If all checks passed, you can start the services:
echo 1. Double-click start-backend.bat
echo 2. Double-click start-course-service.bat
echo 3. Double-click start-frontend.bat
echo.
pause
