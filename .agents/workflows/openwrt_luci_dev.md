---
description: How to develop, build, and deploy OpenWrt LuCI applications
---
# OpenWrt LuCI Application Development Workflow

This workflow documents the integrated development cycle for building OpenWrt LuCI applications. It covers writing code on a Windows host (often with AI assistance), compiling on a remote Linux build server, and verifying on a real router.

## Prerequisites

1.  **Windows Host**: Used for writing code, version control, and running automation scripts (PowerShell).
2.  **Linux Build Server**: A remote machine or WSL instance containing the OpenWrt SDK.
3.  **OpenWrt Router**: The target device for deployment and testing.
4.  **SSH Key Authentication**: Passwordless SSH access must be configured from Windows to both the Linux server and the Router.

## Prompting AI Agents for Action

To quickly spin up a new OpenWrt project with an AI agent, provide the agent with the following crucial context in your initial prompt:

1.  **Objective**: Clearly describe the application's purpose (e.g., "Create a LuCI frontend for wireguard").
2.  **Infrastructure Details**: Provide the exact IP addresses, usernames, and passwords (if key access isn't set up yet).
    *   *Build Server*: `user@<Build-IP>`
    *   *Router*: `root@<Router-IP>`
3.  **Paths**: Provide absolute paths so the agent knows exactly where everything is.
    *   *Local Workspace*: `D:\Path\To\Local\Code`
    *   *Remote Build Source*: `/home/user/code/my-luci-app`
    *   *OpenWrt SDK Path*: `/home/user/openwrt/sdk`
4.  **Reference this Skill**: Remind the agent to check the `openwrt_luci_dev` workflow file for caveats on SCP protocols, JSON UI caching, and LuCI RPC bindings.

## Workflow Steps

### 1. Code Editing (Local Windows)
- Write your LuCI application code (MVC: `controller`, `model`, `view` in Lua or JS, UCI config, Init scripts, and `Makefile`) locally on Windows.
- Keep front-end caching in mind: LuCI aggressively caches JS views. Bypass this by renaming files or clearing `/tmp/luci-modulecache`.

### 2. Synchronization
- Synchronize your local source code to the remote Linux build server using `scp` or `rsync`.

### 3. Remote Compilation
- Compile the code using the OpenWrt SDK on the Linux server using `make package/my-app/compile V=s`.
- **Pitfalls**: Watch out for missing dependencies in openwrt feeds. Remove bad dependencies from your `Makefile` or manually clone them into the SDK's `package/` folder if feed updates fail.

### 4. Deployment
- Fetch the compiled `.ipk` file from the remote build server -> Windows -> Router.
- **Critical Caveat**: Use `scp -O` (legacy protocol) when pushing to the OpenWrt router natively, as Dropbear SSH does not include SFTP by default. Install using `opkg install --force-reinstall`.

### 5. Backend Init and RPC Testing (Real-Machine Validation)
- Test init scripts via `ssh root@router '/etc/init.d/my_app start'`.
- **Critical Caveat (Namespace Collision)**: Do NOT name any custom command in your init script `config` (e.g., `EXTRA_COMMANDS="config"`). This collides with `rc.common`'s internal UCI parser and causes a Segmentation Fault! Use `print_config` or similar instead.
- **Critical Caveat (RPC Parameter Dropping)**: Invoking `fs.exec('/etc/init.d/my_app', ['print_config'])` from the LuCI JS frontend may result in parameters being silently dropped by the OpenWrt backend (`ubus call file exec`). The safest fix is to create an argument-less wrapper script (e.g., `/usr/libexec/my-app-config` containing `#!/bin/sh\n/etc/init.d/my_app print_config`), grant it `exec` permissions in `acl.d`, and let JS run the wrapper directly.

## Automation Script Templates

These PowerShell scripts (`sync.ps1`, `build.ps1`, `deploy.ps1`, `dev.ps1`) sit in your local `scripts\` folder. Adjust the `$remoteUser`, `$remoteHost`, `$remotePath`, etc., at the top of each script to match your environment.

### scripts/sync.ps1
```powershell
$remoteUser = "user"
$remoteHost = "192.168.x.x"
$remotePath = "/home/user/my-app/"

# Ensure remote directory exists
ssh $remoteUser@$remoteHost "mkdir -p $remotePath"

Write-Host "Syncing files to $remoteHost..." -ForegroundColor Cyan
# Adjust the list of files/folders to sync as necessary
scp -r root Makefile "${remoteUser}@${remoteHost}:${remotePath}"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Sync successful!" -ForegroundColor Green
} else {
    Write-Host "Sync failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
```

### scripts/build.ps1
```powershell
$remoteUser = "user"
$remoteHost = "192.168.x.x"
$sdkPath = "/home/user/openwrt/sdk"
$packagePath = "package/my-app"
$remoteSource = "/home/user/my-app"

Write-Host "Building on remote server..." -ForegroundColor Cyan

$buildCmd = @"
cd $sdkPath
mkdir -p package/
rm -rf $packagePath
ln -s $remoteSource $packagePath
./scripts/feeds update -a
./scripts/feeds install -a
make package/my-app/compile V=s
"@

ssh $remoteUser@$remoteHost $buildCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
} else {
    Write-Host "Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
```

### scripts/deploy.ps1
```powershell
$remoteUser = "user"
$remoteHost = "192.168.x.x"
$routerUser = "root"
$routerHost = "192.168.y.y"
$sdkPath = "/home/user/openwrt/sdk"

Write-Host "Fetching IPK from build server and deploying to router..." -ForegroundColor Cyan

# Find the newly built IPK
$findCmd = "find $sdkPath/bin/packages -name 'my-app*.ipk' | head -n 1"
$ipkRemotePath = ssh $remoteUser@$remoteHost $findCmd

if (-not $ipkRemotePath) {
    Write-Host "Could not find built IPK on remote server." -ForegroundColor Red
    exit 1
}

Write-Host "Downloading $ipkRemotePath..." -ForegroundColor Yellow
scp -O "${remoteUser}@${remoteHost}:${ipkRemotePath}" ./my-app_latest.ipk

Write-Host "Uploading to router..." -ForegroundColor Yellow
# Using -O for Legacy SCP protocol required by OpenWrt
scp -O ./my-app_latest.ipk "${routerUser}@${routerHost}:/tmp/"

Write-Host "Installing on router..." -ForegroundColor Yellow
$installCmd = "opkg install /tmp/my-app_latest.ipk --force-reinstall"
ssh $routerUser@$routerHost $installCmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "Deployment failed with exit code $LASTEXITCODE" -ForegroundColor Red
}
```

### scripts/dev.ps1
```powershell
Write-Host "--- Starting Full Cycle: Sync -> Build -> Deploy ---"
.\scripts\sync.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

.\scripts\build.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

.\scripts\deploy.ps1
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host "--- All tasks completed successfully! ---"
```
