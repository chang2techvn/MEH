# Daily Video Refresh System

## Overview
The Daily Video Refresh system ensures that the "Today's Challenge" video on the homepage automatically updates with a new YouTube video every day at exactly 23:59 (11:59 PM).

## Key Features

### 🕚 **Automatic Daily Refresh**
- **Refresh Time**: Every day at 23:59 (11:59 PM)
- **Consistency**: Same video displayed for all users throughout the day
- **Auto-Selection**: Randomly selects educational YouTube videos
- **Fallback System**: Uses predefined videos if YouTube fetching fails

### 🎯 **Video Selection Criteria**
- **Duration**: 2-30 minutes
- **Topics**: English learning, education, TED talks, communication, business, technology
- **Quality**: Educational content suitable for English learners
- **Language**: English-speaking videos with clear audio

### 🔄 **Caching System**
- **Daily Cache**: Video is cached for 24 hours
- **Consistent Display**: Same video shown to all users during the day
- **Memory Efficient**: Cache automatically expires and refreshes

## System Architecture

### API Endpoints

#### `/api/cron/daily-video-refresh`
- **Purpose**: Daily video refresh trigger
- **Method**: POST
- **Auth**: Bearer token with CRON_SECRET
- **Schedule**: 23:59 daily via cron job
- **Actions**:
  1. Clear any admin-selected video
  2. Fetch new random educational video
  3. Set as daily video for all users
  4. Cache for 24 hours

### Cron Job Configuration
```bash
# Runs every day at 23:59 (11:59 PM)
59 23 * * * curl -X POST https://your-domain.com/api/cron/daily-video-refresh -H "Authorization: Bearer $CRON_SECRET"
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env` file:
```env
CRON_SECRET=your_secure_random_string_for_video_refresh
```

### 2. Deploy Cron Job
Run the setup script:
```bash
chmod +x scripts/setup-video-refresh-cron.sh
./scripts/setup-video-refresh-cron.sh
```

### 3. Manual Testing
Test the refresh endpoint:
```bash
curl -X POST http://localhost:3000/api/cron/daily-video-refresh \
  -H "Authorization: Bearer your_cron_secret" \
  -H "Content-Type: application/json"
```

## Video Selection Logic

### Primary Selection
1. **Random Topic**: Selects from predefined educational topics
2. **YouTube Search**: Searches for videos matching criteria
3. **Duration Filter**: 2-30 minutes for optimal engagement
4. **Quality Check**: Ensures video has proper metadata

### Fallback Videos
If YouTube fetching fails, uses predefined educational videos:
- English communication skills
- Grammar and pronunciation
- Business English
- Learning strategies

## Monitoring and Logs

### Cron Job Logs
```bash
# View daily refresh logs
tail -f /var/log/daily-video-refresh.log

# Check cron job status
systemctl status cron
```

### API Response Format
```json
{
  "success": true,
  "message": "Daily video refreshed successfully at 23:59",
  "data": {
    "videoId": "abc123",
    "videoTitle": "English Communication Skills",
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "date": "2025-06-11",
    "refreshTime": "2025-06-11T23:59:00.000Z",
    "executionTimeMs": 1250
  }
}
```

## Admin Override System

### Manual Video Selection
- Admins can manually select videos through `/admin/video-settings`
- Manual selection overrides automatic daily refresh
- Admin-selected videos persist until manually cleared or next automatic refresh

### Reset to Automatic
- Clear admin selection to resume automatic daily refresh
- Next refresh at 23:59 will select new random video

## User Experience

### Today's Challenge Display
- **Homepage**: Featured video in "Today's Challenge" section
- **Consistency**: Same video for all users throughout the day
- **Fresh Content**: New video every day at midnight
- **Seamless Transition**: No disruption to ongoing user sessions

### Video Requirements
- **Watch Time**: Users must watch minimum duration (configurable)
- **Engagement**: Video suitable for English learning activities
- **Quality**: Clear audio and educational value

## Troubleshooting

### Common Issues

**Video not refreshing**
- Check cron job is running: `crontab -l`
- Verify CRON_SECRET is correct
- Check API endpoint logs
- Ensure network connectivity for YouTube access

**Same video appearing**
- Check if admin has manually selected a video
- Verify cron job is executing at 23:59
- Check video cache expiration logic

**Fallback videos showing**
- YouTube API may be rate limited
- Network issues preventing video fetch
- All fallback videos are safe educational content

### Debug Commands
```bash
# Test video refresh manually
curl -X POST localhost:3000/api/cron/daily-video-refresh \
  -H "Authorization: Bearer $CRON_SECRET"

# Check current video cache
# (View in browser developer tools or admin panel)

# Reset video cache (development only)
# Call resetCachedVideo() function
```

## Future Enhancements

1. **User Preferences**: Personalized video topics based on user interests
2. **Difficulty Levels**: Videos matched to user's English proficiency
3. **Regional Content**: Location-based video selection
4. **Analytics**: Track video engagement and completion rates
5. **A/B Testing**: Test different video types for optimal engagement
