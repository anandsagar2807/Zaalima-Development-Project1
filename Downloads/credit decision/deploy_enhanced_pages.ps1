#!/usr/bin/env powershell
# CreditSense Frontend Enhancement Deployment Script
# This script deploys all enhanced pages and validates the installation

param(
    [switch]$Backup = $true,
    [switch]$Force = $false,
    [switch]$NoRestart = $false
)

Write-Host "🚀 CreditSense Frontend Enhancement Deployment" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = Get-Location
$FrontendPath = Join-Path $WorkspaceRoot "frontend"

# Verify frontend directory exists
if (-not (Test-Path $FrontendPath)) {
    Write-Host "❌ Frontend directory not found at $FrontendPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Frontend directory located" -ForegroundColor Green
Write-Host ""

# Pages to deploy
$Pages = @(
    @{
        Name = "Dashboard"
        EnhancedPath = "app/(platform)/dashboard/page-enhanced.tsx"
        TargetPath = "app/(platform)/dashboard/page.tsx"
    },
    @{
        Name = "Applications"
        EnhancedPath = "app/(platform)/applications/page-enhanced.tsx"
        TargetPath = "app/(platform)/applications/page.tsx"
    },
    @{
        Name = "Companies"
        EnhancedPath = "app/(platform)/companies/page-enhanced.tsx"
        TargetPath = "app/(platform)/companies/page.tsx"
    },
    @{
        Name = "Documents"
        EnhancedPath = "app/(platform)/documents/page-enhanced.tsx"
        TargetPath = "app/(platform)/documents/page.tsx"
    },
    @{
        Name = "Risk"
        EnhancedPath = "app/(platform)/risk/page-enhanced.tsx"
        TargetPath = "app/(platform)/risk/page.tsx"
    },
    @{
        Name = "Scores"
        EnhancedPath = "app/(platform)/scores/page-enhanced.tsx"
        TargetPath = "app/(platform)/scores/page.tsx"
    },
    @{
        Name = "Users"
        EnhancedPath = "app/(platform)/users/page-enhanced.tsx"
        TargetPath = "app/(platform)/users/page.tsx"
    }
)

Write-Host "📋 Deployment Plan:" -ForegroundColor Yellow
$Pages | ForEach-Object { Write-Host "   • $_:Name" }
Write-Host ""

if ($Backup) {
    Write-Host "🔄 Creating backup directory..." -ForegroundColor Yellow
    $BackupPath = Join-Path $FrontendPath "_page_backups_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "   Backup location: $BackupPath" -ForegroundColor Gray
    Write-Host ""
}

# Deploy pages
$SuccessCount = 0
$FailureCount = 0

Write-Host "📝 Deploying enhanced pages..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow

foreach ($Page in $Pages) {
    $EnhancedFullPath = Join-Path $FrontendPath $Page.EnhancedPath
    $TargetFullPath = Join-Path $FrontendPath $Page.TargetPath
    
    if (-not (Test-Path $EnhancedFullPath)) {
        Write-Host "❌ $($Page.Name): Enhanced file not found" -ForegroundColor Red
        Write-Host "   Expected at: $EnhancedFullPath" -ForegroundColor Gray
        $FailureCount++
        continue
    }
    
    try {
        # Create backup
        if ($Backup -and (Test-Path $TargetFullPath)) {
            Copy-Item $TargetFullPath (Join-Path $BackupPath "$($Page.Name)_original.tsx") -Force
        }
        
        # Deploy enhanced version
        Copy-Item $EnhancedFullPath $TargetFullPath -Force
        
        Write-Host "✅ $($Page.Name): Deployed successfully" -ForegroundColor Green
        $SuccessCount++
    }
    catch {
        Write-Host "❌ $($Page.Name): Deployment failed - $_" -ForegroundColor Red
        $FailureCount++
    }
}

Write-Host ""
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ Successful: $SuccessCount" -ForegroundColor Green
Write-Host "❌ Failed: $FailureCount" -ForegroundColor Red
Write-Host "📦 Total: $($Pages.Count)" -ForegroundColor Yellow
Write-Host ""

# Verify button component
Write-Host "🔍 Verifying enhanced button component..." -ForegroundColor Yellow
$ButtonPath = Join-Path $FrontendPath "components/ui/button-enhanced.tsx"
if (Test-Path $ButtonPath) {
    Write-Host "✅ Enhanced button component found" -ForegroundColor Green
    
    # Check for key features
    $ButtonContent = Get-Content $ButtonPath -Raw
    if ($ButtonContent -match 'duration-150') {
        Write-Host "   ✓ 150ms animation timing verified" -ForegroundColor Gray
    }
    if ($ButtonContent -match 'scale-95') {
        Write-Host "   ✓ Active state feedback verified" -ForegroundColor Gray
    }
    if ($ButtonContent -match 'loading.*spinner') {
        Write-Host "   ✓ Loading state verified" -ForegroundColor Gray
    }
}
else {
    Write-Host "⚠️  Enhanced button component not found" -ForegroundColor Yellow
    Write-Host "   Location: $ButtonPath" -ForegroundColor Gray
}

Write-Host ""

# Summary
if ($SuccessCount -eq $Pages.Count) {
    Write-Host "✨ All pages deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Navigate to: $FrontendPath" -ForegroundColor Gray
    Write-Host "   2. Run: npm run dev" -ForegroundColor Gray
    Write-Host "   3. Open: http://localhost:3001" -ForegroundColor Gray
    Write-Host "   4. Test enhanced pages with improved animations!" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $NoRestart) {
        Write-Host "🔄 Restart frontend development server? (Y/n): " -ForegroundColor Yellow -NoNewline
        $Response = Read-Host
        
        if ($Response -ne 'n' -and $Response -ne 'N') {
            Write-Host ""
            Write-Host "Restarting frontend server..." -ForegroundColor Cyan
            Set-Location $FrontendPath
            npm run dev
        }
    }
}
else {
    Write-Host "⚠️  Some pages failed to deploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   • Check if enhanced files exist in app/(platform)/*/" -ForegroundColor Gray
    Write-Host "   • Ensure file names match exactly" -ForegroundColor Gray
    Write-Host "   • Verify write permissions in frontend directory" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""
Write-Host "📖 For detailed documentation, see: FRONTEND_ENHANCEMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
