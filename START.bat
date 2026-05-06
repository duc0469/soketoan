@echo off
echo ========================================
echo   HE THONG KE TOAN TU DONG
echo   Starting Backend and Frontend...
echo ========================================
echo.

REM Start Backend
echo [1/2] Starting Backend (Node.js)...
start "Backend Server" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend (React)...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo   Servers are starting...
echo   Backend:  http://localhost:5000
echo   Frontend: http://localhost:3000
echo ========================================
echo.
echo Press any key to exit this window...
pause >nul
