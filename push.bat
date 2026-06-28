@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  GitHub Push Helper Script
echo ===================================================
echo.

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in your PATH.
    echo Please install Git and try again.
    pause
    exit /b 1
)

:: Check if .git folder exists
if not exist .git (
    echo [INFO] Git repository is not initialized. Initializing...
    git init
    git branch -M main
    git remote add origin https://adrianpattinasarany@github.com/adrianpattinasarany/MahkotaAaronRos.git
    echo [INFO] Git repository initialized and remote origin set to https://adrianpattinasarany@github.com/adrianpattinasarany/MahkotaAaronRos.git
) else (
    echo [INFO] Git repository already initialized.
    :: Check if remote origin is set, if not add it
    git remote get-url origin >nul 2>nul
    if %errorlevel% neq 0 (
        echo [INFO] Adding remote origin...
        git remote add origin https://adrianpattinasarany@github.com/adrianpattinasarany/MahkotaAaronRos.git
    ) else (
        :: Update remote origin URL just in case
        git remote set-url origin https://adrianpattinasarany@github.com/adrianpattinasarany/MahkotaAaronRos.git
    )
)

echo.
echo Current Git Status:
git status -s
echo.

:: Ask for commit message
set /p commit_msg="Enter commit message (default: 'Update'): "
if "%commit_msg%"=="" set commit_msg=Update

echo.
echo [INFO] Staging files...
git add .

echo [INFO] Committing files...
git commit -m "%commit_msg%"

echo [INFO] Pushing to GitHub (main branch)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [SUCCESS] Successfully pushed to GitHub!
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [ERROR] Failed to push to GitHub.
    echo  Please check your internet connection or git permissions.
    echo ===================================================
)

pause
