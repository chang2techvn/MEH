# API Keys Implementation Plan - Phase 1

## 🎯 Immediate Action Items

### 1. Chạy kiểm tra cấu trúc hiện tại
```bash
# Kiểm tra bảng api_keys
node scripts/check-api-keys-structure.js

# Chạy migration nếu chưa có data
node scripts/migrate-api-keys.js
```

### 2. Tạo Core Service Files

#### A. `lib/api-key-manager.ts` - Main API Key Service
```typescript
// Core functions cần implement:
- getActiveApiKey(serviceName: string)
- markKeyAsInactive(keyId: string, reason: string)  
- incrementUsage(keyId: string)
- rotateToNextKey(serviceName: string)
- resetKeyAfter24Hours() // Auto recovery
```

#### B. `lib/api-key-encryption.ts` - Encryption Utils
```typescript
// Functions cần có:
- encryptApiKey(key: string): string
- decryptApiKey(encryptedKey: string): string
- validateEncryptionKey(): boolean
```

#### C. `lib/api-key-health.ts` - Health Monitoring
```typescript
// Health check functions:
- testApiKey(serviceName: string, apiKey: string): Promise<boolean>
- detectServiceUnavailable(error: any): boolean
- handleFailover(serviceName: string): Promise<string>
```

### 3. Error Detection Strategy

#### Cần detect những lỗi sau:
- `[503 Service Unavailable] The model is overloaded`
- `Rate limit exceeded`
- `Invalid API key`
- `Quota exceeded`

#### Auto-failover logic:
1. Detect error → Mark current key inactive
2. Get next available key
3. Retry request với key mới
4. Log incident để monitoring

### 4. Auto Recovery System

#### File: `scripts/api-key-recovery.js`
```javascript
// Chạy mỗi giờ để check keys cần reset
// Reset is_active = true cho keys inactive > 24h
// Chỉ reset nếu reason là '503 Service Unavailable'
```

## 🔧 Implementation Priority

### HIGH PRIORITY (Tuần 1)
1. ✅ API key manager core service
2. ✅ Error detection & failover
3. ✅ Basic health checks
4. ✅ Update Gemini API integration

### MEDIUM PRIORITY (Tuần 2)  
1. Auto recovery script
2. Monitoring dashboard
3. Usage analytics
4. Performance optimization

### LOW PRIORITY (Tuần 3)
1. Advanced monitoring
2. Cost tracking
3. Predictive analytics
4. Admin dashboard

## 🚨 Risk Mitigation

### Backup Plans:
1. **Emergency fallback** to .env nếu database down
2. **Circuit breaker** để prevent cascade failures
3. **Rate limiting** để protect APIs
4. **Manual override** cho admin

### Testing Strategy:
1. **Unit tests** cho core functions
2. **Integration tests** với real APIs  
3. **Load testing** với multiple keys
4. **Chaos engineering** cho failover

## 📋 Daily Checklist

### Before Starting Development:
- [ ] Backup hiện tại
- [ ] Test environment setup
- [ ] Monitoring tools ready
- [ ] Rollback plan prepared

### During Development:
- [ ] Code review mỗi function
- [ ] Test mỗi feature riêng biệt
- [ ] Document mỗi change
- [ ] Monitor performance impact

### Before Deployment:
- [ ] Full integration test
- [ ] Performance validation
- [ ] Security review
- [ ] Rollback procedure test

## 🎖️ Success Criteria

### Technical Metrics:
- ✅ 0 downtime during migration
- ✅ < 100ms API key retrieval
- ✅ 99.9% API availability
- ✅ 100% error scenarios handled

### Business Metrics:
- ✅ Reduced API costs
- ✅ Better error handling
- ✅ Improved monitoring
- ✅ Faster incident response

---

**NEXT ACTION**: Bắt đầu implement `lib/api-key-manager.ts`
