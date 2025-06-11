# PowerShell script to set up daily video refresh on Windows
# Run as Administrator for best results

Write-Host "🚀 Setting up Daily Video Refresh for Windows..." -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   For best results, run PowerShell as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Get CRON_SECRET from .env file
$envPath = ".\.env"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath
    $cronSecretLine = $envContent | Where-Object { $_ -match "CRON_SECRET=" }
    
    if ($cronSecretLine) {
        $CRON_SECRET = ($cronSecretLine -split "=")[1]
        Write-Host "✅ Found CRON_SECRET in .env file" -ForegroundColor Green
    } else {
        Write-Host "❌ CRON_SECRET not found in .env file" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    exit 1
}

# Set domain - use localhost for development
$DOMAIN = "http://localhost:3000"

# Create the action with proper escaping
$curlArgs = "-X POST $DOMAIN/api/cron/daily-video-refresh -H `"Authorization: Bearer $CRON_SECRET`" -H `"Content-Type: application/json`""
$action = New-ScheduledTaskAction -Execute "curl" -Argument $curlArgs

# Create the trigger (daily at 23:59)
$trigger = New-ScheduledTaskTrigger -Daily -At "23:59"

# Create the task settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Create the principal (run whether user is logged on or not)
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount

try {
    # Register the scheduled task
    Register-ScheduledTask -TaskName "DailyVideoRefresh" -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force
    
    Write-Host ""
    Write-Host "✅ SUCCESS: Windows Scheduled Task created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Task Details:" -ForegroundColor Cyan
    Write-Host "   - Task Name: DailyVideoRefresh"
    Write-Host "   - Schedule: Daily at 23:59 (11:59 PM)"
    Write-Host "   - Action: Refresh Today's Challenge video"
    Write-Host "   - Runs as: SYSTEM (background service)"
    Write-Host ""
    
    # Verify the task was created
    $task = Get-ScheduledTask -TaskName "DailyVideoRefresh" -ErrorAction SilentlyContinue
    if ($task) {
        Write-Host "🔍 Task Status: $($task.State)" -ForegroundColor Blue
        Write-Host "📅 Next Run Time: $($task.NextRunTime)" -ForegroundColor Blue
    }
    
    Write-Host ""
    Write-Host "🛠️  Management Commands:" -ForegroundColor Cyan
    Write-Host "   View task:   Get-ScheduledTask -TaskName 'DailyVideoRefresh'"
    Write-Host "   Run now:     Start-ScheduledTask -TaskName 'DailyVideoRefresh'" 
    Write-Host "   Delete task: Unregister-ScheduledTask -TaskName 'DailyVideoRefresh' -Confirm:`$false"
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Failed to create scheduled task" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Try running PowerShell as Administrator" -ForegroundColor Yellow
}

Write-Host "🎯 Video Refresh Schedule:" -ForegroundColor Magenta
Write-Host "   - Automatic: Every day at 23:59 (11:59 PM)"
Write-Host "   - Duration: Video stays same for 24 hours"
Write-Host "   - Scope: All users see the same video"
Write-Host ""
Write-Host "🚀 Setup completed! The task will run automatically every day at 23:59." -ForegroundColor Green
