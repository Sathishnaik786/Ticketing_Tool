# Backend Environment Setup Guide

## 📋 Required Environment Variables

Create or update `backend/.env` file with the following:

### 🔧 Server Configuration
```bash
PORT=3003
NODE_ENV=development
```

### 🔐 Supabase Configuration
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 🔑 JWT Configuration
```bash
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure
```

### 🌐 Frontend URL
```bash
FRONTEND_URL=http://localhost:5173
```

### 🔴 Redis Configuration (Windows Docker)
```bash
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 🚀 Feature Flags
```bash
# Enable Redis for Socket.IO scaling (Phase 1)
ENABLE_SOCKET_REDIS=true

# Enable Redis caching (Phase 2 - keep false for now)
ENABLE_CACHE=false
```

### 📊 Optional Configuration
```bash
# Logging
LOG_LEVEL=info

# Cache TTL (seconds) - will be used in Phase 2
CACHE_TTL=300
```

---

## 📝 Complete .env Template

```bash
# ============================================
# SERVER CONFIGURATION
# ============================================
PORT=3003
NODE_ENV=development

# ============================================
# SUPABASE CONFIGURATION
# ============================================
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-secure

# ============================================
# FRONTEND URL
# ============================================
FRONTEND_URL=http://localhost:5173

# ============================================
# REDIS CONFIGURATION (Windows Docker)
# ============================================
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# FEATURE FLAGS
# ============================================
ENABLE_SOCKET_REDIS=true
ENABLE_CACHE=false

# ============================================
# OPTIONAL CONFIGURATION
# ============================================
LOG_LEVEL=info
CACHE_TTL=300
```

---

## ✅ Verification Steps

### 1. Check .env File Exists
```bash
cd backend
# On Windows PowerShell:
Test-Path .env
# Should return: True
```

### 2. Verify Redis Connection
After starting the server, check logs for:
```
✅ Redis connected
✅ Redis ready
```

### 3. Test Redis Endpoint
```bash
# In browser or Postman:
GET http://localhost:3003/redis-test

# Expected response:
{
  "redis": "ok",
  "status": "connected",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

---

## ⚠️ Important Notes

1. **Never commit .env to git** - It's already in .gitignore
2. **Use .env.example as template** - Copy and fill in your values
3. **Redis Password** - Leave empty for local Docker setup
4. **ENABLE_CACHE** - Keep `false` until Phase 2 implementation
5. **Redis Host** - Use `127.0.0.1` for Windows Docker (not `localhost`)

---

## 🐳 Redis Docker Setup Reference

If Redis container is not running:

```powershell
# Start existing container
docker start redis-yvi

# Or create new container (if needed)
docker run -d `
  --name redis-yvi `
  -p 6379:6379 `
  --restart unless-stopped `
  -v redis-data:/data `
  redis:7-alpine
```

---

*Environment Setup Guide*
*Last Updated: After Redis setup*




