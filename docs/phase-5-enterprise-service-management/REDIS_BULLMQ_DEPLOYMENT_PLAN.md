# REDIS & BULLMQ DEPLOYMENT PLAN
# Infrastructure Provisioning, Environment Variables, and Fallback Strategies

This document defines the deployment plan for provisioning Redis and BullMQ across development, staging, and production environments, referencing the hosting configuration in `render.yaml`.

---

## 1. Hosting Architecture & Current State

### Current State (`render.yaml`):
* The main backend is configured as a Render Web Service (`etms-api`).
* The Redis cluster definition block is commented out:
  ```yaml
  # - type: redis
  #   name: etms-redis
  #   plan: starter
  #   maxmemoryPolicy: allkeys-lru
  ```
* Environment flags default to:
  * `ENABLE_REDIS = "false"`
  * `ENABLE_CACHE = "false"`

---

## 2. Environment Configurations

### Development Environment
* **Infrastructure:** Local Redis instance running inside Docker on developer machines.
* **Connection String:** `REDIS_URL=redis://127.0.0.1:6379`.
* **Deployment Pattern:** Single-instance local processing.

### Staging Environment
* **Infrastructure:** Render Redis starter instance.
* **Connection String:** Set via Render environment variables binding: `REDIS_URL` reference pointing to the internal Redis service address.
* **Deployment Pattern:** Combined API & Worker process thread.

### Production Environment
* **Infrastructure:** Render Redis cluster instance with Maxmemory policy set to `noeviction` (to prevent job loss) or `allkeys-lru` for caching, backed by persistent volume backups.
* **Connection String:** Configured via Render environment secrets manager (`REDIS_URL`).
* **Deployment Pattern:** Split processes.
  1. **Web Service (`etms-api`):** Processes client API requests and enqueues jobs (BullMQ `Queue`).
  2. **Worker Service (`etms-worker`):** Node process dedicated to running workers (BullMQ `Worker`), avoiding client thread execution delays.

---

## 3. Environment Variables Configuration

Deploy the following configurations in Render dashboard env panels:

```bash
# Core Redis Flags
ENABLE_REDIS=true
REDIS_URL=redis://red-xxxxxxxxx:6379   # Render internal address
REDIS_MAX_CONNECTIONS=50

# BullMQ Operational Control
USE_BULLMQ_PROCESSING=true
CONCURRENCY_WORKFLOWS=5
CONCURRENCY_NOTIFICATIONS=10
CONCURRENCY_SLA=2
```

---

## 4. Fallback Strategy (In-Memory Processing Mode)

To allow the application to function in local environments or testing sandboxes without a running Redis server:
* If `ENABLE_REDIS` is set to `"false"` or no connection is established:
  * The system falls back to an **In-Memory Event Bus Mode**.
  * The `Queue` and `Worker` classes are stubbed out using standard Node.js `EventEmitter` listeners.
  * Trigger events execute sequentially in-process. *Note:* SLA repeatable checks run using standard `setInterval` timers inside the Express server thread instead of BullMQ crons.

```
                  ┌──────────────────────────────┐
                  │      Is Redis Enabled?       │
                  └──────────────┬───────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   │                           │
              YES  ▼                      NO   ▼
       ┌───────────────┐               ┌───────────────┐
       │ Use Redis +   │               │ Fallback to   │
       │ BullMQ Queues │               │ EventEmitter  │
       └───────────────┘               └───────────────┘
```

---

## 5. Failure Recovery Protocols

* **Connection Drop Protection:** If the Redis client disconnects, `ioredis` automatically initiates retry attempts (retrying every 2 seconds). The client logs warnings to the monitoring console.
* **Queue Persistence:** If the Redis server crashes and restarts, BullMQ retrieves jobs from the persistent Redis database file (`dump.rdb`) to resume execution.
* **Memory Exhaustion Guard:** The Redis cluster is configured with a memory threshold limit alert. If capacity exceeds 85%, the system drops historical reporting aggregates from the cache but retains all active queues.
