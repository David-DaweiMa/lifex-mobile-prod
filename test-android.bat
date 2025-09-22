@echo off
echo ========================================
echo LifeX Mobile - Android Test Script
echo ========================================

echo.
echo [1/3] Checking for running Node.js processes...
tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo Found running Node.js processes. Cleaning up...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 2 >nul
    echo Cleanup completed.
) else (
    echo No running Node.js processes found.
)

echo.
echo [2/3] Starting Expo development server for Android...
echo.
echo Instructions:
echo 1. Start Android emulator or connect Android device
echo 2. The app should automatically open in the emulator
echo.
echo Press Ctrl+C to stop the server
echo ========================================

npx expo start --android --clear
