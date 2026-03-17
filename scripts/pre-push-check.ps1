$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

function Invoke-CheckedCommand {
    param(
        [scriptblock]$Command,
        [string]$FailureMessage
    )

    & $Command
    if ($LASTEXITCODE -ne 0) {
        throw "$FailureMessage (exit code $LASTEXITCODE)"
    }
}

Write-Host "[pre-push] checking Go formatting..."
$goFiles = git ls-files "*.go"
if ($goFiles) {
    $unformatted = gofmt -l $goFiles
    if ($unformatted) {
        Write-Host "[pre-push] gofmt required for:"
        $unformatted | ForEach-Object { Write-Host $_ }
        throw "[pre-push] gofmt check failed"
    }
}

Write-Host "[pre-push] running Go tests..."
Invoke-CheckedCommand { go test ./... } "[pre-push] Go tests failed"

Write-Host "[pre-push] running Go coverage gate..."
Invoke-CheckedCommand { & (Join-Path $rootDir "scripts/check-go-coverage.ps1") } "[pre-push] Go coverage gate failed"

Write-Host "[pre-push] running frontend lint/format/tests..."
Push-Location (Join-Path $rootDir "frontend")
try {
    Invoke-CheckedCommand { pnpm run lint } "[pre-push] frontend lint failed"
    Invoke-CheckedCommand { pnpm run format:check } "[pre-push] frontend format check failed"
    Invoke-CheckedCommand { pnpm run test } "[pre-push] frontend tests failed"
}
finally {
    Pop-Location
}

Write-Host "[pre-push] all checks passed"
