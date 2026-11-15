# Stops the running Prelegal container (it is removed on stop).
$ErrorActionPreference = "Stop"

docker stop prelegal | Out-Null
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Prelegal stopped"
