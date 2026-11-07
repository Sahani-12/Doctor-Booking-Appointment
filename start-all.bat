@echo off
title CareConnect Launcher
echo ===================================================
echo       CareConnect Hospital Management System
echo ===================================================
echo Starting all 4 services in dedicated windows...
echo.

echo [1/4] Starting CareConnect Backend (Port 4000)...
start "CareConnect Backend (Port 4000)" cmd /k "cd CareConnect-backend && npm start"

echo [2/4] Starting Patient Portal (Port 5173)...
start "Patient Portal (Port 5173)" cmd /k "cd CareConnect-User-main && npm run dev"

echo [3/4] Starting Doctor Portal (Port 5174)...
start "Doctor Portal (Port 5174)" cmd /k "cd CareConnectDoctors-main && npm run dev"

echo [4/4] Starting Admin Portal (Port 5175)...
start "Admin Portal (Port 5175)" cmd /k "cd CareConnect-Admin && npm run dev"

echo.
echo ===================================================
echo All services launched!
echo - Backend API:    http://localhost:4000
echo - Patient Portal: http://localhost:5173
echo - Doctor Portal:  http://localhost:5174
echo - Admin Portal:   http://localhost:5175
echo ===================================================
pause

