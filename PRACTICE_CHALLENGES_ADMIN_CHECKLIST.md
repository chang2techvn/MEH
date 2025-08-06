# Practice Challenges Admin - Implementation Checklist

## 📋 Mục tiêu
Sửa lại route "/admin/challenges" để quản lý Practice Challenges hiển thị ở route "/" một cách tối ưu, tái sử dụng và đơn giản.

## 🎯 Yêu cầu chính
- Quản lý 15 practice challenges hiển thị ở route "/"
- Tùy chỉnh số lượng challenges hiển thị
- Chọn challenges theo mode: manual/random/latest/featured
- Điều khiển auto-generation (3 challenges/ngày)
- Cấu hình difficulty distribution và scheduling

## 🔍 Phân tích hiện trạng
- ✅ `/admin/challenges` đã tồn tại với architecture hoàn chỉnh
- ✅ Practice challenges được fetch từ database với `challenge_type = 'practice'`
- ✅ Route `/` hiển thị 15 practice challenges thông qua `challenge-tabs.tsx`
- ✅ Auto-generation system đã implement theo `PRACTICE_CHALLENGES_AUTO_GENERATION.md`
- ✅ Database schema hỗ trợ đầy đủ các field cần thiết

## ✅ Implementation Checklist

### PHASE 1: Database Setup
#### 1.1 Tạo Practice Settings Table
- [ ] Tạo migration file: `supabase/migrations/create_practice_settings.sql`
```sql
CREATE TABLE practice_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_count INTEGER DEFAULT 15,
  selection_mode TEXT DEFAULT 'latest' CHECK (selection_mode IN ('latest', 'random', 'featured', 'manual')),
  auto_generation_enabled BOOLEAN DEFAULT true,
  daily_generation_count INTEGER DEFAULT 3,
  daily_generation_time TIME DEFAULT '23:59:00',
  difficulty_distribution JSONB DEFAULT '{"beginner": 1, "intermediate": 1, "advanced": 1}',
  avoid_recent_days INTEGER DEFAULT 7,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO practice_settings (id) VALUES (gen_random_uuid());

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_practice_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER practice_settings_updated_at_trigger
  BEFORE UPDATE ON practice_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_practice_settings_updated_at();
```

#### 1.2 Run Migration
- [ ] Chạy migration: `supabase db push`
- [ ] Verify table tạo thành công
- [ ] Test default settings được insert

### PHASE 2: API Routes (Tái sử dụng pattern)
#### 2.1 Practice Settings API
- [ ] Tạo file: `app/api/admin/practice-settings/route.ts`
```typescript
// Copy pattern từ app/api/admin/topics/route.ts
// Implement GET và PUT methods
// Validation cho settings values
// Error handling consistent với existing APIs
```

**File structure:**
```
app/api/admin/practice-settings/
└── route.ts (GET, PUT)
```

#### 2.2 Enhanced Challenges API
- [ ] Tạo file: `app/api/admin/challenges/practice/route.ts`
```typescript
// GET: Fetch practice challenges với advanced filtering
// Support pagination, search, sorting
// Apply selection mode logic
// Statistics endpoint
```

### PHASE 3: Backend Actions Extension
#### 3.1 Extend Challenge Actions
- [ ] File: `app/actions/challenge-videos.ts`
- [ ] Add function: `getPracticeSettings()`
- [ ] Add function: `updatePracticeSettings(data)`
- [ ] Add function: `getPracticeChallengesWithSettings()`
- [ ] Extend existing `getChallenges()` để support dynamic limit

#### 3.2 Practice Settings Hook
- [ ] Tạo file: `hooks/use-practice-settings.ts`
```typescript
// State management cho practice settings
// CRUD operations
// Real-time sync với database
// Loading states và error handling
```

### PHASE 4: Admin UI Components
#### 4.1 Main Admin Page Extension
- [ ] File: `app/admin/challenges/page.tsx`
- [ ] Add import: `PracticeSettingsPanel`
- [ ] Add state: practice settings
- [ ] Add tab: "Practice Settings"
- [ ] Integrate với existing state management

#### 4.2 Practice Settings Panel
- [ ] Tạo file: `app/admin/challenges/components/practice-settings-panel.tsx`
```typescript
// Display count input (1-50)
// Selection mode radio buttons
// Auto-generation toggle
// Daily schedule settings
// Difficulty distribution sliders
// Save/Reset buttons
// Real-time preview
```

#### 4.3 Enhanced Challenge Filters
- [ ] File: `app/admin/challenges/components/challenge-filters.tsx`
- [ ] Add filter: "Practice Only" toggle
- [ ] Add filter: Selection mode indicator
- [ ] Add filter: Featured challenges only
- [ ] Maintain existing filter logic

#### 4.4 Challenge Cards Enhancement
- [ ] File: `app/admin/challenges/components/challenge-table.tsx`
- [ ] Add column: "Display Priority" for manual mode
- [ ] Add action: "Set Featured" quick toggle
- [ ] Add indicator: Currently displayed badges
- [ ] Bulk actions: Set featured, Change difficulty

### PHASE 5: Frontend Integration
#### 5.1 Challenge Tabs Enhancement
- [ ] File: `components/challenge/challenge-tabs.tsx`
- [ ] Modify `getChallenges('practice', { limit: 15 })` → dynamic limit
- [ ] Add selection mode logic trong `loadChallenges()`
- [ ] Cache settings để tránh re-fetch
- [ ] Add loading states cho settings

#### 5.2 Selection Mode Implementation
- [ ] **Latest Mode**: Order by `created_at DESC`
- [ ] **Random Mode**: `ORDER BY RANDOM()` với avoid recent logic
- [ ] **Featured Mode**: Priority featured challenges
- [ ] **Manual Mode**: Admin-selected challenges với priority order

### PHASE 6: Settings UI Components
#### 6.1 Display Count Settings
- [ ] Tạo file: `app/admin/challenges/components/display-count-input.tsx`
```typescript
// Number input với validation (1-50)
// Real-time preview
// Reset to default button
```

#### 6.2 Selection Mode Toggle
- [ ] Tạo file: `app/admin/challenges/components/selection-mode-toggle.tsx`
```typescript
// Radio group: Latest, Random, Featured, Manual
// Mode descriptions
// Preview của mỗi mode
```

#### 6.3 Auto-Generation Settings
- [ ] Tạo file: `app/admin/challenges/components/auto-generation-settings.tsx`
```typescript
// Enable/disable toggle
// Daily count input (1-10)
// Time picker
// Difficulty distribution sliders
// Next generation preview
```

#### 6.4 Manual Selection Interface
- [ ] Tạo file: `app/admin/challenges/components/manual-selection-interface.tsx`
```typescript
// Drag & drop reordering
// Search và filter
// Bulk select/deselect
// Preview selected challenges
```

### PHASE 7: Advanced Features
#### 7.1 Statistics Dashboard
- [ ] Tạo file: `app/admin/challenges/components/practice-stats-dashboard.tsx`
```typescript
// Total practice challenges
// Daily generation history
// User engagement metrics
// Popular difficulties
// Selection mode performance
```

#### 7.2 Preview System
- [ ] Add preview mode trong admin
- [ ] Show exactly 15 challenges user sẽ thấy
- [ ] Real-time update khi settings thay đổi
- [ ] A/B testing comparison

#### 7.3 Backup & Import
- [ ] Export current settings
- [ ] Import settings configuration
- [ ] Settings versioning
- [ ] Rollback functionality

### PHASE 8: Testing & Validation
#### 8.1 Unit Tests
- [ ] Test practice settings CRUD
- [ ] Test selection mode algorithms
- [ ] Test validation logic
- [ ] Test error handling

#### 8.2 Integration Tests
- [ ] Test admin UI workflows
- [ ] Test frontend integration
- [ ] Test auto-generation integration
- [ ] Test performance với large datasets

#### 8.3 User Acceptance Testing
- [ ] Admin experience testing
- [ ] Frontend user experience
- [ ] Mobile responsiveness
- [ ] Performance benchmarks

## 📁 File Structure Summary

### New Files (7 files)
```
app/
├── api/admin/
│   ├── practice-settings/route.ts
│   └── challenges/practice/route.ts
├── admin/challenges/components/
│   ├── practice-settings-panel.tsx
│   ├── display-count-input.tsx
│   ├── selection-mode-toggle.tsx
│   ├── auto-generation-settings.tsx
│   └── manual-selection-interface.tsx
└── hooks/
    └── use-practice-settings.ts

supabase/migrations/
└── create_practice_settings.sql
```

### Extended Files (4 files)
```
app/
├── actions/challenge-videos.ts (extend)
├── admin/challenges/
│   ├── page.tsx (extend)
│   └── components/
│       ├── challenge-filters.tsx (extend)
│       └── challenge-table.tsx (extend)
└── components/challenge/
    └── challenge-tabs.tsx (extend)
```

## 🚀 Implementation Priority

### HIGH Priority (Week 1)
1. ✅ Database setup và migration
2. ✅ Practice settings API
3. ✅ Basic admin UI panel
4. ✅ Dynamic limit trong frontend

### MEDIUM Priority (Week 2)
5. ✅ Selection modes implementation
6. ✅ Enhanced admin filters
7. ✅ Auto-generation integration
8. ✅ Settings validation

### LOW Priority (Week 3)
9. ✅ Advanced features (manual selection, stats)
10. ✅ Testing và optimization
11. ✅ Documentation updates
12. ✅ Performance monitoring

## 📊 Technical Specifications

### API Endpoints
```
GET  /api/admin/practice-settings
PUT  /api/admin/practice-settings
GET  /api/admin/challenges/practice
GET  /api/admin/challenges/practice/stats
```

### Database Schema
```sql
practice_settings:
- id (UUID, PK)
- display_count (INTEGER, 1-50)
- selection_mode (ENUM)
- auto_generation_enabled (BOOLEAN)
- daily_generation_count (INTEGER, 1-10)
- daily_generation_time (TIME)
- difficulty_distribution (JSONB)
- avoid_recent_days (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

### Selection Mode Logic
```typescript
interface SelectionModes {
  latest: "ORDER BY created_at DESC LIMIT {display_count}"
  random: "ORDER BY RANDOM() LIMIT {display_count} WHERE created_at < NOW() - INTERVAL '{avoid_recent_days} days'"
  featured: "ORDER BY featured DESC, created_at DESC LIMIT {display_count}"
  manual: "WHERE id IN (selected_challenge_ids) ORDER BY manual_priority"
}
```

## ✨ Success Criteria

### Admin Experience
- [ ] Có thể thay đổi số lượng challenges hiển thị (1-50)
- [ ] Có thể chọn selection mode dễ dàng
- [ ] Có thể preview changes trước khi save
- [ ] Có thể manage auto-generation settings
- [ ] Có thể manual select challenges cho manual mode

### User Experience
- [ ] Route "/" luôn hiển thị đúng số lượng challenges
- [ ] Challenges selection theo đúng mode đã cấu hình
- [ ] Performance tốt, không bị lag
- [ ] Mobile-friendly

### Technical Excellence
- [ ] Code reuse tối đa 90% existing architecture
- [ ] API response time < 200ms
- [ ] Database queries optimized
- [ ] Error handling comprehensive
- [ ] Logging và monitoring đầy đủ

## 🔄 Rollback Plan
- [ ] Database migration rollback scripts
- [ ] Feature flags để disable mới features
- [ ] Settings backup và restore
- [ ] Monitoring alerts cho performance issues

---

**Created**: 2025-08-06  
**Last Updated**: 2025-08-06  
**Status**: Ready for Implementation  
**Estimated Time**: 2-3 weeks  
**Dependencies**: Existing admin architecture, Supabase setup
