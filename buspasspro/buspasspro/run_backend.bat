@echo off
setlocal

set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"
set "BACKEND_DIR=%PROJECT_DIR%\backend"

set "PYTHON_EXE=%BACKEND_DIR%\.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=%BACKEND_DIR%\venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=%PROJECT_DIR%\.venv\Scripts\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=%PROJECT_DIR%\venv\Scripts\python.exe"

if not exist "%PYTHON_EXE%" (
    echo [ERROR] Could not find project virtual environment python.
    echo Checked:
    echo   %BACKEND_DIR%\.venv\Scripts\python.exe
    echo   %BACKEND_DIR%\venv\Scripts\python.exe
    echo   %PROJECT_DIR%\.venv\Scripts\python.exe
    echo   %PROJECT_DIR%\venv\Scripts\python.exe
    echo.
    echo Please create one with:
    echo   cd backend
    echo   python -m venv venv
    echo   venv\Scripts\python.exe -m pip install -r requirements.txt
    exit /b 1
)

echo Using python: %PYTHON_EXE%
cd /d "%BACKEND_DIR%"

echo [1/3] Applying database migrations...
"%PYTHON_EXE%" manage.py migrate
if errorlevel 1 exit /b 1

echo [2/3] Verifying demo users/state...
"%PYTHON_EXE%" manage.py ensure_ready
if errorlevel 1 exit /b 1

echo [3/3] Starting backend server on http://localhost:8000 ...
"%PYTHON_EXE%" manage.py runserver 0.0.0.0:8000
