@echo off
echo Setting up Daily Video Refresh for Windows...
echo =================================================

:: Check if running as Administrator
net file 1>nul 2>nul && (
    echo Running as Administrator - Good!
) || (
    echo Error: This script requires Administrator privileges
    echo Please right-click and select "Run as administrator"
    pause
    exit /b 1
)

:: Create the scheduled task using schtasks command
schtasks /create /tn "DailyVideoRefresh" /tr "curl -X POST http://localhost:3000/api/cron/daily-video-refresh -H \"Authorization: Bearer %CRON_SECRET%\" -H \"Content-Type: application/json\"" /sc daily /st 23:59 /ru SYSTEM /f

if %errorlevel% equ 0 (
    echo.
    echo SUCCESS: Windows Scheduled Task created!
    echo.
    echo Task Details:
    echo    - Task Name: DailyVideoRefresh
    echo    - Schedule: Daily at 23:59 ^(11:59 PM^)
    echo    - Action: Refresh Today's Challenge video
    echo    - Runs as: SYSTEM ^(background service^)
    echo.
    
    echo Verifying task creation...
    schtasks /query /tn "DailyVideoRefresh"
    
    echo.
    echo Management Commands:
    echo    View task:   schtasks /query /tn "DailyVideoRefresh"
    echo    Run now:     schtasks /run /tn "DailyVideoRefresh"
    echo    Delete task: schtasks /delete /tn "DailyVideoRefresh" /f
    echo.
) else (
    echo.
    echo ERROR: Failed to create scheduled task
    echo Please make sure you are running as Administrator
    echo.
)

echo Video Refresh Schedule:
echo    - Automatic: Every day at 23:59 ^(11:59 PM^)
echo    - Duration: Video stays same for 24 hours
echo    - Scope: All users see the same video
echo.
echo Setup completed!
pause
