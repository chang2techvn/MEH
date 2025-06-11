#!/bin/bash

# Test script for daily video refresh system
# This script tests the automatic video refresh functionality

echo "🧪 Testing Daily Video Refresh System"
echo "======================================="

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

if [ -z "$CRON_SECRET" ]; then
    echo "❌ Error: CRON_SECRET not found in .env file"
    exit 1
fi

# Test endpoint
ENDPOINT="http://localhost:3000/api/cron/daily-video-refresh"

echo "🔍 Testing video refresh endpoint..."
echo "Endpoint: $ENDPOINT"
echo ""

# Make the API call
echo "📡 Making API request..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ENDPOINT" \
    -H "Authorization: Bearer $CRON_SECRET" \
    -H "Content-Type: application/json")

# Extract response body and status code
HTTP_BODY=$(echo "$RESPONSE" | head -n -1)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)

echo "HTTP Status Code: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS: Video refresh endpoint working correctly"
    echo ""
    echo "📄 Response:"
    echo "$HTTP_BODY" | python3 -m json.tool 2>/dev/null || echo "$HTTP_BODY"
    echo ""
    
    # Extract video information if available
    VIDEO_ID=$(echo "$HTTP_BODY" | grep -o '"videoId":"[^"]*"' | cut -d'"' -f4)
    VIDEO_TITLE=$(echo "$HTTP_BODY" | grep -o '"videoTitle":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$VIDEO_ID" ]; then
        echo "🎥 New Daily Video Set:"
        echo "   ID: $VIDEO_ID"
        echo "   Title: $VIDEO_TITLE"
        echo "   URL: https://youtube.com/watch?v=$VIDEO_ID"
    fi
    
else
    echo "❌ FAILED: Video refresh endpoint returned error"
    echo ""
    echo "📄 Error Response:"
    echo "$HTTP_BODY"
fi

echo ""
echo "🔧 To manually test the homepage video:"
echo "   1. Open http://localhost:3000 in browser"
echo "   2. Check if 'Today's Challenge' shows the new video"
echo "   3. Verify video changes after running this script"

echo ""
echo "⚙️ To set up automatic daily refresh:"
echo "   1. Run: chmod +x scripts/setup-video-refresh-cron.sh"
echo "   2. Run: ./scripts/setup-video-refresh-cron.sh"
echo "   3. Verify with: crontab -l"

echo ""
echo "🎯 Video Refresh Schedule:"
echo "   - Automatic: Every day at 23:59 (11:59 PM)"
echo "   - Duration: Video stays same for 24 hours"
echo "   - Scope: All users see the same video"
echo ""
