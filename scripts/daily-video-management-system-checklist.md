# 📋 Daily Video Management System - Development Checklist

## 🎯 Mục tiêu dự án
Xây dựng hệ thống quản lý "DAILY VIDEO (1 video/ngày)" tự động với giao diện admin hoàn chỉnh thay thế `/admin/video-settings` hiện tại.

---

## 📊 1. PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### ✅ **Những gì đã có sẵn:**
- [x] Route "/" với "Your Current Challenge" 
- [x] Bảng `challenges` với đầy đủ field cần thiết
- [x] Cron job tự động tạo daily video (23:59 hàng ngày)
- [x] YouTube video player với required_watch_time
- [x] Hệ thống API key rotation cho Gemini AI
- [x] Transcript tự động từ video bằng Gemini AI
- [x] Bảng `daily_video_settings` cho automation
- [x] Bảng `topics` cho quản lý chủ đề

### ⚠️ **Những gì cần được thay thế/cải thiện:**
- [ ] Giao diện `/admin/video-settings` hiện tại (3 tabs cũ)
- [ ] Tích hợp với hệ thống daily automation
- [ ] UI/UX quản lý daily video
- [ ] Quản lý topics động thay vì hardcode
- [ ] Cài đặt thời gian transcript extraction

---

## 🔧 2. DATABASE SCHEMA ANALYSIS & UPDATES

### 📋 **Bảng `challenges` - Đánh giá:**
```sql
✅ SẴN SÀNG: Đã có đầy đủ field cần thiết
- required_watch_time (thời gian xem bắt buộc)
- transcript_start_time, transcript_end_time (thời gian transcript)
- transcript (nội dung transcript từ Gemini AI)
- challenge_type = 'daily' (phân biệt daily video)
- topics[] (chủ đề video)
- video_url, embed_url, thumbnail_url
- difficulty (mức độ khó)
```

### 📋 **Bảng `daily_video_settings` - Cần cập nhật:**
```sql
🔄 CẦN BỔ SUNG CÁC FIELD:
- prompt_template TEXT (template prompt gửi Gemini AI)
- transcript_prompt_template TEXT (prompt để extract transcript)
- youtube_search_keywords TEXT[] (từ khóa search YouTube)
- auto_topic_rotation BOOLEAN (tự động xoay chủ đề)
- backup_video_url TEXT (video dự phòng khi không tìm được)
- notification_settings JSONB (thông báo khi có video mới)
```

### 📋 **Bảng `topics` - Cần mở rộng:**
```sql
🔄 CẦN BỔ SUNG CÁC FIELD:
- search_priority INTEGER (độ ưu tiên khi search)
- last_used_count INTEGER (số lần sử dụng gần đây)
- success_rate DECIMAL(3,2) (tỷ lệ thành công fetch video)
- youtube_keywords TEXT[] (từ khóa YouTube cụ thể)
- topic_type TEXT ('manual', 'trending', 'seasonal')
```

---

## 🎨 3. THIẾT KẾ GIAO DIỆN `/admin/video-settings` MỚI

### 📱 **Layout tổng thể:**
```
┌─────────────────────────────────────────────┐
│ 🎬 Daily Video Management System           │
├─────────────────────────────────────────────┤
│ [Today's Video] [Automation] [Topics] [API] │
├─────────────────────────────────────────────┤
│                                             │
│  Tab content area với animation            │
│                                             │
└─────────────────────────────────────────────┘
```

### 🎯 **Tab 1: Today's Video (Video hôm nay)**
```
┌─────────────────────────────────────────────┐
│ 📺 Today's Daily Video                     │
├─────────────────────────────────────────────┤
│ [Video Preview Player]                      │
│ Title: "Advanced English Communication..."  │
│ Duration: 4:32 | Required Watch: 3:00      │
│ Topics: [Business] [Communication]          │
│                                             │
│ 🔧 Actions:                                │
│ [⚡ Replace with AI Suggestion]            │
│ [🔗 Replace with URL] [Input field...     ]│ 
│ [📝 Regenerate Transcript]                 │
│ [⏰ Adjust Watch Time] [3:00] slider       │
└─────────────────────────────────────────────┘
```

### ⚙️ **Tab 2: Automation Settings (Cài đặt tự động)**
```
┌─────────────────────────────────────────────┐
│ 🤖 Daily Video Automation                  │
├─────────────────────────────────────────────┤
│ ⏰ Schedule Settings:                       │
│ └ Fetch Time: [06:00] AM (UTC+7)          │
│ └ Auto-approve: [✓] Enabled               │
│                                             │
│ 🎥 Video Preferences:                      │
│ └ Min Duration: [180s] Max: [600s]        │
│ └ Quality: [720p HD] ▼                    │
│ └ Language: [English] ▼                   │
│                                             │
│ 📝 Transcript Settings:                    │
│ └ Extract Mode: [Beginning] ▼             │
│ └ Length: [3:00] minutes                  │
│ └ Prompt Template: [Text area...]         │
│                                             │
│ 🔄 Cron Job Status:                       │
│ └ Status: [🟢 Running] Next: 06:00 AM    │
│ └ [▶ Start] [⏸ Stop] [⚡ Run Now]       │
└─────────────────────────────────────────────┘
```

### 🏷️ **Tab 3: Topics Management (Quản lý chủ đề)**
```
┌─────────────────────────────────────────────┐
│ 🏷️ Video Topics & Keywords                │
├─────────────────────────────────────────────┤
│ 🔍 Search: [Filter topics...        ] [+Add]│
│                                             │
│ 📊 Topic Selection Mode:                   │
│ ○ Random rotation  ● Sequential            │
│ ○ Weighted by success rate                 │
│                                             │
│ 📋 Topics List:                            │
│ ┌─────────────────────────────────────────┐ │
│ │ 💼 Business English                     │ │
│ │ └ Keywords: business, professional...    │ │
│ │ └ Usage: 15 times | Success: 87%       │ │
│ │ └ [✏ Edit] [📊 Stats] [🗑 Delete]     │ │
│ ├─────────────────────────────────────────┤ │
│ │ 🗣️ Daily Conversation                  │ │
│ │ └ Keywords: conversation, daily...      │ │
│ │ └ Usage: 22 times | Success: 92%       │ │
│ │ └ [✏ Edit] [📊 Stats] [🗑 Delete]     │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 🔑 **Tab 4: AI & API Settings (Cài đặt AI)**
```
┌─────────────────────────────────────────────┐
│ 🧠 AI & API Configuration                  │
├─────────────────────────────────────────────┤
│ 🔑 Gemini AI Keys:                         │
│ └ Active Keys: 3/5 healthy                 │
│ └ Current: key_***xyz (Usage: 45%)         │
│ └ [🔄 Rotate] [➕ Add Key] [📊 Health]   │
│                                             │
│ 🎯 AI Prompts:                             │
│ └ Video Selection Prompt:                  │
│   [Large text area for prompt template...] │
│ └ Transcript Extraction Prompt:            │
│   [Large text area for prompt template...] │
│                                             │
│ ⚡ Performance:                            │
│ └ Response Time: avg 2.3s                 │
│ └ Success Rate: 94.2%                     │
│ └ Daily Usage: 12/100 requests            │
└─────────────────────────────────────────────┘
```

---

## ⚡ 4. TECHNICAL IMPLEMENTATION TASKS

### 🏗️ **Backend Tasks:**

#### 📊 **Database Updates:**
- [ ] Migrate `daily_video_settings` table với fields mới
- [ ] Migrate `topics` table với fields mở rộng  
- [ ] Tạo stored procedures cho topic rotation logic
- [ ] Setup triggers cho usage tracking
- [ ] Tạo views cho admin dashboard stats

#### 🔗 **API Endpoints:**
- [ ] `GET /api/admin/daily-video/current` - Get today's video
- [ ] `POST /api/admin/daily-video/replace` - Replace with URL/AI suggestion
- [ ] `PUT /api/admin/daily-video/transcript` - Regenerate transcript
- [ ] `GET|PUT /api/admin/daily-video/settings` - Automation settings
- [ ] `GET|POST|PUT|DELETE /api/admin/topics` - Topics CRUD
- [ ] `GET /api/admin/daily-video/stats` - Performance stats
- [ ] `POST /api/admin/daily-video/test-fetch` - Test fetch video

#### 🤖 **AI Integration Updates:**
- [ ] Cập nhật Gemini AI prompts cho video selection
- [ ] Cải thiện transcript extraction logic
- [ ] Thêm video quality analysis với AI
- [ ] Topic suggestion từ AI trends
- [ ] Auto-retry mechanism cho failed requests

### 🎨 **Frontend Tasks:**

#### 📱 **Component Development:**
- [ ] `DailyVideoManager` - Main dashboard component
- [ ] `TodaysVideoTab` - Today's video preview & actions
- [ ] `AutomationSettingsTab` - Cron job & automation config
- [ ] `TopicsManagementTab` - Topics CRUD interface
- [ ] `AISettingsTab` - API keys & prompts management
- [ ] `VideoPreviewPlayer` - Embedded video player
- [ ] `TranscriptEditor` - Edit transcript với highlight
- [ ] `CronJobController` - Start/stop/status controls

#### 🎯 **Real-time Features:**
- [ ] WebSocket cho cron job status updates
- [ ] Live transcript generation progress
- [ ] Real-time video fetch progress
- [ ] Toast notifications cho admin actions
- [ ] Auto-refresh today's video display

#### 🎨 **UI/UX Enhancements:**
- [ ] Smooth transitions giữa các tabs
- [ ] Loading states cho mọi async operations
- [ ] Error boundaries cho robust error handling
- [ ] Mobile-responsive design cho admin panel
- [ ] Dark/light mode cho admin interface
- [ ] Keyboard shortcuts cho power users

---

## 🔄 5. INTEGRATION WITH EXISTING SYSTEM

### 🔗 **Existing System Connections:**
- [ ] Tích hợp với cron job `/api/cron/daily-video-refresh`
- [ ] Kết nối với YouTube video player ở route "/"
- [ ] Sync với `required_watch_time` settings
- [ ] Integration với API key rotation system
- [ ] Compatibility với existing auth middleware

### 📈 **Data Migration:**
- [ ] Migrate existing video settings to new schema
- [ ] Import current topics từ hardcoded lists
- [ ] Preserve existing daily videos trong database
- [ ] Backup current admin settings

---

## 🧪 6. TESTING & VALIDATION

### ✅ **Unit Tests:**
- [ ] Database schema validation tests
- [ ] API endpoints functionality tests  
- [ ] AI prompt generation tests
- [ ] Topic rotation algorithm tests
- [ ] Cron job scheduling tests

### 🔍 **Integration Tests:**
- [ ] End-to-end video fetch flow
- [ ] Admin UI workflow tests
- [ ] Real Gemini AI integration tests
- [ ] Database transaction tests
- [ ] Error handling scenarios

### 👥 **User Acceptance Testing:**
- [ ] Admin user workflow testing
- [ ] Performance benchmarking
- [ ] Mobile responsiveness testing
- [ ] Cross-browser compatibility
- [ ] Accessibility compliance

---

## 🚀 7. DEPLOYMENT & MONITORING

### 📦 **Deployment Steps:**
- [ ] Database migration scripts
- [ ] Environment variables setup
- [ ] API key rotation configuration
- [ ] Cron job scheduling setup
- [ ] Frontend build & deployment

### 📊 **Monitoring & Analytics:**
- [ ] Daily video fetch success tracking
- [ ] AI API usage monitoring
- [ ] User engagement metrics với daily videos
- [ ] Performance monitoring cho new admin panel
- [ ] Error rate tracking & alerting

---

## 📅 8. ESTIMATED TIMELINE

### 🗓️ **Phase 1: Backend (Tuần 1-2)**
- Database schema updates
- API endpoints development
- AI integration improvements

### 🗓️ **Phase 2: Frontend (Tuần 2-3)**  
- Admin UI components
- Real-time features
- Testing & debugging

### 🗓️ **Phase 3: Integration & Testing (Tuần 3-4)**
- System integration
- Comprehensive testing
- Performance optimization

### 🗓️ **Phase 4: Deployment (Tuần 4)**
- Production deployment
- Monitoring setup
- Documentation

---

## ⚠️ 9. RISKS & MITIGATION

### 🚨 **Potential Risks:**
- [ ] **API Rate Limits:** Gemini AI quotas
  - *Mitigation:* Multiple API keys rotation + caching
- [ ] **Video Availability:** YouTube videos bị private/deleted
  - *Mitigation:* Backup video system + validation
- [ ] **Performance:** Large video processing
  - *Mitigation:* Async processing + progress tracking
- [ ] **User Experience:** Complex admin interface
  - *Mitigation:* Progressive disclosure + tooltips

### 🛡️ **Backup Plans:**
- [ ] Fallback video selection mechanism
- [ ] Manual override cho automation failures
- [ ] Database rollback procedures
- [ ] Alternative AI providers (OpenAI, Claude)

---

## 🎯 10. SUCCESS METRICS

### 📊 **Key Performance Indicators:**
- [ ] **Automation Success Rate:** >95% daily video fetch
- [ ] **Admin Efficiency:** <5 min để configure daily video  
- [ ] **Video Quality:** >4.0/5.0 average rating
- [ ] **System Uptime:** >99.5% availability
- [ ] **User Engagement:** Increased daily challenge completion

### 📈 **Long-term Goals:**
- [ ] Fully automated daily video system
- [ ] AI-powered content quality improvement
- [ ] Advanced analytics dashboard
- [ ] Multi-language video support
- [ ] Community-driven topic suggestions

---

## 📝 11. DOCUMENTATION REQUIREMENTS

### 📚 **Technical Documentation:**
- [ ] API documentation với examples
- [ ] Database schema documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Code architecture overview

### 👥 **User Documentation:**
- [ ] Admin user manual
- [ ] Video content guidelines
- [ ] Troubleshooting FAQ
- [ ] Best practices guide

---

**🏁 TỔNG KẾT:** Hệ thống Daily Video Management này sẽ thay thế hoàn toàn `/admin/video-settings` hiện tại bằng solution toàn diện cho việc quản lý video hàng ngày với automation, AI integration, và admin-friendly interface.

**📞 NEXT STEPS:** Review checklist này → Approve technical approach → Bắt đầu Phase 1 implementation.
