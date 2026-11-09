$remoteUser = "dq"
$remoteHost = "192.168.101.88"
$remotePath = "/home/dq/work/wsl-ml/luci-app-v2ray-adv/"
$localPath = ".\"

# Ensure remote directory exists
ssh $remoteUser@$remoteHost "mkdir -p $remotePath"

Write-Host "Syncing files to $remoteHost..." -ForegroundColor Cyan

# Use scp to sync files. This may prompt for password if SSH keys are not set up.
# We exclude common non-source files if possible, but scp is simple.
scp -r root Makefile "${remoteUser}@${remoteHost}:${remotePath}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sync successful!" -ForegroundColor Green
} else {
    Write-Host "Sync failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
