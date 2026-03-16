param(
  [ValidateSet("register", "unregister")]
  [string]$Mode = "register",

  [string]$ExecutablePath
)

$ErrorActionPreference = "Stop"

$protocolName = "railyard"
$baseKey = "HKCU:\Software\Classes\$protocolName"

function Resolve-ExecutablePath {
  param([string]$ProvidedPath)

  if ($ProvidedPath) {
    return (Resolve-Path -Path $ProvidedPath).Path
  }

  $repoRoot = (Resolve-Path -Path (Join-Path -Path $PSScriptRoot -ChildPath "..")).Path
  $candidatePaths = @(
    (Join-Path -Path $repoRoot -ChildPath "build\bin\railyard.exe"),
    (Join-Path -Path $repoRoot -ChildPath "build\bin\Railyard.exe"),
    (Join-Path -Path $repoRoot -ChildPath "build\bin\railyard-dev.exe"),
    (Join-Path -Path $env:LOCALAPPDATA -ChildPath "Programs\Railyard\railyard.exe"),
    (Join-Path -Path $env:ProgramFiles -ChildPath "Railyard\railyard.exe"),
    (Join-Path -Path ${env:ProgramFiles(x86)} -ChildPath "Railyard\railyard.exe")
  )

  foreach ($candidate in $candidatePaths) {
    if ($candidate -and (Test-Path -Path $candidate)) {
      return (Resolve-Path -Path $candidate).Path
    }
  }

  throw "Executable path not found. Pass -ExecutablePath 'C:\path\to\railyard.exe'."
}

if ($Mode -eq "unregister") {
  if (Test-Path -Path $baseKey) {
    Remove-Item -Path $baseKey -Recurse -Force
    Write-Host "Removed protocol association for '${protocolName}://' from HKCU."
  }
  else {
    Write-Host "No protocol association found for '${protocolName}://' in HKCU."
  }
  exit 0
}

$resolvedExe = Resolve-ExecutablePath -ProvidedPath $ExecutablePath
$commandValue = "`"$resolvedExe`" `"%1`""

New-Item -Path $baseKey -Force | Out-Null
Set-ItemProperty -Path $baseKey -Name "(default)" -Value "URL:Railyard Protocol"
Set-ItemProperty -Path $baseKey -Name "URL Protocol" -Value ""

New-Item -Path "$baseKey\DefaultIcon" -Force | Out-Null
Set-ItemProperty -Path "$baseKey\DefaultIcon" -Name "(default)" -Value "$resolvedExe,0"

New-Item -Path "$baseKey\shell\open\command" -Force | Out-Null
Set-ItemProperty -Path "$baseKey\shell\open\command" -Name "(default)" -Value $commandValue

Write-Host "Registered '${protocolName}://' to: $resolvedExe"
Write-Host ("Test with: start `"`" '{0}://open?type=maps&id=example'" -f $protocolName)
