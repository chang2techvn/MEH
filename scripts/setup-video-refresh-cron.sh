#!/bin/bash

# Script to set up cron job for daily video refresh at 23:59
# This should be run once during deployment

echo "Setting up daily video refresh cron job..."

# Create the cron job entry
CRON_SECRET=$(grep CRON_SECRET .env | cut -d '=' -f2)
if [ -z "$CRON_SECRET" ]; then
    echo "Error: CRON_SECRET not found in .env file"
    exit 1
fi

# Get the domain from environment or use localhost for development
DOMAIN=${DOMAIN:-"http://localhost:3000"}

# Create cron job command
CRON_COMMAND="59 23 * * * curl -X POST $DOMAIN/api/cron/daily-video-refresh -H \"Authorization: Bearer $CRON_SECRET\" -H \"Content-Type: application/json\" >> /var/log/daily-video-refresh.log 2>&1"

# Add to crontab
echo "Adding cron job: $CRON_COMMAND"
(crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -

# Verify cron job was added
echo "Current cron jobs:"
crontab -l

echo "✅ Daily video refresh cron job set up successfully!"
echo "   - Runs every day at 23:59 (11:59 PM)"
echo "   - Automatically refreshes Today's Challenge video"
echo "   - Logs output to /var/log/daily-video-refresh.log"
