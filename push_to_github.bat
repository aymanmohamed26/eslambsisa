@echo off
title Push Eslam Bsisa Photography to GitHub
cd /d "%~dp0"
echo ======================================================
echo  Pushing Eslam Bsisa Photography to GitHub...
echo ======================================================
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ======================================================
    echo  SUCCESS! Your project has been uploaded to GitHub!
    echo ======================================================
) else (
    echo ======================================================
    echo  Failed to push. Please ensure you created the repo:
    echo  https://github.com/new?name=eslambsisa
    echo ======================================================
)
pause
