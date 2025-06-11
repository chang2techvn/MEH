@echo off
echo Setting up daily video refresh for Windows...
echo =============================================

REM Get CRON_SECRET from .env file
for /f "tokens=2 delims==" %%a in ('findstr "CRON_SECRET" .env') do set CRON_SECRET=%%a

if "%CRON_SECRET%"=="" (
    echo Error: CRON_SECRET not found in .env file
    pause
    exit /b 1
)

REM Set domain - use localhost for development
set DOMAIN=http://localhost:3000

echo Creating Windows Task Scheduler job...
echo.

REM Create the task using schtasks command
schtasks /create /tn "DailyVideoRefresh" /tr "curl -X POST %DOMAIN%/api/cron/daily-video-refresh -H \"Authorization: Bearer %CRON_SECRET%\" -H \"Content-Type: application/json\"" /sc daily /st 23:59 /f

if %errorlevel% equ 0 (
    echo.
    echo ✅ SUCCESS: Windows Task created successfully!
    echo.
    echo Task Details:
    echo   - Task Name: DailyVideoRefresh
    echo   - Schedule: Daily at 23:59 (11:59 PM)
    echo   - Action: Refresh Today's Challenge video
    echo.
    echo To verify the task:
    echo   schtasks /query /tn "DailyVideoRefresh"
    echo.
    echo To run the task manually:
    echo   schtasks /run /tn "DailyVideoRefresh"
    echo.
    echo To delete the task:
    echo   schtasks /delete /tn "DailyVideoRefresh" /f
) else (
    echo.
    echo ❌ ERROR: Failed to create Windows Task
    echo   You may need to run this script as Administrator
    echo.
)

echo.
echo 🎯 Video Refresh Schedule:
echo   - Automatic: Every day at 23:59 (11:59 PM)
echo   - Duration: Video stays same for 24 hours  
echo   - Scope: All users see the same video
echo.

pause
