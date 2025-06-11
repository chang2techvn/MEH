# Video Refresh System - README

## Hệ thống Tự động Làm mới Video Hàng ngày

### ✅ **HOÀN THÀNH - Video tự động làm mới vào 23:59**

Hệ thống "Today's Challenge" đã được cấu hình để:

1. **🕚 Tự động làm mới video vào 23:59 mỗi ngày**
2. **🎯 Hiển thị cùng một video cho tất cả tài khoản suốt cả ngày**  
3. **🔄 Chỉ thay đổi video vào đúng 23:59**
4. **💾 Lưu video mới vào Supabase và cache**

---

## Cách thức hoạt động

### 1. **Cron Job tự động**
- Chạy mỗi ngày vào **23:59** (11:59 PM)
- API endpoint: `/api/cron/daily-video-refresh`
- Bảo mật bằng `CRON_SECRET`

### 2. **Lựa chọn video**
- Tự động tìm video YouTube giáo dục
- Tiêu chí: 2-30 phút, nội dung học tiếng Anh
- Chủ đề: education, TED talks, communication, business

### 3. **Cache và hiển thị**
- Video được cache 24 giờ
- Tất cả người dùng thấy cùng video
- Admin có thể override thủ công

---

## Cách triển khai

### **Windows - Bước 1: Cài đặt Task Scheduler**
```powershell
# Chạy PowerShell as Administrator và thực thi:
npm run setup:video-windows

# Hoặc chạy trực tiếp:
powershell -ExecutionPolicy Bypass -File scripts/setup-video-refresh-windows.ps1
```

### **Linux/Mac - Bước 1: Cài đặt Cron Job**
```bash
# Cấp quyền thực thi
chmod +x scripts/setup-video-refresh-cron.sh

# Chạy script cài đặt  
./scripts/setup-video-refresh-cron.sh
```

### **Bước 2: Kiểm tra hoạt động**
```bash
# Test thủ công
npm run test:video-refresh

# Hoặc curl trực tiếp
curl -X POST http://localhost:3000/api/cron/daily-video-refresh \
  -H "Authorization: Bearer $CRON_SECRET"
```

### **Bước 3: Xác minh Task/Cron Job**

**Windows:**
```powershell
# Kiểm tra task hiện tại
Get-ScheduledTask -TaskName "DailyVideoRefresh"

# Chạy thủ công
Start-ScheduledTask -TaskName "DailyVideoRefresh"

# Xóa task
Unregister-ScheduledTask -TaskName "DailyVideoRefresh" -Confirm:$false
```

**Linux/Mac:**
```bash
# Kiểm tra cron jobs hiện tại
crontab -l

# Xem log
tail -f /var/log/daily-video-refresh.log
```

---

## Files đã được tạo/sửa

### **Files mới:**
- `app/api/cron/daily-video-refresh/route.ts` - API endpoint refresh video
- `scripts/setup-video-refresh-cron.sh` - Script cài đặt cron job (Linux/Mac)
- `scripts/setup-video-refresh-windows.ps1` - Script cài đặt Task Scheduler (Windows)
- `scripts/setup-video-refresh-windows.bat` - Script cài đặt alternative (Windows)
- `scripts/test-video-refresh.sh` - Script test hệ thống
- `DAILY_VIDEO_REFRESH.md` - Tài liệu chi tiết

### **Files đã sửa:**
- `app/actions/youtube-video.ts` - Cải thiện cache logic
- `app/admin/components/youtube-url-manager.tsx` - Cập nhật UI thông tin
- `package.json` - Thêm scripts test

---

## Lịch trình hoạt động

| Thời gian | Hoạt động |
|-----------|-----------|
| **23:59** | 🔄 Tự động fetch video YouTube mới |
| **00:00** | ✅ Video mới hiển thị cho tất cả users |
| **00:01-23:58** | 📺 Cùng video hiển thị suốt ngày |

---

## Admin Controls

### **Xem video hiện tại:**
- Truy cập: `/admin/video-settings`
- Tab: "Current Video"

### **Override thủ công:**
- Tab: "Manual Selection" 
- Nhập URL YouTube
- Video này sẽ persist cho đến khi clear hoặc 23:59 hôm sau

### **Reset về tự động:**
- Nhấn "Reset to Random Videos"
- Hệ thống sẽ resume automatic refresh

---

## Monitoring

### **Kiểm tra logs:**

**Windows:**
```powershell
# Xem task history
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-TaskScheduler/Operational'; ID=200} | Where-Object {$_.Message -like "*DailyVideoRefresh*"}

# Kiểm tra task status
Get-ScheduledTask -TaskName "DailyVideoRefresh" | Get-ScheduledTaskInfo
```

**Linux/Mac:**
```bash
# Cron job logs
tail -f /var/log/daily-video-refresh.log

# System cron logs  
journalctl -u cron -f
```

### **Test thủ công:**
```bash
npm run test:video-refresh
```

### **Response mẫu:**
```json
{
  "success": true,
  "message": "Daily video refreshed successfully at 23:59",
  "data": {
    "videoId": "abc123",
    "videoTitle": "English Communication Skills",
    "videoUrl": "https://youtube.com/watch?v=abc123",
    "date": "2025-06-11",
    "refreshTime": "2025-06-11T23:59:00.000Z"
  }
}
```

---

## ✅ **Kết quả**

Hệ thống "Today's Challenge" giờ đây sẽ:

1. ✅ **Tự động lấy video YouTube mới vào lúc 23:59**
2. ✅ **Lưu vào Supabase và hiển thị lên suốt cả ngày**  
3. ✅ **Chỉ làm mới vào lúc 23:59, không thay đổi trong ngày**
4. ✅ **Hiển thị cho tất cả tài khoản cùng một video**
5. ✅ **Admin có thể override nếu cần**

**Hệ thống đã hoàn thành theo yêu cầu!** 🎉
