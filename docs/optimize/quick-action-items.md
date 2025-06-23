# Quick Action Items - Làm Ngay Hôm Nay

## 🚀 INSTANT FIXES (30 phút)

### Critical Quick Wins
- [ ] **Remove console.log statements** từ production
  ```bash
  grep -r "console\.log" --include="*.tsx" --include="*.ts" . | wc -l
  ```

- [ ] **Fix image priorities ngay lập tức**
  ```tsx
  // File: app/page.tsx - Add priority cho hero image
  <OptimizedImage priority={true} src="/images/hero-bg.webp" />
  ```

- [ ] **Memoize AuthContext value**
  ```tsx
  // File: contexts/auth-context.tsx
  const authValue = useMemo(() => ({ user, loading, setUser }), [user, loading])
  ```

- [ ] **Conditional mount chat components**
  ```tsx
  // File: app/layout.tsx
  {hasActiveChats && <ChatWindowsManager />}
  {hasMinimizedChats && <MinimizedChatBar />}
  ```

**Expected Impact**: 20-25% performance improvement

---

## ⚡ HIGH-IMPACT ACTIONS (2 giờ)

### Bundle Size Reduction
- [ ] **Remove unused dependencies**
  ```bash
  npm uninstall fs os path react-helmet @types/react-helmet
  npm uninstall react-window-infinite-loader
  ```

- [ ] **Fix import statements**
  ```tsx
  // Replace all instances of:
  import * as Icons from "lucide-react"
  // With specific imports:
  import { Search, Plus, Sparkles } from "lucide-react"
  ```

- [ ] **Remove component-level lazy loading**
  ```tsx
  // File: app/page.tsx - Keep critical components eager
  import MainHeader from "@/components/ui/main-header"
  import MainContent from "@/components/home/main-content"
  ```

### Memory Leak Fixes
- [ ] **Add cleanup to all useEffect**
  ```tsx
  useEffect(() => {
    const cleanup = setupSomething()
    return cleanup // ✅ Always return cleanup
  }, [])
  ```

**Expected Impact**: 40-50% performance improvement

---

## 🎯 PRIORITY ACTIONS (1 ngày)

### Context Optimization
- [ ] **Split ChatContext** thành smaller contexts
- [ ] **Implement Map for messages** thay vì Object
- [ ] **Add periodic cleanup** cho old conversations

### Image Optimization Pipeline
- [ ] **Generate blur data URLs** cho all images
- [ ] **Set responsive sizes** properly
- [ ] **Enable AVIF format** trong next.config.mjs

### Virtual Scrolling
- [ ] **Enable virtual scroll** cho lists > 20 items
- [ ] **Fix memory usage** trong virtual scroll implementation

**Expected Impact**: 60-70% performance improvement

---

## 📊 VALIDATION CHECKLIST

### After Each Fix
- [ ] Run `npm run build` to check bundle size
- [ ] Test critical user flows
- [ ] Check console for errors
- [ ] Verify mobile performance

### Performance Testing
- [ ] **Lighthouse audit**: `npx lighthouse http://localhost:3000`
- [ ] **Bundle analysis**: `npm run analyze:win`
- [ ] **Memory testing**: Chrome DevTools Performance tab

### Success Criteria
- [ ] Bundle size < 300KB
- [ ] Page load < 3s
- [ ] Performance score > 80
- [ ] No memory leaks
- [ ] No console errors

---

## 🚨 EMERGENCY PRIORITIES

**If trang web quá chậm, làm ngay:**

1. **Remove all lazy loading** từ critical components (5 phút)
2. **Add priority={true}** cho hero images (5 phút)  
3. **Memoize context values** (10 phút)
4. **Remove heavy dependencies** (15 phút)
5. **Test immediately** (5 phút)

**Total**: 40 phút → Expected 30-40% improvement

---

## ✅ COMPLETION TRACKING

### Daily Progress
- [ ] Morning: Check yesterday's metrics
- [ ] Work: Complete priority tasks  
- [ ] Test: Validate improvements
- [ ] Evening: Document results

### Weekly Goals
- [ ] Week 1: Bundle + Context optimization
- [ ] Week 2: Memory + Monitoring
- [ ] Week 3: Final polish + Testing

**Final Target**: Load time < 2s, Performance score > 90
