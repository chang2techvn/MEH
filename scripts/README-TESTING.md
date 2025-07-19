# Challenge Creation Test Scripts

This directory contains test scripts for debugging and testing the challenge creation functionality in the English Learning Platform.

## Scripts Overview

### 1. `test-practice-challenges.js`
- **Purpose**: Create multiple practice challenges with real transcripts
- **Usage**: Tests the automated creation of practice challenges for different difficulty levels
- **Focus**: Bulk creation of challenges for the practice mode

### 2. `test-user-challenges.js` ⭐ NEW
- **Purpose**: Test user-generated challenge creation with YouTube URLs
- **Usage**: Simulates users creating challenges by providing YouTube URLs
- **Focus**: Tests the complete workflow from URL to challenge creation

### 3. `test-create-challenge-modal.js` ⭐ NEW  
- **Purpose**: Test the exact workflow of the "Create New Challenge" modal
- **Usage**: Reproduces the modal functionality from command line
- **Focus**: Debug the "Creating..." stuck state issue

## How to Run

### Prerequisites
```bash
# Make sure you have the environment variables set
cp .env.example .env.local
# Fill in your Supabase and Gemini AI credentials
```

### Run User Challenge Tests
```bash
# Test user-generated challenges (like users creating from YouTube URLs)
node scripts/test-user-challenges.js
```

### Run Create Challenge Modal Tests
```bash
# Test the exact "Create New Challenge" modal workflow
node scripts/test-create-challenge-modal.js
```

### Run Practice Challenge Tests
```bash
# Test practice challenge creation (bulk creation)
node scripts/test-practice-challenges.js
```

## What Each Script Tests

### `test-user-challenges.js`
✅ **Tests:**
- YouTube URL parsing and video ID extraction
- Video metadata fetching (title, description, duration)
- Gemini AI transcript extraction (first 5 minutes)
- Topic extraction from content
- Database insertion as user-generated challenges
- Multiple users creating challenges

🎯 **Use Case:** When users click "Create" button and paste YouTube URLs

### `test-create-challenge-modal.js`
✅ **Tests:**
- The exact same functions called by the Create Challenge modal
- `extractVideoFromUrl()` function behavior
- `createChallenge()` function behavior
- Error handling and edge cases
- Invalid URLs and error states

🎯 **Use Case:** Debug why Create Challenge modal gets stuck in "Creating..." state

## Expected Output

### Successful Run:
```
🧪 Testing User-Generated Challenges Creation
=============================================
📝 Creating user challenge 1: The Power of Vulnerability
   👤 User: 13df7bf1-d38f-4b58-b444-3dfa67e04f17
   📹 URL: https://www.youtube.com/watch?v=UF8uR6Z6KLc
   🎬 Video ID: UF8uR6Z6KLc
   🔍 Fetching metadata for video: UF8uR6Z6KLc
   ✅ Metadata extracted: "The Power of Vulnerability" (1200s)
   🔄 Transcript extraction attempt 1/3
   🔑 Using API key: gemini-api-key-1
   🤖 Requesting transcript from Gemini for: https://www.youtube.com/watch?v=UF8uR6Z6KLc (first 300s)
   ✅ Transcript extracted successfully: 2340 characters
   💾 Inserting challenge into database...
   ✅ Challenge created successfully!
```

### Error Cases:
- API key issues (403, 429)
- Invalid YouTube URLs
- Video access restrictions
- Gemini AI failures
- Database errors

## Troubleshooting

### "Creating..." Stuck State
If the Create Challenge modal gets stuck:

1. Run `test-create-challenge-modal.js` to see exact error
2. Check browser console during modal usage
3. Verify API keys are active in database
4. Check network connectivity

### API Key Issues
```bash
# Check API key status
node scripts/api-key-manager.js status

# Reset inactive keys
node scripts/api-key-manager.js reset
```

### Database Issues
- Verify Supabase connection
- Check user authentication
- Verify table permissions

## Integration with Modal

The test scripts use the **exact same functions** as the Create Challenge modal:

- `extractVideoFromUrl()` - Same function called by modal
- `createChallenge()` - Same function called by modal
- Same error handling paths
- Same database operations

This means if the test scripts work, the modal should work too!

## Files Modified

These test scripts helped identify and fix issues in:
- `app/actions/youtube-video.ts` - Enhanced error logging
- `components/challenge/create-challenge-modal.tsx` - Better error handling
- `hooks/use-*` - Various performance improvements

## Next Steps

1. **Run the modal test**: `node scripts/test-create-challenge-modal.js`
2. **Check browser console** during actual modal usage
3. **Compare results** between test script and modal behavior
4. **Fix any differences** in error handling or API calls
