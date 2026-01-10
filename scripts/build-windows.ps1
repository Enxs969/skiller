# Skiller Windows Build Script
# Run this script on a Windows machine with PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Skiller Windows Build Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version
    Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check Rust
if (Get-Command rustc -ErrorAction SilentlyContinue) {
    $rustVersion = rustc --version
    Write-Host "✓ Rust: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Rust not found. Please install from https://rustup.rs/" -ForegroundColor Red
    exit 1
}

# Check Cargo
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    Write-Host "✓ Cargo: available" -ForegroundColor Green
} else {
    Write-Host "✗ Cargo not found. Please reinstall Rust." -ForegroundColor Red
    exit 1
}

Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "`nBuilding Skiller for Windows..." -ForegroundColor Yellow
npm run tauri build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "`nOutput files:" -ForegroundColor Cyan
    Write-Host "  MSI installer: src-tauri\target\release\bundle\msi\" -ForegroundColor White
    Write-Host "  NSIS installer: src-tauri\target\release\bundle\nsis\" -ForegroundColor White
    
    # Open the output folder
    $msiPath = "src-tauri\target\release\bundle\msi"
    if (Test-Path $msiPath) {
        explorer.exe $msiPath
    }
} else {
    Write-Host "`n✗ Build failed" -ForegroundColor Red
    exit 1
}
