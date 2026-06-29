# html2pdf launcher for PowerShell (Windows)
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$PassThrough
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Check for Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "[html2pdf] Error: Node.js is not installed or not on PATH."
    Write-Error "  Install it from https://nodejs.org (v18+) and re-run."
    exit 1
}

$nodeVersion = [int](node -e "process.stdout.write(process.version.slice(1).split('.')[0])")
if ($nodeVersion -lt 18) {
    Write-Error "[html2pdf] Error: Node.js v18+ required (found v$nodeVersion)."
    exit 1
}

# Auto-install dependencies if node_modules is missing
if (-not (Test-Path (Join-Path $ScriptDir "node_modules"))) {
    Write-Host "[html2pdf] Installing dependencies..."
    Push-Location $ScriptDir
    npm install --silent
    Pop-Location
}

& node (Join-Path $ScriptDir "index.js") @PassThrough
exit $LASTEXITCODE
