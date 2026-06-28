@echo off
echo ===================================================
echo  Starting Mahkota Aaronros Admin Server...
echo ===================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org to run the admin portal.
    pause
    exit /b 1
)

:: Run node server in a new window
echo [INFO] Spinning up local server on port 3000...
start "Mahkota Admin Server" node admin_server.js

:: Wait 2 seconds for server to start
timeout /t 2 >nul

:: Open dashboard in browser
echo [INFO] Launching Admin Dashboard in your browser...
start http://localhost:3000

echo.
echo ===================================================
echo  [SUCCESS] Admin Portal launched!
echo  Keep the server window open while using the panel.
echo ===================================================
echo.
pause
