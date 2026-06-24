# PHASE 5 ENTERPRISE FEATURE REGISTRY & FLAGS
# Dynamic Rollout Configurations, Percentages, and Licensing Gates

This document defines the schema, configurations, and rollout runbooks for the feature flags registry.

---

## 1. Feature Registry Database Schema (SQL)

To replace simple static configuration variables, the feature registry utilizes a relational schema to manage rollouts dynamically:

```sql
-- Centralized Dynamic Feature Control Registry
CREATE TABLE feature_registry (
    key VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_globally_enabled BOOLEAN DEFAULT false,
    
    -- Multi-Dimensional Rollout Rules
    enabled_tenant_ids UUID[] DEFAULT '{}',        -- specific tenants whitelisted
    enabled_department_ids UUID[] DEFAULT '{}',    -- specific departments whitelisted
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    target_environments VARCHAR(50)[] DEFAULT '{development}', -- 'development', 'staging', 'production'
    
    -- Enterprise Licensing Gates
    required_license_tier VARCHAR(50) DEFAULT 'STANDARD' CHECK (required_license_tier IN ('STANDARD', 'ENTERPRISE', 'ULTIMATE')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Initial Registry Configs
INSERT INTO feature_registry (key, name, description, is_globally_enabled, target_environments, required_license_tier) VALUES
('esm.workflow', 'Workflow Engine', 'Process orchestration step runner', false, '{development,staging}', 'ENTERPRISE'),
('esm.sla', 'SLA Engine', 'Response and resolution targets calculations cron', false, '{development,staging}', 'ENTERPRISE'),
('esm.catalog', 'Service Catalog', 'Dynamic inputs self-service portal', false, '{development,staging}', 'STANDARD'),
('esm.automation', 'Automation Engine', 'Asynchronous trigger-condition-actions compiler', false, '{development}', 'ENTERPRISE'),
('esm.analytics', 'Executive Analytics', 'Star schema data reporting dashboard', false, '{development}', 'ULTIMATE'),
('esm.integrations', 'Integration Hub', 'SaaS connectors directory (AD, Jira, Slack, Teams)', false, '{development}', 'ULTIMATE');
```

---

## 2. Caching & Lookup Strategy

1. **Redis Caching Wrapper:** Feature configs are loaded into Redis on boot using key hash `cache:features`.
2. **Evaluation Logic:** To verify if user $U$ (tenant $T$, department $D$) can access feature $F$:
   * If `is_globally_enabled` is true AND environment matches, return `true`.
   * If $T$ exists in `enabled_tenant_ids`, return `true`.
   * If $D$ exists in `enabled_department_ids`, return `true`.
   * If `rollout_percentage` matches:
     $$\text{hash}(T.id + F.\text{key}) \pmod{100} < \text{rollout\_percentage} \implies \text{true}$$
   * Otherwise, return `false`.

---

## 3. Rollout & Rollback Procedures

### Rollout Lifecycle

```
[ DEVELOPMENT ] ──► [ STAGING ] ──► [ CANARY (10%) ] ──► [ TENANT GA ] ──► [ GLOBAL GA ]
  (Dev Flags)        (Staging Flags)  (Percentage Rollout) (Enterprise BU)   (Globally Enabled)
```

1. **Deployment Phase:** Rules default to `is_globally_enabled = false` and `target_environments = '{development,staging}'`.
2. **Staging Approval:** Enable for staging verification.
3. **Canary Rollout (Percentage):** Set `rollout_percentage = 10` in Production to query early adopters' performance.
4. **General Availability (GA):** Set `is_globally_enabled = true`.

### Emergency Rollback Procedures
If a newly enabled feature causes database load spikes or system exceptions:
1. **Immediate Invalidation (API / DB):** Execute DB update:
   ```sql
   UPDATE feature_registry SET is_globally_enabled = false, rollout_percentage = 0 WHERE key = 'esm.sla';
   ```
2. **Publish Cache Clear Event:** Trigger Redis Pub/Sub signal `invalidation:features` to clear API server node memory pools.
3. **Frontend Recovery:** Client applications fetch the latest state on the next request, hiding all entry points immediately.
