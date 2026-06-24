# PHASE 5 DEPLOYMENT RUNBOOK
# Enterprise Release Orchestration, Recovery Procedures, and Emergency Guide

This document defines staging, production, fallback, and disaster recovery steps for Phase 5.

---

## 1. Release Orchestration Lifecycle

### Step 1: Pre-Release Validation
1. Verify CI/CD pipeline builds successfully.
2. Confirm the staging environment has Redis connection parameters set.
3. Verify that the feature registry defaults all new entries to `is_globally_enabled = false`.

### Step 2: Database Migration Execution
Apply SQL migrations to the Supabase Postgres database.
```bash
npx supabase migration up --db-url "postgres://postgres:password@db.supabase.co:5432/postgres"
```

### Step 3: Service Deployment
1. Deploy Render Web service (`etms-api`) and Render Worker service (`etms-worker`).
2. Add environment secrets (`REDIS_URL`, `USE_BULLMQ_PROCESSING = true`).

---

## 2. Dynamic Rollback Runbooks

### 1. Database Schema Rollback
If a table migration causes database connection errors:
1. Stop the API services to close active connections.
2. Run database rollback scripts in reverse order (Step 7 down to Step 1).
3. Re-deploy the previous, stable backend image tag.
4. Restart the API servers.

### 2. Feature Flags Rollback
If a newly enabled service catalog dynamic form or automation rule causes high API latency or rendering errors:
1. Disable the target feature flag directly in the database registry table:
   ```sql
   UPDATE feature_registry SET is_globally_enabled = false, rollout_percentage = 0 WHERE key = 'esm.automation';
   ```
2. Trigger the dynamic cache invalidation by publishing a Pub/Sub message:
   ```bash
   redis-cli PUBLISH invalidation:features "esm.automation"
   ```
3. Verify that client requests immediately bypass the disabled features.

---

## 3. Disaster Recovery Protocols

### Redis Cluster Recovery
* **Failure Scenario:** Redis connection fails or runs out of memory.
* **Recovery Steps:**
  1. Set `ENABLE_REDIS` to `false` in the backend environment. This triggers the local `EventEmitter` event bus fallback.
  2. Restart the API servers to activate the fallback mode.
  3. Re-provision or upgrade the Redis cluster in Render.
  4. Once Redis is stable, set `ENABLE_REDIS` back to `true` and restart the backend services.

### BullMQ Queue Recovery
* **Failure Scenario:** Active queues stall or experience severe processing delays.
* **Recovery Steps:**
  1. Pause the target queue processing using the Admin console:
     ```javascript
     await myQueue.pause();
     ```
  2. Scale up the number of background worker threads in the Render Worker dashboard.
  3. Query failed jobs in the Dead Letter Queue (`failed:jobs:list`) to identify error codes.
  4. Fix the underlying issue (e.g. restart third-party SMTP servers).
  5. Resume the queue and trigger job retries for all pending items in the Dead Letter Queue.

### Emergency Database Recovery
* **Failure Scenario:** A critical migration script corrupts existing EMS records.
* **Recovery Steps:**
  1. Activate the system maintenance page immediately to block incoming requests.
  2. Initiate database restoration using the latest automated daily backup.
  3. Once the database is restored, query the `event_store` table to replay all transactions processed since the backup was taken, bringing the system back to its latest consistent state.
  4. Disable maintenance mode and notify users.
