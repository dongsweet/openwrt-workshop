$remoteUser = "dq"
$remoteHost = "192.168.101.88"
$routerUser = "root"
$routerHost = "192.168.101.253"
$sdkPath = "/home/dq/work/openwrt/sdk"

Write-Host "Fetching IPK from build server and deploying to router..." -ForegroundColor Cyan

# Find the newly built IPK
$findCmd = "find $sdkPath/bin/packages -name 'luci-app-v2ray-adv*.ipk' | head -n 1"
$ipkRemotePath = ssh $remoteUser@$remoteHost $findCmd

if (-not $ipkRemotePath) {
    Write-Host "Could not find built IPK on remote server." -ForegroundColor Red
    exit 1
}

Write-Host "Downloading $ipkRemotePath..." -ForegroundColor Yellow
scp -O "${remoteUser}@${remoteHost}:${ipkRemotePath}" ./luci-app-v2ray-adv_latest.ipk

Write-Host "Uploading to router..." -ForegroundColor Yellow
scp -O ./luci-app-v2ray-adv_latest.ipk "${routerUser}@${routerHost}:/tmp/"

Write-Host "Installing on router..." -ForegroundColor Yellow
$installCmd = "opkg install /tmp/luci-app-v2ray-adv_latest.ipk --force-reinstall"
ssh $routerUser@$routerHost $installCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
