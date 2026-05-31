@echo off
title Scratch App
cd /d "%~dp0"
echo Current folder: %cd%
echo.
echo Installing dependencies...
npm install --ignore-scripts --legacy-peer-deps
echo.
echo Starting Expo...
npx expo start
echo.
echo === Expo stopped ===
pause
