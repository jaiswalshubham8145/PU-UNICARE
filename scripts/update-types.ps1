
# Script to automate Supabase type generation and fixing
# Usage: powershell ./scripts/update-types.ps1

Write-Host "🔄 Starting Type Generation..." -ForegroundColor Cyan

# 1. Get Project ID from config
$ConfigFile = "supabase/config.toml"
if (Test-Path $ConfigFile) {
    $ConfigContent = Get-Content $ConfigFile
    if ($ConfigContent -match 'project_id\s*=\s*"([^"]+)"') {
        $ProjectID = $matches[1]
        Write-Host "✅ Found Project ID: $ProjectID" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Could not find project_id in config.toml" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ Config file not found: $ConfigFile" -ForegroundColor Red
    exit 1
}

# 2. Generate Types
Write-Host "⏳ Generating types from Supabase..." -ForegroundColor Yellow
$CmdOutput = npx supabase gen types typescript --linked
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Generation failed! Trying project-id fallback..." -ForegroundColor Yellow
    $CmdOutput = npx supabase gen types typescript --project-id $ProjectID
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Generation failed completely!" -ForegroundColor Red
        exit 1
    }
}

# 3. Save and Fix Encoding (UTF-16 -> UTF-8)
$TargetFile = "src/integrations/supabase/types.ts"
$CmdOutput | Out-File -FilePath $TargetFile -Encoding utf8

Write-Host "✅ Types saved to $TargetFile" -ForegroundColor Green

# 4. Verify File Content
if (Select-String -Path $TargetFile -Pattern "notifications" -Quiet) {
    Write-Host "✅ Validation Passed: 'notifications' table found in types." -ForegroundColor Green
}
else {
    Write-Host "⚠️ Warning: 'notifications' table NOT found. Check your database migration." -ForegroundColor Yellow
}

Write-Host "✨ Type sync complete!" -ForegroundColor Cyan
