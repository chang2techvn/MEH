# Test Practice Challenges Script

## 📖 Mô tả
Script này tạo 15 practice challenges với transcript thực tế từ Gemini AI để test hệ thống.

## 🎯 Chức năng
- Tạo **15 practice challenges** (5 ngày × 3 độ khó)
- Mỗi challenge có **transcript 10 giây thực tế** từ Gemini AI
- Sử dụng **API key rotation system** từ `lib/api-key-manager.ts`
- Lưu vào bảng `challenges` với `challenge_type: 'practice'`

## 📊 Cấu trúc dữ liệu tạo ra
```
Day 1 (hôm nay):      beginner + intermediate + advanced  
Day 2 (hôm qua):      beginner + intermediate + advanced
Day 3 (2 ngày trước): beginner + intermediate + advanced
Day 4 (3 ngày trước): beginner + intermediate + advanced  
Day 5 (4 ngày trước): beginner + intermediate + advanced
─────────────────────────────────────────────────────────
Tổng cộng: 15 challenges
```

## 🚀 Cách chạy

### 1. Cài đặt dependencies
```bash
npm install @google/generative-ai @supabase/supabase-js dotenv
```

### 2. Kiểm tra file .env.local
Đảm bảo có các biến môi trường:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_ENCRYPTION_KEY=your_encryption_key
```

### 3. Kiểm tra API keys trong Supabase
```bash
# Kiểm tra API keys có sẵn
node scripts/test-api-keys.js
```

### 4. Chạy script tạo practice challenges
```bash
node scripts/test-practice-challenges.js
```

## 📝 Output mẫu
```
🧪 Testing Practice Challenges Creation
========================================
🎯 Goal: Create 15 practice challenges (5 days x 3 difficulties)
📊 Each challenge will have a real 10-second transcript via Gemini AI

🚀 Starting practice challenges creation...

📅 Day 1: Creating challenges for 2025-07-19
---------------------------------------------------
📝 Creating challenge 1.1: The Power of Vulnerability (beginner)
   🔄 Transcript extraction attempt 1/3
   🔑 Using API key: gemini-key-1
   🤖 Requesting 10-second transcript from Gemini...
   📊 API key usage incremented
   ✅ Transcript extracted: Welcome everyone. I'm here to talk about something that...
   ✅ Challenge created successfully: uuid-1234

📝 Creating challenge 1.2: How to Speak so People Want to Listen (intermediate)
   🔄 Transcript extraction attempt 1/3
   🔑 Using API key: gemini-key-1
   🤖 Requesting 10-second transcript from Gemini...
   📊 API key usage incremented
   ✅ Transcript extracted: The human voice is the instrument we all play. It's the...
   ✅ Challenge created successfully: uuid-5678

... (continues for all 15 challenges)

🏁 Test Completed!
==================
✅ Successfully created: 15/15 challenges
❌ Errors: 0
⏱️  Total time: 45s

📊 Created Challenges Summary:
   1. The Power of Vulnerability (beginner)
      Date: 2025-07-19, ID: uuid-1234
   2. How to Speak so People Want to Listen (intermediate)  
      Date: 2025-07-19, ID: uuid-5678
   ... (15 total)

🔍 Verifying in database...
✅ Found 15 practice challenges in database

📅 Challenges by date:
   2025-07-19: 3 challenges
      • beginner: The Power of Vulnerability...
      • intermediate: How to Speak so People Want to Listen...
      • advanced: The Art of Conversation...
   2025-07-18: 3 challenges
      • beginner: Effective Communication Skills...
      • intermediate: Body Language Basics...
      • advanced: Public Speaking Tips...
   ... (5 dates total)

🎉 Test script completed!
✅ Script finished successfully
```

## 🔧 Tính năng

### ✅ **API Key Management**
- Tự động rotation khi API key hết quota
- Increment usage counter
- Mark inactive keys khi lỗi

### ✅ **Error Handling**  
- Retry mechanism (3 lần mỗi challenge)
- Graceful handling khi API key fail
- Continue khi 1 challenge fail

### ✅ **Database Integration**
- Insert vào bảng `challenges` 
- Verification sau khi tạo
- Group by date để kiểm tra

### ✅ **Real Transcript Extraction**
- Sử dụng Gemini AI thực tế
- Extract đúng 10 giây như yêu cầu
- Handle multiple video formats

## 🎥 Video IDs được sử dụng
Script sử dụng 15 video TED Talks và educational content thực tế:
- TED Talks về communication
- English learning videos  
- Business presentation videos
- Public speaking tutorials

## ⚠️ Lưu ý
- Script tạo delay 2s giữa các request để tránh rate limit
- Kiểm tra API keys trước khi chạy
- Backup database trước khi test (nếu cần)
- Script sẽ skip nếu challenge đã tồn tại với cùng date + difficulty

## 🔍 Troubleshooting

### Lỗi "No active API key found"
```bash
# Kiểm tra API keys
node scripts/test-api-keys.js

# Thêm API key mới nếu cần
```

### Lỗi database connection
```bash
# Kiểm tra .env.local
# Verify Supabase credentials
```

### Lỗi transcript extraction
```bash
# Thường do video private/restricted
# Script sẽ tự động retry với API key khác
```
