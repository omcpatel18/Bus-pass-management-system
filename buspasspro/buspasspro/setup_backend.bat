@echo off
setlocal

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
for %%I in ("%PROJECT_DIR%\..") do set "PARENT_DIR=%%~fI"
for %%I in ("%PARENT_DIR%\..") do set "GRANDPARENT_DIR=%%~fI"
set "BACKEND_DIR=%PROJECT_DIR%\backend"
set "VENV_PATH=%PROJECT_DIR%\.venv"

if not exist "%VENV_PATH%\Scripts\python.exe" (
    set "VENV_PATH=%PROJECT_DIR%\venv"
)

if not exist "%VENV_PATH%\Scripts\python.exe" (
    set "VENV_PATH=%PARENT_DIR%\.venv"
)

if not exist "%VENV_PATH%\Scripts\python.exe" (
    set "VENV_PATH=%PARENT_DIR%\venv"
)

if not exist "%VENV_PATH%\Scripts\python.exe" (
    set "VENV_PATH=%GRANDPARENT_DIR%\.venv"
)

if not exist "%VENV_PATH%\Scripts\python.exe" (
    set "VENV_PATH=%GRANDPARENT_DIR%\venv"
)

set "PYTHON_EXE=%VENV_PATH%\Scripts\python.exe"
set "DO_INSTALL=0"
if /I "%~1"=="--install" set "DO_INSTALL=1"

echo [1/3] Navigating to backend directory...
cd /d "%BACKEND_DIR%"

if not exist "%PYTHON_EXE%" (
    echo [ERROR] Virtual environment python not found.
    echo Checked:
    echo   %PROJECT_DIR%\.venv\Scripts\python.exe
    echo   %PROJECT_DIR%\venv\Scripts\python.exe
    echo   %PARENT_DIR%\.venv\Scripts\python.exe
    echo   %PARENT_DIR%\venv\Scripts\python.exe
    echo   %GRANDPARENT_DIR%\.venv\Scripts\python.exe
    echo   %GRANDPARENT_DIR%\venv\Scripts\python.exe
    exit /b 1
)

if "%DO_INSTALL%"=="1" (
    echo [2/3] Installing/Updating core dependencies...
    "%PYTHON_EXE%" -m pip install -r requirements.txt
) else (
    echo [2/3] Skipping dependency install.
    echo         Run setup_backend.bat --install when requirements change.
)

echo [3/3] Running migrations and fixing constraints...
"%PYTHON_EXE%" manage.py migrate
"%PYTHON_EXE%" manage.py ensure_ready

echo ==========================================
echo Backend Environment Ready
echo ==========================================
pause
