$remoteUser = "dq"
$remoteHost = "192.168.101.88"
$sdkPath = "/home/dq/work/openwrt/sdk"
$packagePath = "package/luci-app-v2ray-adv"
$remoteSource = "/home/dq/work/wsl-ml/luci-app-v2ray-adv"

Write-Host "Building on remote server..." -ForegroundColor Cyan

# Prepare SDK: link the synced source into the SDK
$buildCmd = @"
cd $sdkPath
# Ensure feeds.conf exists (standard feeds are enough)
if [ ! -f feeds.conf ]; then
    cp feeds.conf.default feeds.conf
fi
# Remove kuoruan from feeds.conf if it was added
sed -i '/kuoruan/d' feeds.conf

mkdir -p package/
# Manually clone v2ray-core into package/v2ray-core if not exists
if [ ! -d package/v2ray-core ]; then
    git clone https://github.com/kuoruan/openwrt-v2ray.git package/v2ray-core
fi

rm -rf $packagePath
ln -s $remoteSource $packagePath
./scripts/feeds update -a
./scripts/feeds install -a
make package/luci-app-v2ray-adv/compile V=s
"@

ssh $remoteUser@$remoteHost $buildCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
