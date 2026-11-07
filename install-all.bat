@echo off
title CareConnect Dependency Installer
echo ===================================================
echo     Installing Dependencies for All Projects
echo ===================================================
echo.

echo [1/4] Installing CareConnect Backend dependencies...
cd CareConnect-backend && call npm install && cd ..

echo [2/4] Installing Patient Portal dependencies...
cd CareConnect-User-main && call npm install && cd ..

echo [3/4] Installing Doctor Portal dependencies...
cd CareConnectDoctors-main && call npm install && cd ..

echo [4/4] Installing Admin Portal dependencies...
cd CareConnect-Admin && call npm install && cd ..

echo.
echo ===================================================
echo All dependencies installed successfully!
echo You can now run start-all.bat to launch everything.
echo ===================================================
pause

