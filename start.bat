@echo off
echo ============================================
echo   MovieMind AI - Starting Application
echo ============================================
echo.

cd /d "%~dp0"

echo [1/3] Building React frontend...
set PATH=C:\Users\ravis\OneDrive\Documents\Default Project\.node-local\node-v20.18.1-win-x64;%PATH%
set COREPACK_ENABLE_STRICT=0
call npx vite build
if %ERRORLEVEL% NEQ 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)
echo Frontend built successfully!
echo.

echo [2/3] Starting FastAPI server on http://localhost:8000
echo.
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

pause
