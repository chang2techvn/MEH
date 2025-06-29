# Chat Realtime Testing Scripts

This directory contains scripts to test the chat realtime functionality of the English Learning Platform.

## Scripts

### 1. `test-chat-realtime.js`
**Main testing script for chat realtime functionality**

#### Features:
- ✅ Tests authentication with multiple accounts
- ✅ Creates test conversations between users
- ✅ Sets up realtime subscriptions for all participants
- ✅ Sends test messages and verifies realtime delivery
- ✅ Provides detailed analysis and recommendations
- ✅ Handles cleanup and graceful shutdown

#### Usage:
```bash
# Make sure you're in the project root
cd /path/to/english-learning-platform

# Run the test
node scripts/test-chat-realtime.js
```

#### Prerequisites:
1. **Environment Variables**: Make sure your `.env.local` contains:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. **Test Accounts**: The script uses these predefined accounts:
   - `teacher1@university.edu` (password: `teacher123456`)
   - `student1@university.edu` (password: `student123456`)
   - `student2@university.edu` (password: `student123456`)

3. **Dependencies**: Install required packages:
   ```bash
   npm install @supabase/supabase-js
   ```

#### Test Flow:
1. **Pre-flight Checks**:
   - Database connectivity test
   - Realtime connection test

2. **Main Test**:
   - Authenticate all test users
   - Create conversations between users
   - Set up realtime listeners for each user
   - Send test messages
   - Verify realtime message delivery

3. **Results Analysis**:
   - Calculate success rate
   - Provide detailed message delivery report
   - Give recommendations for improvements

#### Expected Output:
```
🧪 Chat Realtime Test Suite
==================================================
[2025-06-29T...] 🔍 Running pre-flight checks...
[2025-06-29T...] ✅ Database connection successful
[2025-06-29T...] ✅ Realtime connection successful
[2025-06-29T...] 🚀 Starting Chat Realtime Test...
[2025-06-29T...] 📝 Step 1: Authenticating test users...
[2025-06-29T...] ✅ Authenticated user: teacher1@university.edu
[2025-06-29T...] ✅ Authenticated user: student1@university.edu
[2025-06-29T...] ✅ Authenticated user: student2@university.edu
[2025-06-29T...] 📝 Step 2: Creating test conversations...
[2025-06-29T...] ✅ Created conversation: uuid-1
[2025-06-29T...] ✅ Created conversation: uuid-2
[2025-06-29T...] 📝 Step 3: Setting up realtime listeners...
[2025-06-29T...] ✅ Realtime subscription active for teacher1@university.edu
[2025-06-29T...] ✅ Realtime subscription active for student1@university.edu
[2025-06-29T...] ✅ Realtime subscription active for student2@university.edu
[2025-06-29T...] 📝 Step 4: Sending test messages...
[2025-06-29T...] ✅ Message sent: "[TEST] Hello Student 1! ..." to conversation uuid-1
[2025-06-29T...] 📨 student1@university.edu received realtime message: "[TEST] Hello Student 1! ..."
[2025-06-29T...] ✅ Message sent: "[TEST] Hello Teacher! ..." to conversation uuid-1
[2025-06-29T...] 📨 teacher1@university.edu received realtime message: "[TEST] Hello Teacher! ..."
[2025-06-29T...] 📝 Step 5: Analyzing test results...
==================================================
📈 Messages sent: 4
📨 Messages received via realtime: 4
🎯 Success rate: 100.0%
[2025-06-29T...] ✅ All realtime messages received successfully!

📝 Detailed Results:
  1. student1@university.edu received: "[TEST] Hello Student 1! ..."
  2. teacher1@university.edu received: "[TEST] Hello Teacher! ..."
  3. student2@university.edu received: "[TEST] Hey Student 2! ..."
  4. student1@university.edu received: "[TEST] Hi there! ..."

🔍 Recommendations:
  ✅ Chat realtime system is working perfectly!
  ✅ All users can send and receive messages in real-time
  ✅ No message delivery issues detected

[2025-06-29T...] 📝 Cleaning up connections...
[2025-06-29T...] ✅ Cleanup completed
```

#### Troubleshooting:

**If test fails with authentication errors:**
- Check if test accounts exist in your database
- Verify email/password combinations
- Ensure accounts are not disabled

**If realtime messages are not received:**
- Check Supabase Realtime configuration
- Verify database RLS policies allow message reading
- Check network connectivity
- Review browser console for WebSocket errors

**If database connectivity fails:**
- Verify Supabase URL and anon key
- Check Supabase project status
- Ensure your IP is not blocked

#### Integration with CI/CD:
This script can be integrated into your CI/CD pipeline:

```yaml
# Example GitHub Actions step
- name: Test Chat Realtime
  run: |
    node scripts/test-chat-realtime.js
  env:
    NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
    NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## Additional Notes

- The script automatically cleans up after itself
- It handles graceful shutdown on Ctrl+C
- All test data is temporary and gets cleaned up
- The script is safe to run multiple times
- It provides detailed logging for debugging

For any issues or improvements, please check the main chat context implementation in `contexts/chat-context-realtime.tsx`.
