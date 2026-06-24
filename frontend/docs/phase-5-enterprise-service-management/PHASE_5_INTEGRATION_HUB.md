# INTEGRATION HUB ARCHISTRY
# Enterprise Integrations Hub — Directory Connectors & External API Broker

This document details the database schema, connector structures, authentication strategy, sync engines, and security frameworks for the Integration Hub.

---

## 1. Database Schema Specifications (SQL)

The integration schemas manage connections, credentials, and sync logs:

```sql
-- Active External Connections
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN ('AZURE_AD', 'ACTIVE_DIRECTORY', 'GOOGLE_WORKSPACE', 'JIRA', 'SERVICENOW', 'SAP', 'ORACLE', 'SLACK', 'TEAMS')),
    
    -- Connection Configuration
    credentials JSONB NOT NULL,            -- encrypted oauth client secrets / api tokens
    settings JSONB DEFAULT '{}'::jsonb,    -- sync targets, mappings, filters
    
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sync Telemetry Logs
CREATE TABLE integration_sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connection_id UUID REFERENCES integration_connections(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUCCESS', 'FAILED')),
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for tenant isolation and connection history
CREATE INDEX idx_ic_tenant ON integration_connections(tenant_id, connector_type);
CREATE INDEX idx_isl_connection ON integration_sync_logs(connection_id, created_at DESC);
```

---

## 2. Connector Framework Architecture

The directory follows a unified pattern:
```
backend/src/modules/integration-hub/
├── integration.controller.js
├── integration.routes.js
├── integration-broker.service.js
├── connectors/
│   ├── base.connector.js            # Interface definitions
│   ├── azure-ad.connector.js
│   ├── google-workspace.connector.js
│   ├── jira.connector.js
│   ├── servicenow.connector.js
│   ├── sap.connector.js
│   ├── oracle.connector.js
│   ├── slack.connector.js
│   └── teams.connector.js
```

Each connector extends `BaseConnector` and implements standard operations:
* `testConnection()`: Ping verification check.
* `syncRecords()`: Perform user directory or ticket mapping synchronization.
* `handleWebhook()`: Inbound message handlers.

---

## 3. Auth, Webhooks, & Sync Engines

### OAuth 2.0 Management
All credentials stored in `integration_connections.credentials` are encrypted using **AES-256-GCM** with a system secret key.
* Access tokens are refreshed dynamically on boot using OAuth refresh tokens.

### Inbound Webhook Broker
Incoming webhook endpoints use generic paths:
* `/api/v1/integrations/webhook/:connection_id`
* Webhook requests validate signatures (e.g. Slack signature header validations) and enqueue execution payloads into BullMQ.

### Scheduled Sync Processing
Sync loops run on scheduled crons via BullMQ (`integration-sync-queue`).
* The engine queries external directories, compares user records against the local `employees` database, and applies changes (e.g. sync employee statuses).

---

## 4. Error Handling, Retries, and Recovery

* **Circuit Breaker Integration:** If a connector experiences 5 consecutive connection timeouts, its state is set to `SUSPENDED` in `integration_connections` to prevent downstream request delays.
* **Exponential Backoff Retries:** Failed webhook dispatches or directory synchronizations are retried up to 3 times before generating administrator failure notifications.
* **Telemetry Monitoring:** Sync metrics, duration, errors, and rates are written directly to `integration_sync_logs` for reporting purposes.

---

## 5. Security Safeguards

* **Network Tunneling Routing:** Outbound connection requests are routed through dedicated egress proxies with whitelisted static IP addresses.
* **Data Sanitization Sanitizer:** Incoming payloads from webhooks are parsed and sanitized before database writes.
* **IDOR Protection Gates:** Every connection setup request requires a validated `tenant_id` check before credentials saving.

---

## 6. Framework for Onboarding Future Connectors

Adding new external SaaS platforms (e.g., Salesforce, Workday) follows a simple plugin pattern:
1. **Extend Base Interface:** Create a new file under `connectors/` (e.g. `workday.connector.js`) extending `BaseConnector`.
2. **Registry Mapping:** Append the new string key option to the database enum check constraints.
3. **Register Route Handlers:** Declare the new client options in the Admin panel configurations.
