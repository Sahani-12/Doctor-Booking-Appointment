# CareConnect Hospital Management System - Multi-Service Launcher

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "      CareConnect Hospital Management System       " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "Starting all 4 services in dedicated windows..." -ForegroundColor Yellow
Write-Host ""

$baseDir = $PSScriptRoot

# 1. Backend
Write-Host "[1/4] Starting CareConnect Backend (Port 4000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\CareConnect-backend'; Write-Host '=== CareConnect Backend (Port 4000) ===' -ForegroundColor Green; npm start"

# 2. Patient Portal
Write-Host "[2/4] Starting Patient Portal (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\CareConnect-User-main'; Write-Host '=== Patient Portal (Port 5173) ===' -ForegroundColor Cyan; npm run dev"

# 3. Doctor Portal
Write-Host "[3/4] Starting Doctor Portal (Port 5174)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\CareConnectDoctors-main'; Write-Host '=== Doctor Portal (Port 5174) ===' -ForegroundColor Magenta; npm run dev"

# 4. Admin Portal
Write-Host "[4/4] Starting Admin Portal (Port 5175)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\CareConnect-Admin'; Write-Host '=== Admin Portal (Port 5175) ===' -ForegroundColor Yellow; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "All 4 services launched successfully!" -ForegroundColor Green
Write-Host "  Backend API:    http://localhost:4000" -ForegroundColor White
Write-Host "  Patient Portal: http://localhost:5173" -ForegroundColor White
Write-Host "  Doctor Portal:  http://localhost:5174" -ForegroundColor White
Write-Host "  Admin Portal:   http://localhost:5175" -ForegroundColor White
Write-Host "===================================================" -ForegroundColor Cyan

