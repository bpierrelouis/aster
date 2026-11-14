# RIGEL : construit l'image du relais (application mobile comprise, cible « relais » du Dockerfile)
# et la publie dans un registre, pour le conteneur Docker de l'environnement Hidora.
# Exemple : .\infra\rigel\publier-hidora.ps1 -Image docker.io/compte/rigel -Tag 0.2.0
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-z0-9._/-]+$')]
  [string]$Image,

  # Étiquette immuable : une nouvelle étiquette par version publiée
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-zA-Z0-9._-]+$')]
  [string]$Tag,

  [string]$Registry = 'docker.io',

  [switch]$SkipLogin,

  [switch]$Pull,

  [switch]$BuildOnly
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

if ($Tag -eq 'latest') { throw "Choisissez une etiquette immuable (par exemple 0.2.0), pas 'latest'." }
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker est introuvable. Demarrez Docker Desktop puis relancez le script.' }

# Contexte de construction : le dossier application/ (Dockerfile commun à ORION et RIGEL)
$applicationRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$fullImage = "${Image}:${Tag}"

docker info *> $null
if ($LASTEXITCODE -ne 0) { throw 'Docker Desktop ne repond pas. Demarrez-le puis relancez le script.' }

if (-not $SkipLogin -and -not $BuildOnly) {
  Write-Host "Connexion au registre $Registry..."
  docker login $Registry
  if ($LASTEXITCODE -ne 0) { throw 'La connexion au registre Docker a echoue.' }
}

Write-Host "Construction de $fullImage (cible relais)..."
$buildArguments = @('build', '--progress', 'plain', '--platform', 'linux/amd64', '--target', 'relais', '--tag', $fullImage)
if ($Pull) { $buildArguments += '--pull' }
$buildArguments += $applicationRoot
& docker @buildArguments
if ($LASTEXITCODE -ne 0) { throw "La construction de l'image a echoue : la cause figure dans les lignes Docker ci-dessus." }

if ($BuildOnly) {
  Write-Host ''
  Write-Host 'Image construite localement.' -ForegroundColor Green
  Write-Host "Image : $fullImage"
  exit 0
}

Write-Host "Publication de $fullImage..."
docker push $fullImage
if ($LASTEXITCODE -ne 0) { throw 'La publication a echoue. Verifiez le nom du depot, vos droits et le proxy de Docker.' }

$repoDigest = docker image inspect $fullImage --format '{{join .RepoDigests "`n"}}'
Write-Host ''
Write-Host 'Image publiee.' -ForegroundColor Green
Write-Host "Image : $fullImage"
if ($repoDigest) { Write-Host "Digest : $repoDigest" }
Write-Host "Dans Hidora : Redeploy container, puis controle de https://<environnement>/api/health."
