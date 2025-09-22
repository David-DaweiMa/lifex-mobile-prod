@echo off
echo ========================================
echo LifeX Mobile - iOS Test Script
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
echo [2/3] Starting Expo development server for iOS...
echo.
echo Instructions:
echo 1. Connect your iPhone via USB
echo 2. Trust the computer when prompted on iPhone
echo 3. Open Expo Go app on iPhone
echo 4. The app should automatically appear in "Development servers"
echo.
echo Press Ctrl+C to stop the server
echo ========================================

npx expo start --ios --clear
