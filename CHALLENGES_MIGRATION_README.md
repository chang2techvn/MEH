# Challenges Table Unification - Migration Guide

## 📝 Tóm tắt thay đổi

Dự án đã được tối ưu hóa bằng cách gộp 3 bảng riêng biệt thành 1 bảng thống nhất:

### ❌ Trước đây (3 bảng riêng biệt):
- `daily_videos` - Video hàng ngày cho "Your Current Challenge"  
- `daily_challenges` - Video challenges cho "Practice Challenges"
- `user_challenges` - User tự tạo challenges

### ✅ Bây giờ (1 bảng thống nhất):
- `challenges` - Tất cả loại challenges với `challenge_type`:
  - `'daily'` - Video hàng ngày 
  - `'practice'` - Practice challenges
  - `'user_generated'` - User tạo challenges

## 🗂️ Files đã được cập nhật

### Backend Actions
- ✅ `app/actions/youtube-video.ts` - API thống nhất cho tất cả loại challenges
- ✅ `app/actions/content-comparison.ts` - Sử dụng bảng `challenges` thay vì 3 bảng riêng
- ✅ `lib/database.types.ts` - Schema mới cho bảng `challenges`

### Frontend Components  
- ✅ `components/challenge/create-challenge-modal.tsx` - Sử dụng API mới

### Database Migration
- ✅ `supabase/migrations/20250719000001_unify_challenges_table.sql` - Migration script

## 🚀 API mới được tối ưu

### `createChallenge()` - Tạo challenges cho tất cả loại
```typescript
// Daily challenge (1 video/ngày cho "Your Current Challenge")
const dailyChallenge = await createChallenge('daily', {
  difficulty: 'intermediate',
  minDuration: 180,
  maxDuration: 600
})

// Practice challenges (nhiều video cho "Practice Challenges") 
const practicesChallenges = await createChallenge('practice', {
  count: 5,
  difficulty: 'intermediate',
  minDuration: 120,
  maxDuration: 480
})

// User-generated challenge
const userChallenge = await createChallenge('user_generated', {
  videoUrl: 'https://youtube.com/watch?v=...',
  userId: 'user-uuid',
  difficulty: 'advanced'
})
```

### `getChallenges()` - Lấy challenges theo loại
```typescript
// Lấy daily challenge hôm nay
const dailyChallenge = await getChallenges('daily')

// Lấy practice challenges hôm nay  
const practicesChallenges = await getChallenges('practice')

// Lấy challenges của user
const userChallenges = await getChallenges('user_generated', {
  userId: 'user-uuid'
})
```

## 📊 Schema bảng `challenges` mới

```sql
CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  embed_url text,
  duration integer,
  topics text[],
  transcript text,
  challenge_type text NOT NULL DEFAULT 'daily', -- 'daily'|'practice'|'user_generated'
  difficulty text NOT NULL DEFAULT 'intermediate', -- 'beginner'|'intermediate'|'advanced'  
  points integer NOT NULL DEFAULT 10,
  user_id uuid REFERENCES auth.users(id),
  batch_id text,
  is_active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

## 🎯 Lợi ích của việc tối ưu

1. **Code đơn giản hơn** - 1 API thay vì 3 APIs riêng biệt
2. **Dễ maintain** - 1 bảng thay vì 3 bảng  
3. **Performance tốt hơn** - Indexes được tối ưu
4. **Tính nhất quán** - Schema thống nhất
5. **Mở rộng dễ dàng** - Thêm loại challenge mới chỉ cần thêm `challenge_type`

## 🔧 Cách chạy migration

1. Chạy migration file:
```bash
npx supabase db push
```

2. Migration sẽ tự động:
   - Tạo bảng `challenges` mới
   - Copy dữ liệu từ 3 bảng cũ
   - Tạo indexes, triggers, RLS policies
   - Giữ nguyên dữ liệu cũ (an toàn)

3. Sau khi verify migration thành công, có thể xóa bảng cũ:
```sql
DROP TABLE IF EXISTS daily_videos CASCADE;
DROP TABLE IF EXISTS daily_challenges CASCADE; 
DROP TABLE IF EXISTS user_challenges CASCADE;
```

## ⚠️ Lưu ý quan trọng

- Migration hoàn toàn **backward compatible** - không mất dữ liệu
- Các bảng cũ vẫn được giữ lại cho đến khi verify thành công
- Frontend component sẽ tự động sử dụng API mới
- Tất cả chức năng cũ vẫn hoạt động bình thường
