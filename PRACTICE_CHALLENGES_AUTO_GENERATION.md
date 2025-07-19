# Practice Challenges - Auto-Generation System

## 📋 Mô tả hệ thống mới

### 🎯 **Mục tiêu:**
- Mỗi ngày tự động tạo **3 video practice challenges** (1 beginner + 1 intermediate + 1 advanced)
- Frontend hiển thị **15 video practice mới nhất** (từ 5 ngày gần nhất)
- Cron job chạy **23:59 hàng ngày** tự động tạo video mới
- User không cần đợi, luôn có sẵn 15 videos để practice

## 🔄 **Cách hoạt động:**

### 1. **Auto-Generation (23:59 daily)**
```typescript
// Cron job tại: app/api/cron/daily-video-refresh/route.ts
// Chạy lúc 23:59 mỗi ngày

const difficulties = ['beginner', 'intermediate', 'advanced']

for (const difficulty of difficulties) {
  await createChallenge('practice', {
    difficulty: difficulty,
    minDuration: 120,  // 2 phút
    maxDuration: 480,  // 8 phút  
    preferredTopics: getTopicsForDifficulty(difficulty)
  })
}
```

### 2. **Frontend Display (15 videos)**
```typescript
// Component: components/challenge/challenge-tabs.tsx
// Lấy 15 video practice mới nhất (5 ngày × 3 videos)

const practiceData = await getChallenges('practice', { 
  limit: 15  // 15 videos mới nhất
})

// Kết quả: Video từ 5 ngày gần nhất, sắp xếp theo:
// - Date: Mới nhất trước (descending)  
// - Difficulty: beginner → intermediate → advanced
```

### 3. **Logic tạo video theo difficulty**
```typescript
// app/actions/youtube-video.ts - createChallenge('practice')

// Kiểm tra video đã tồn tại cho ngày hôm nay chưa
const existing = await supabase
  .from('challenges')  
  .eq('challenge_type', 'practice')
  .eq('difficulty', difficulty)
  .eq('date', today)

// Nếu chưa có → tạo mới
// Nếu đã có → skip
```

## 📊 **Database Schema:**

```sql
-- Bảng challenges thống nhất
challenges (
  id uuid PRIMARY KEY,
  title text NOT NULL,
  video_url text NOT NULL,
  challenge_type text NOT NULL, -- 'daily' | 'practice' | 'user_generated'
  difficulty text NOT NULL,     -- 'beginner' | 'intermediate' | 'advanced' 
  batch_id text,               -- 'practice_2025-07-19_beginner'
  date date NOT NULL,          -- Ngày tạo challenge
  is_active boolean DEFAULT true,
  featured boolean DEFAULT false,
  ...
)
```

## 🎨 **Frontend Experience:**

### **Practice Challenges Tab:**
- ✅ Hiển thị ngay **15 videos** có sẵn
- ✅ Không cần loading/waiting  
- ✅ Video từ **5 ngày gần nhất**
- ✅ Mix cả 3 difficulty levels
- ✅ Tự động refresh mỗi ngày với video mới

### **Cấu trúc hiển thị:**
```
📚 Practice Challenges (15 videos)

🔴 Today (July 19, 2025) - 3 videos
  • [Beginner] Basic English Conversation
  • [Intermediate] Business English Meeting  
  • [Advanced] Academic Presentation Skills

🟡 Yesterday (July 18, 2025) - 3 videos  
  • [Beginner] Daily English Phrases
  • [Intermediate] English Idioms Explained
  • [Advanced] Professional Communication

🟡 July 17, 2025 - 3 videos
  • [Beginner] English Pronunciation Guide
  • [Intermediate] Travel English Conversation
  • [Advanced] English Debate Techniques

... (và 2 ngày nữa = 15 videos total)
```

## 🤖 **Cron Job Details:**

### **Thời gian chạy:** 23:59 hàng ngày
### **Endpoint:** `POST /api/cron/daily-video-refresh`
### **Security:** Bearer token authentication

### **Response format:**
```json
{
  "success": true,
  "date": "2025-07-19", 
  "duration": "45.2s",
  "dailyChallenge": {
    "id": "...",
    "title": "TED Talk: Effective Communication",
    "difficulty": "intermediate"
  },
  "practiceChallenges": {
    "count": 3,
    "challenges": [
      {"difficulty": "beginner", "title": "..."},
      {"difficulty": "intermediate", "title": "..."},
      {"difficulty": "advanced", "title": "..."}
    ]
  },
  "errors": []
}
```

## 🔧 **Technical Implementation:**

### **1. Difficulty-based Topics:**
```typescript
function getTopicsForDifficulty(difficulty) {
  switch (difficulty) {
    case 'beginner': 
      return ['basic english vocabulary', 'simple conversation', ...]
    case 'intermediate':
      return ['business english', 'idioms', 'presentations', ...]  
    case 'advanced':
      return ['academic writing', 'debate techniques', ...]
  }
}
```

### **2. Batch ID System:**
```typescript
// Mỗi video có batch_id unique theo ngày và difficulty
batch_id: `practice_${today}_${difficulty}`

// Ví dụ:
// - practice_2025-07-19_beginner
// - practice_2025-07-19_intermediate  
// - practice_2025-07-19_advanced
```

### **3. Error Handling:**
- ✅ Rate limiting giữa các request (2s delay)
- ✅ Continue với difficulty khác nếu 1 difficulty fail
- ✅ Log chi tiết để debug
- ✅ Retry mechanism cho API calls

## 🎯 **Benefits:**

1. **User Experience:**
   - ✅ Luôn có sẵn 15 videos để luyện tập
   - ✅ Không cần chờ đợi video mới
   - ✅ Đa dạng cấp độ khó

2. **System Performance:**  
   - ✅ Generate videos trong background
   - ✅ Frontend load nhanh
   - ✅ Không block user interaction

3. **Content Quality:**
   - ✅ Video phù hợp từng difficulty level
   - ✅ Topics được chọn lọc kỹ càng
   - ✅ Đảm bảo có transcript chất lượng

4. **Scalability:**
   - ✅ Easy to adjust số lượng video per day
   - ✅ Easy to add thêm difficulty levels
   - ✅ Unified database schema
