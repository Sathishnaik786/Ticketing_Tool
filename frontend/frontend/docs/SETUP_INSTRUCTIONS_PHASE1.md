# Phase 1 Setup Instructions

## Overview
Phase 1 implements Redis setup, Socket.IO scaling, and real-time event broadcasting infrastructure.

## Prerequisites
1. Node.js installed (v18+)
2. Redis server (local or cloud)
3. Supabase project with database access

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install the new dependencies:
- `ioredis` - Redis client
- `@socket.io/redis-adapter` - Socket.IO Redis adapter

## Step 2: Set Up Redis

### Option A: Local Redis (Development)

**Windows:**
1. Download Redis from https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

**Mac:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### Option B: Redis Cloud (Production Recommended)

1. Sign up at https://redis.com/try-free/
2. Create a free database
3. Get connection details (host, port, password)

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` (if it doesn't exist) and add:

```bash
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Or for Redis Cloud:
# REDIS_HOST=your-redis-host.redislabs.com
# REDIS_PORT=12345
# REDIS_PASSWORD=your-redis-password
```

## Step 4: Run Database Indexes

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Open and run `backend/database/indexes.sql`
4. Verify indexes are created successfully

## Step 5: Test the Setup

### Test Redis Connection

```bash
cd backend
node -e "const {redis} = require('./src/lib/redis'); redis.ping().then(r => console.log('Redis connected:', r)).catch(e => console.error('Redis error:', e))"
```

Expected output: `Redis connected: PONG`

### Test Server Start

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Redis connected
✅ Redis ready
Server is actually listening on port 3003
Environment: development
WebSocket server initialized with Redis adapter
```

## Step 6: Verify Socket.IO Scaling

1. Start your backend server
2. Start your frontend application
3. Open multiple browser tabs/windows
4. Connect to the application from different tabs
5. Check server logs - should see connection messages

## Troubleshooting

### Redis Connection Error

**Error**: `Redis connection error`

**Solutions**:
1. Check if Redis server is running: `redis-cli ping` (should return PONG)
2. Verify Redis host/port in `.env`
3. Check firewall settings
4. For Redis Cloud, verify credentials

### Socket.IO Not Working

**Error**: WebSocket connections failing

**Solutions**:
1. Check CORS settings in `server.js`
2. Verify Redis is connected (check logs)
3. Check browser console for connection errors
4. Verify frontend Socket.IO client is using correct URL

### Database Index Errors

**Error**: Index creation fails

**Solutions**:
1. Check if indexes already exist (remove `IF NOT EXISTS` to see exact error)
2. Verify table names match your schema
3. Check Supabase SQL Editor for detailed error messages
4. Some indexes may already exist - this is OK

## Next Steps

After Phase 1 is complete:

1. ✅ Redis is connected
2. ✅ Socket.IO is using Redis adapter
3. ✅ Database indexes are created
4. ✅ Event service is ready

**Proceed to Phase 2**: Redis Caching Layer Implementation

## Notes

- Redis is optional but recommended for production scaling
- If Redis fails, the app will continue but Socket.IO won't scale horizontally
- Database indexes improve query performance by 3-5x
- Event service is ready to use in controllers (Phase 1.3)





