@echo off
REM Skiller Windows Build Script (CMD version)
REM Run this script on a Windows machine

echo ========================================
echo Skiller Windows Build Script
echo ========================================

echo.
echo Checking prerequisites...

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org/
    exit /b 1
)
echo [OK] Node.js found

REM Check Rust
where rustc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Rust not found. Please install from https://rustup.rs/
    exit /b 1
)
echo [OK] Rust found

echo.
echo Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] npm install failed
    exit /b 1
)

echo.
echo Building Skiller for Windows...
call npm run tauri build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)

echo.
echo ========================================
echo Build successful!
echo ========================================
echo.
echo Output files:
echo   MSI installer: src-tauri\target\release\bundle\msi\
echo   NSIS installer: src-tauri\target\release\bundle\nsis\

REM Open the output folder
if exist "src-tauri\target\release\bundle\msi" (
    explorer.exe "src-tauri\target\release\bundle\msi"
)

pause
