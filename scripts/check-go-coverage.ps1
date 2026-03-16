param(
    [double]$MinCoverage = 45,
    [string]$GoCoverPackages = "./..."
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $PSScriptRoot
$coverDir = Join-Path $rootDir ".tmp"
$coverFile = Join-Path $coverDir "coverage.out"

New-Item -ItemType Directory -Path $coverDir -Force | Out-Null

Write-Host "[coverage] running go tests with coverage profile..."
go test $GoCoverPackages "-coverprofile=$coverFile"

$totalLine = go tool cover "-func=$coverFile" | Select-String "^total:" | Select-Object -Last 1
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
