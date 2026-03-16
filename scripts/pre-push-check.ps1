$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
Set-Location $rootDir

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
go test ./...

Write-Host "[pre-push] running Go coverage gate..."
& (Join-Path $rootDir "scripts/check-go-coverage.ps1")

Write-Host "[pre-push] running frontend lint/format/tests..."
Push-Location (Join-Path $rootDir "frontend")
try {
    pnpm run lint
    pnpm run format:check
    pnpm run test
}
finally {
    Pop-Location
}

Write-Host "[pre-push] all checks passed"
