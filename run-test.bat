@echo off
cd /d C:\Source\playwright-cli
echo.
echo =============================================
echo    ASCII Renderer Test - Playwright Browsh
echo =============================================
echo.
call mise exec -- node test-ascii.js https://example.com
echo.
echo =============================================
pause
