# Phase 2 Setup & Activation Guide

## 🚀 Quick Start

### Step 1: Enable Caching

Edit `backend/.env`:

```bash
# Change this from false to true
ENABLE_CACHE=true

# Optional: Adjust cache TTL (seconds)
CACHE_TTL=300  # 5 minutes (default)
```

### Step 2: Restart Backend

```bash
cd backend
npm run dev
```

### Step 3: Verify Cache is Working

**Test Cache:**
```bash
# First request (cache miss)
curl http://localhost:3003/api/employees/123
# Check response header: X-Cache: MISS

# Second request (cache hit)
curl http://localhost:3003/api/employees/123
# Check response header: X-Cache: HIT
```

**Check Cache Stats:**
```bash
curl http://localhost:3003/cache-stats
```

---

## 📋 What's Cached

### Currently Cached:

1. **Employee Endpoints:**
   - `GET /api/employees/:id` - Individual employee (5 min)
   - `GET /api/employees` - Employee list (5 min)

### Cache Behavior:

- ✅ GET requests are cached
- ✅ POST/PUT/DELETE invalidate cache
- ✅ User-specific cache keys (security)
- ✅ Query parameters included in cache key

---

## 🔧 Configuration Options

### Cache TTL (Time To Live)

```bash
# In .env
CACHE_TTL=300  # 5 minutes (default)
CACHE_TTL=600  # 10 minutes
CACHE_TTL=60   # 1 minute
```

### Per-Route TTL

```javascript
// In app.js
app.use('/api/employees', cacheMiddleware(600), require('./routes/employee.routes'));
// This route uses 10 minute cache
```

### Bypass Cache

**Query Parameter:**
```
GET /api/employees?noCache=true
```

**Always fetches fresh data**

---

## 🧪 Testing Checklist

- [ ] Caching enabled in `.env` (`ENABLE_CACHE=true`)
- [ ] Backend restarted
- [ ] Redis running and connected
- [ ] First request shows `X-Cache: MISS`
- [ ] Second request shows `X-Cache: HIT`
- [ ] Cache stats endpoint works
- [ ] Cache invalidation works (after create/update/delete)
- [ ] NoCache parameter works

---

## 📊 Expected Results

### Before Caching:
- Response time: 100-300ms (database query)
- Database queries: Every request

### After Caching:
- First request: 100-300ms (database query)
- Cached requests: **< 10ms** (Redis lookup)
- Database queries: **60-80% reduction**

---

## 🎯 Performance Monitoring

### Check Cache Hit Rate

Monitor the `X-Cache` header:
- High `HIT` rate = Good caching
- High `MISS` rate = May need longer TTL or more caching

### Monitor Cache Stats

```bash
GET /cache-stats
```

Returns Redis statistics and cache status.

---

## ⚠️ Troubleshooting

### Cache Not Working

**Check:**
1. `ENABLE_CACHE=true` in `.env`
2. Redis is running: `docker ps` (should show redis-yvi)
3. Redis connection: Check backend logs for "✅ Redis connected"
4. Backend restarted after `.env` change

### Cache Always MISS

**Possible Causes:**
1. Cache TTL too short
2. Different query parameters each request
3. User context changing
4. Cache being invalidated too frequently

**Solutions:**
- Increase `CACHE_TTL`
- Check query parameters
- Review invalidation logic

### Redis Connection Error

**Check:**
1. Redis container running: `docker start redis-yvi`
2. Redis host/port in `.env`: `REDIS_HOST=127.0.0.1`
3. Test Redis: `GET /redis-test`

---

## 🎊 Success Indicators

✅ **Cache is working if:**
- `X-Cache: HIT` appears on second request
- Response time significantly faster on cached requests
- `/cache-stats` shows cache enabled
- No errors in backend logs

---

*Phase 2 Setup Guide*
*Ready for Testing*




