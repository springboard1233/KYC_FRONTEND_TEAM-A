# start-dev.ps1
$ErrorActionPreference = "Stop"

# Resolve paths
$Root = $PSScriptRoot
$Backend = Join-Path $Root "backend"
$Frontend = Join-Path $Root "frontend"

Write-Host "Project root: $Root" -ForegroundColor Cyan

# === Backend setup & launch ===
Write-Host "`n== Backend ==" -ForegroundColor Cyan
Push-Location $Backend

# Create venv if missing
if (-Not (Test-Path ".venv")) {
    Write-Host 'Creating venv...'
    py -3 -m venv .venv
}

$PyExe = Join-Path $Backend ".venv\Scripts\python.exe"

Write-Host 'Upgrading pip and installing backend requirements...'
& $PyExe -m pip install --upgrade pip
if (Test-Path "requirements.txt") {
    & $PyExe -m pip install -r requirements.txt
} else {
    Write-Host 'No requirements.txt found in backend folder' -ForegroundColor Yellow
}

# Ensure correct .env exists (copy .env.example or create minimal file)
$EnvExample = Join-Path $Backend ".env.example"
$EnvFile = Join-Path $Backend ".env"
if (-Not (Test-Path $EnvFile)) {
    if (Test-Path $EnvExample) {
        Copy-Item $EnvExample $EnvFile -Force
        Write-Host 'Copied .env.example -> .env'
    } else {
        Write-Host '.env.example not found — creating minimal .env'
        @"
MONGO_URI=mongodb://localhost:27017/kyc_database
JWT_SECRET=local_dev_secret_replace_me
FRONTEND_URL=http://localhost:5173
PORT=5000
"@ | Out-File -Encoding ascii $EnvFile
    }
} else {
    Write-Host '.env already present'
}

# Launch backend in a new persistent window using the venv python
$BackendScript = Join-Path $Backend "app.py"
$BackendCmd = "& '$PyExe' '$BackendScript'"
Write-Host "Launching backend: $BackendCmd"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $BackendCmd

Pop-Location

# === Frontend setup & launch ===
Write-Host "`n== Frontend ==" -ForegroundColor Cyan
Push-Location $Frontend

# Ensure .env for Vite API base
$FEEnv = Join-Path $Frontend ".env"
if (-Not (Test-Path $FEEnv)) {
    "VITE_API_BASE=http://localhost:5000" | Out-File -Encoding ascii $FEEnv
    Write-Host 'Created frontend .env'
} else {
    Write-Host 'Frontend .env already present'
}

Write-Host 'Installing frontend deps (npm install) - may take a while...'
npm install

# Launch Vite dev server in a new persistent window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Pop-Location

Write-Host "`n== Done ==" -ForegroundColor Green
Write-Host 'Backend: http://localhost:5000  |  Frontend: http://localhost:5173'
