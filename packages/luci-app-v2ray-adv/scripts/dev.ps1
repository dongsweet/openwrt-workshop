Write-Host "--- Starting Full Cycle: Sync -> Build -> Deploy ---" -ForegroundColor Blue

./scripts/sync.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

./scripts/build.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

./scripts/deploy.ps1
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "--- All tasks completed successfully! ---" -ForegroundColor Green
