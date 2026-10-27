param(
  [switch]$Deploy,
  [switch]$NoStart
)

$ErrorActionPreference = "Stop"
$backend = Split-Path -Parent $PSScriptRoot
$root = Split-Path -Parent $backend
$backendEnv = Join-Path $backend ".env"

if ($Deploy) {
  $frontend = Join-Path $root "frontend"
  $writeCheck = Join-Path $root ".sigrad-write-check"

  try {
    [System.IO.File]::WriteAllText($writeCheck, "")
    Remove-Item $writeCheck -Force
  }
  catch {
    throw "No hay permisos de escritura en $root. Mueve el proyecto fuera de Windows\System32 y vuelve a ejecutar npm run deploy."
  }

  if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
      -not (Get-Command npm -ErrorAction SilentlyContinue)) {
    throw "Instala Node.js LTS (incluye npm) y vuelve a ejecutar este script."
  }

  if (-not (Test-Path $backendEnv)) {
    Copy-Item (Join-Path $backend ".env.example") $backendEnv
    throw "Se creó backend/.env desde la plantilla. Configura PostgreSQL y NODE_ENV=production; luego vuelve a desplegar."
  }

  $env:NODE_ENV = "production"

  function Invoke-Npm {
    param(
      [Parameter(Mandatory = $true)][string]$Directory,
      [Parameter(Mandatory = $true)][string[]]$NpmArguments
    )

    Push-Location $Directory
    try {
      & npm @NpmArguments
      if ($LASTEXITCODE -ne 0) {
        throw "Falló npm $($NpmArguments -join ' ') en $Directory (código $LASTEXITCODE)."
      }
    }
    finally {
      Pop-Location
    }
  }

  function Install-IfChanged {
    param([Parameter(Mandatory = $true)][string]$Directory)

    $modules = Join-Path $Directory "node_modules"
    $npmLock = Join-Path $modules ".package-lock.json"
    $inputs = @("package.json", "package-lock.json") | ForEach-Object {
      Get-Item (Join-Path $Directory $_)
    }
    $needsInstall = -not (Test-Path $npmLock)

    if (-not $needsInstall) {
      $lockTime = (Get-Item $npmLock).LastWriteTimeUtc
      $needsInstall = @($inputs | Where-Object { $_.LastWriteTimeUtc -gt $lockTime }).Count -gt 0
    }

    if ($needsInstall) {
      Write-Host "Instalando/actualizando dependencias en $Directory..."
      Invoke-Npm -Directory $Directory -NpmArguments @("ci")
    }
    else {
      Write-Host "Dependencias sin cambios en $Directory; se omite npm ci."
    }
  }

  Install-IfChanged -Directory $backend
  Install-IfChanged -Directory $frontend
  Invoke-Npm -Directory $backend -NpmArguments @("run", "prisma:generate")
  Invoke-Npm -Directory $backend -NpmArguments @("run", "build")

  $previousApiUrl = $env:VITE_API_URL
  try {
    $env:VITE_API_URL = "/api"
    Invoke-Npm -Directory $frontend -NpmArguments @("run", "build")
  }
  finally {
    if ($null -eq $previousApiUrl) {
      Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
    }
    else {
      $env:VITE_API_URL = $previousApiUrl
    }
  }

  Invoke-Npm -Directory $backend -NpmArguments @("run", "prisma:migrate:deploy")
  Write-Host "Despliegue compilado y migraciones aplicadas."

  if (-not $NoStart) {
    Write-Host "SIGRAD se inicia en el puerto de backend/.env. Ctrl+C para detenerlo."
    Invoke-Npm -Directory $backend -NpmArguments @("start")
  }
  exit $LASTEXITCODE
}

if (-not (Test-Path $backendEnv)) {
  throw "No existe backend/.env. Copia .env.example a .env y configura PostgreSQL antes de iniciar SIGRAD."
}

if (-not (Get-Command node -ErrorAction SilentlyContinue) -or
    -not (Get-Command npm -ErrorAction SilentlyContinue)) {
  throw "Instala Node.js LTS (incluye npm) y vuelve a ejecutar este script."
}

Push-Location $backend
try {
  & npm run dev:server
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo iniciar SIGRAD (código $LASTEXITCODE)."
  }
}
finally {
  Pop-Location
}
