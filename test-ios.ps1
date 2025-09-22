# LifeX Mobile - iOS Test Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "LifeX Mobile - iOS Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "[1/3] Checking for running Node.js processes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found $($nodeProcesses.Count) running Node.js processes. Cleaning up..." -ForegroundColor Red
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Cleanup completed." -ForegroundColor Green
} else {
    Write-Host "No running Node.js processes found." -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/3] Starting Expo development server for iOS..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Instructions:" -ForegroundColor Cyan
Write-Host "1. Connect your iPhone via USB" -ForegroundColor White
Write-Host "2. Trust the computer when prompted on iPhone" -ForegroundColor White
Write-Host "3. Open Expo Go app on iPhone" -ForegroundColor White
Write-Host "4. The app should automatically appear in 'Development servers'" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan

npx expo start --ios --clear
