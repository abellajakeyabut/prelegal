# Builds the Prelegal image and runs it at http://localhost:8000.
# The SQLite database is temporary: it starts empty on every run.
$ErrorActionPreference = "Stop"

Set-Location (Join-Path $PSScriptRoot "..")
docker build -t prelegal .
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
docker rm -f prelegal 2>$null | Out-Null
docker run -d --rm --name prelegal -p 8000:8000 prelegal | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Prelegal is running at http://localhost:8000"
