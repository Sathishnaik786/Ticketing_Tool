# NOTIFICATION FRAMEWORK ARCHITECTURE
# Centralized Multi-Channel Notification Broker

This document outlines the system architecture, database schemas, and delivery strategies for the centralized notification framework.

---

## 1. Notification Templates & Channel Registry

The platform manages delivery across six primary communication channels:
1. **IN_APP:** UI websocket notifications stored in-database.
2. **EMAIL:** Rich HTML transactional emails (via SendGrid/AWS SES).
3. **SMS:** Text message alerts for urgent notifications (via Twilio).
4. **WHATSAPP:** Interactive notifications (via Twilio/Meta Business API).
5. **SLACK:** Webhook integration to post updates in channels or via direct message.
6. **TEAMS:** Adaptive Cards delivered to Microsoft Teams channels.

---

## 2. Database Schema Definitions (SQL)

```sql
-- Template Registry
CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'TICKET_ASSIGNED', 'SLA_BREACHED'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'SLACK', 'TEAMS')),
    subject_template VARCHAR(255),
    body_template TEXT NOT NULL,      -- supports Mustache style markup: {{ticket_id}}
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Active Delivery Channels Configuration
CREATE TABLE notification_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'EMAIL', 'SLACK', etc.
    configuration JSONB DEFAULT '{}'::jsonb, -- stores API keys, webhook URLs securely
    is_enabled BOOLEAN DEFAULT true,
    rate_limit_per_min INTEGER DEFAULT 120
);

-- User Notification Preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    template_key VARCHAR(100) REFERENCES notification_templates(key) ON DELETE CASCADE,
    enabled_channels VARCHAR(50)[] NOT NULL DEFAULT '{IN_APP,EMAIL}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_template_pref UNIQUE (user_id, template_key)
);

-- Delivery Verification Log
CREATE TABLE notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES auth.users(id),
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'FAILED', 'RETRIED')),
    payload JSONB,
    attempts INTEGER DEFAULT 1,
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_ndl_recipient ON notification_delivery_logs(recipient_id, created_at DESC);
CREATE INDEX idx_ndl_status ON notification_delivery_logs(status) WHERE status = 'PENDING';
```

---

## 3. Template Engine Architecture

The framework uses an event-driven template compiler:
* **Event Dispatch:** Business processes dispatch notification requests using `NotificationBroker.send(recipientId, templateKey, dataPayload)`.
* **Preferences Validation:** The broker resolves recipient preferences from `notification_preferences`.
* **Template Parsing:** It compiles the templates matching target channels using a Mustache parser engine, translating variables like `{{ticket_title}}` or `{{assigned_agent}}`.
* **Job Enqueueing:** The compiled payload is enqueued into the BullMQ `notification-dispatch-queue` with a specific channel worker.

---

## 4. Operational Strategy

### Retry Strategy & Exponential Backoff
Failed deliveries (due to network drops, vendor outages, or rate-limits) are retried automatically using exponential backoff inside BullMQ:
$$\text{Delay} = \text{BaseDelay (10s)} \times 2^{\text{AttemptNumber} - 1}$$
Maximum retry limit is set to 3. If a job fails on all attempts, its status is updated to `FAILED` in the delivery logs, and the error details are recorded.

### Failure Handling
* If a critical channel (like SMS or Email) fails after all retries, the broker falls back to sending an `IN_APP` message to ensure the user receives the alert.
* Critical failures write alerts directly to the system logs, notifying site administrators.

### Rate Limiting Protection
To prevent account lockouts and high provider bills:
* Implement sliding window token bucket checks in Redis before making API requests.
* Group notifications (e.g. sending 1 digest email for multiple quick comments rather than sending separate emails for each).

### System Audit Integration
Any changes made to templates, channel configurations, or user preference settings write immutable entries to `system_audit_logs`, tracking the operator ID, time, and modified properties.
