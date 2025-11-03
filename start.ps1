# Set location to script directory
Set-Location $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "     Angles App - Install and Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "[1/4] Checking if Node.js is installed..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
    } else {
        throw "Node not found"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Node.js from:"
    Write-Host "https://nodejs.org/"
    Write-Host ""
    $response = Read-Host "Open download page? (Y/N)"
    if ($response -eq "Y" -or $response -eq "y") {
        Start-Process "https://nodejs.org/"
    }
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check if npm is installed
Write-Host "[2/4] Checking if npm is available..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] npm is available: $npmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] npm is not available!" -ForegroundColor Red
    Write-Host "This should be part of Node.js installation."
    Write-Host "Please reinstall Node.js."
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Check if node_modules exists
Write-Host "[3/4] Checking dependencies..." -ForegroundColor Yellow
if (-Not (Test-Path "node_modules")) {
    Write-Host "node_modules not found. Starting installation..." -ForegroundColor Yellow
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    Write-Host ""

    npm install

    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "[ERROR] Installation failed!" -ForegroundColor Red
        Write-Host "Please check your internet connection and try again."
        Write-Host ""
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host ""
    Write-Host "[OK] All dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[OK] Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Start the development server
Write-Host "[4/4] Starting the application..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  App will open in browser shortly..." -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the server, press Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Wait 3 seconds then open browser
Start-Sleep -Seconds 3
Start-Process "http://localhost:3000"

# Start the dev server
npm run dev

Write-Host ""
Write-Host "Server stopped." -ForegroundColor Yellow
Read-Host "Press Enter to exit"
