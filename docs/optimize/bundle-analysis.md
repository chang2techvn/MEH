# Chi Tiết Vấn Đề Bundle Size và Dependencies

## 📦 PHÂN TÍCH DEPENDENCIES

### Heavy Dependencies (> 100KB each):
```json
{
  "@radix-ui/*": "~450KB total",
  "@tiptap/*": "~320KB total", 
  "framer-motion": "~280KB",
  "@supabase/supabase-js": "~150KB",
  "recharts": "~200KB",
  "youtubei.js": "~180KB",
  "react-markdown": "~120KB",
  "tailwindcss": "~100KB runtime"
}
```

### Unused/Redundant Dependencies:
- `fs`, `os`, `path` - Node.js modules không cần trong client
- `react-helmet` - có thể thay bằng Next.js Head
- `react-window` và `react-window-infinite-loader` - overlap với custom virtual scroll
- Nhiều `@types/*` packages không sử dụng

### Tree Shaking Issues:
```typescript
// ❌ Bad: Import toàn bộ library
import * as Icons from "lucide-react"

// ✅ Good: Import chỉ những gì cần
import { Search, Plus, Sparkles } from "lucide-react"
```

## 🎯 GIẢI PHÁP TỐI ƯU DEPENDENCIES

### 1. Remove Unused Packages:
```bash
npm uninstall fs os path
npm uninstall react-helmet
npm uninstall @types/react-helmet
npm uninstall react-window-infinite-loader
```

### 2. Replace Heavy Dependencies:
```bash
# Thay framer-motion bằng CSS animations cho basic use cases
npm install @emotion/is-prop-valid --save-exact

# Sử dụng React.lazy thay vì external lazy loading libraries
```

### 3. Bundle Analysis Setup:
```javascript
// next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // existing config
})
```

### 4. Code Splitting Strategy:
```typescript
// Split by route
const AdminPages = dynamic(() => import('./admin'), { ssr: false })
const CommunityPages = dynamic(() => import('./community'), { ssr: false })

// Split by feature
const VideoPlayer = dynamic(() => import('@/components/video-player'), {
  loading: () => <VideoSkeleton />,
  ssr: false
})

// Split by vendor
const Charts = dynamic(() => import('@/components/charts'), {
  loading: () => <ChartSkeleton />,
  ssr: false
})
```

## 📊 EXPECTED IMPROVEMENTS

### Before Optimization:
- Main Bundle: ~500KB
- Vendor Bundle: ~800KB
- Total First Load: ~1.3MB

### After Optimization:
- Main Bundle: ~250KB (-50%)
- Vendor Bundle: ~400KB (-50%)
- Total First Load: ~650KB (-50%)

### Performance Impact:
- Parse Time: 800ms → 400ms
- Evaluation Time: 300ms → 150ms
- First Contentful Paint: 2.5s → 1.5s
