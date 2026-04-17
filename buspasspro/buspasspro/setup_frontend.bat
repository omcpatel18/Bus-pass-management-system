@echo off
setlocal

set FRONTEND_DIR="c:\Users\Hp\OneDrive\Desktop\Bus pass management\buspasspro\buspasspro\frontend"

echo [1/2] Navigating to frontend directory...
cd /d %FRONTEND_DIR%

if not exist node_modules (
    echo [2/2] node_modules not found. Installing npm dependencies...
    npm install
) else (
    echo [2/2] node_modules found. Checking for updates...
    npm update
)

echo ==========================================
echo Frontend Environment Ready
echo ==========================================
pause
