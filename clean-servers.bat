@echo off
echo ========================================
echo LifeX Mobile - Server Cleanup Script
echo ========================================

echo.
echo Checking for running Node.js processes...
tasklist /fi "imagename eq node.exe" | find "node.exe" >nul
if %errorlevel% equ 0 (
    echo Found running Node.js processes:
    tasklist /fi "imagename eq node.exe"
    echo.
    echo Cleaning up...
    taskkill /f /im node.exe
    echo.
    echo Cleanup completed!
) else (
    echo No running Node.js processes found.
)

echo.
echo All servers have been stopped.
pause
