# Build Signed Release AAB for Yomy Ramdan App
# This script builds a signed Android App Bundle ready for Play Store upload

Write-Host "Building signed release AAB..." -ForegroundColor Green

# Set JAVA_HOME to Android Studio's JDK
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"

# Navigate to android directory and build
Set-Location android
./gradlew bundleRelease

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build successful!" -ForegroundColor Green
    Write-Host "`nSigned AAB location:" -ForegroundColor Cyan
    $aab = Get-Item "app\build\outputs\bundle\release\app-release.aab"
    Write-Host "  $($aab.FullName)" -ForegroundColor Yellow
    Write-Host "  Size: $([math]::Round($aab.Length/1MB, 2)) MB" -ForegroundColor Yellow
    Write-Host "`nYou can now upload this file to Google Play Console!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    exit 1
}

Set-Location ..
