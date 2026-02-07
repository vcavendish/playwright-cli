@echo off
cd /d C:\Source\playwright-cli
echo.
echo =============================================
echo    ASCII Renderer - Interactive Mode
echo =============================================
echo.

:loop
set /p URL="Enter URL (or 'quit' to exit): "
if /i "%URL%"=="quit" goto end
if /i "%URL%"=="exit" goto end
if "%URL%"=="" set URL=https://example.com

echo.
echo Rendering %URL% to ASCII...
echo.
call mise exec -- node test-ascii.js %URL%
echo.
echo =============================================
goto loop

:end
echo Goodbye!
