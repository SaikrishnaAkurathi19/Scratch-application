@echo off
title Scratch App - Build APK
color 0B
cls

echo.
echo  =============================================
echo   SCRATCH - Build APK for Android
echo  =============================================
echo.

cd /d "%~dp0"
echo  [Location] %CD%
echo.

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Install from https://nodejs.org
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist "node_modules\expo" (
    echo  [Setup] Installing packages first...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo  [ERROR] npm install failed. Try "Run as Administrator".
        pause
        exit /b 1
    )
)

:: Install eas-cli if not present
where eas >nul 2>&1
if errorlevel 1 (
    echo  [Setup] Installing EAS build tool...
    call npm install -g eas-cli
    if errorlevel 1 (
        echo  [ERROR] Could not install eas-cli. Try Run as Administrator.
        pause
        exit /b 1
    )
)

echo  [OK] EAS CLI ready
echo.

:: Check login
for /f "tokens=*" %%i in ('eas whoami 2^>^&1') do set EASUSER=%%i
echo  [OK] Logged in as: %EASUSER%
echo.

echo  =============================================
echo   Building APK... (5-15 minutes, don't close)
echo  =============================================
echo.

eas build --platform android --profile preview

if errorlevel 1 (
    echo.
    echo  [ERROR] Build failed. See error above.
    echo.
    echo  Most common causes:
    echo   1. Run this instead and read the full error:
    echo      Open a Command Prompt in this folder and type:
    echo      eas build --platform android --profile preview
    echo.
    echo   2. If it says "project not found", run:
    echo      eas init
    echo      (choose "Create a new project", then build again)
    echo.
    pause
    exit /b 1
)

echo.
echo  =============================================
echo   DONE! Download your APK from the URL above.
echo  =============================================
echo.
pause
