# ASCII Renderer Test - PowerShell version
# Run in Windows Terminal for best results

$ErrorActionPreference = "Stop"
Set-Location "C:\Source\playwright-cli"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   ASCII Renderer Test - Playwright Browsh" -ForegroundColor Cyan  
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$url = if ($args[0]) { $args[0] } else { "https://example.com" }
Write-Host "🌐 Rendering: $url" -ForegroundColor Yellow
Write-Host ""

mise exec -- node test-ascii.js $url

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
