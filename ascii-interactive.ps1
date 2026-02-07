# ASCII Renderer - Interactive Mode
# Run in Windows Terminal for best results

$ErrorActionPreference = "Stop"
Set-Location "C:\Source\playwright-cli"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "   ASCII Renderer - Interactive Mode" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

while ($true) {
    $url = Read-Host "Enter URL (or 'quit' to exit)"
    
    if ($url -eq "quit" -or $url -eq "exit" -or $url -eq "q") {
        Write-Host "Goodbye!" -ForegroundColor Green
        break
    }
    
    if ([string]::IsNullOrWhiteSpace($url)) {
        $url = "https://example.com"
    }
    
    Write-Host ""
    Write-Host "🌐 Rendering: $url" -ForegroundColor Yellow
    Write-Host ""
    
    try {
        mise exec -- node test-ascii.js $url
    } catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
}
