@echo off
title Scratch App
color 0A
cls

echo.
echo  =============================================
echo   SCRATCH - To-Do App  ^|  Dev Server
echo  =============================================
echo.

:: Stay in the correct folder (in case user runs from desktop shortcut)
cd /d "%~dp0"
echo  [Location] %CD%
echo.

:: Check Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js is NOT installed!
    echo.
    echo  Please download and install it from:
    echo  https://nodejs.org  ^(get the LTS version^)
    echo.
    echo  After installing, close this window and run again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODEVERSION=%%i
echo  [OK] Node.js %NODEVERSION% found
echo.

:: Install dependencies if node_modules is missing or empty
if not exist "node_modules\expo" (
    echo  [Setup] Installing packages... this takes 2-3 mins on first run.
    echo          Do NOT close this window!
    echo.
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo  [ERROR] npm install failed!
        echo.
        echo  Try these fixes:
        echo   1. Right-click START_WINDOWS.bat and choose "Run as Administrator"
        echo   2. Delete the node_modules folder if it exists, then try again
        echo   3. Check your internet connection
        echo.
        pause
        exit /b 1
    )
    echo.
    echo  [OK] Packages installed successfully!
    echo.
) else (
    echo  [OK] Packages already installed
    echo.
)

echo  =============================================
echo   Starting Expo...
echo  =============================================
echo.
echo  WHAT TO DO NEXT:
echo   1. Install "Expo Go" from the Google Play Store
echo   2. Open Expo Go on your phone
echo   3. Tap "Scan QR code" and scan the code below
echo.
echo  Press CTRL+C to stop the server
echo  =============================================
echo.

:: Run expo - do NOT use "call" so window stays open on crash
npx expo start --clear

echo.
echo  =============================================
echo   Server stopped.
echo  =============================================
echo.
pause
