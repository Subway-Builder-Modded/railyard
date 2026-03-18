param(
    [double]$MinCoverage = 60,
    [string]$GoCoverPackages = ""
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$coverDir = Join-Path $rootDir ".tmp"
$coverFile = Join-Path $coverDir "coverage.out"

New-Item -ItemType Directory -Path $coverDir -Force | Out-Null

Write-Host "[coverage] running go tests with coverage profile..."
if ([string]::IsNullOrWhiteSpace($GoCoverPackages)) {
    $coverPackages = go list ./... | Where-Object { $_ -notmatch "/internal/testutil($|/)" }
}
else {
    $coverPackages = $GoCoverPackages -split "\s+" | Where-Object { $_ -ne "" }
}

go test $coverPackages "-coverprofile=$coverFile"
if ($LASTEXITCODE -ne 0) {
    throw "[coverage] go test failed with exit code $LASTEXITCODE"
}

$totalLine = go tool cover "-func=$coverFile" | Select-String "^total:" | Select-Object -Last 1
if ($LASTEXITCODE -ne 0) {
    throw "[coverage] go tool cover failed with exit code $LASTEXITCODE"
}
if (-not $totalLine) {
    throw "[coverage] failed: could not parse total coverage"
}

$match = [regex]::Match($totalLine.ToString(), "(\d+(\.\d+)?)%")
if (-not $match.Success) {
    throw "[coverage] failed: could not parse total coverage percent"
}

$totalCoverage = [double]$match.Groups[1].Value
Write-Host "[coverage] total: $totalCoverage% (minimum: $MinCoverage%)"

if ($totalCoverage -lt $MinCoverage) {
    throw "[coverage] failed: total coverage below threshold"
}

Write-Host "[coverage] passed"
