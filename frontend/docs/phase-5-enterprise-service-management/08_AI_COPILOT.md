# 08 — AI Copilot Foundation
# Phase 5.0: Enterprise Service Management Platform

---

## 1. Overview

The current AiAssistPanel is a fully mocked, client-side simulation. Phase 5.0 replaces this with a production AI architecture integrating a real LLM backend with RAG (Retrieval-Augmented Generation) against the knowledge base, a feedback loop, governance controls, and cost management.

---

## 2. AI Feature Set

| Feature | Description | Priority |
|---|---|---|
| Ticket Summarization | Auto-generate 2–3 sentence summary of ticket + comments | P0 |
| Response Suggestions | 2–3 contextual reply templates per ticket | P0 |
| Knowledge Suggestions | Surface relevant KB articles during ticket view | P0 |
| Duplicate Detection | Identify similar open tickets | P0 |
| Ticket Classification | Suggest category, subcategory, department | P1 |
| Priority Prediction | Predict appropriate priority from description | P1 |
| Sentiment Analysis | Real-time tone detection (Frustrated/Neutral/Positive) | P1 |
| Risk Detection | Flag high-risk tickets (VIP user, security, compliance) | P1 |
| Executive Insights | Natural language Q&A over dashboard data | P2 |

---

## 3. AI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI COPILOT SERVICE                          │
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────┐                   │
│  │  Request Router │────►│  Context Builder │                   │
│  └─────────────────┘     └────────┬────────┘                   │
│                                   │                            │
│              ┌────────────────────┼────────────────┐           │
│              ▼                    ▼                ▼           │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐     │
│  │  Embedding Layer │  │  Prompt Builder  │  │  Cache   │     │
│  │  (pgvector RAG)  │  │                  │  │  (Redis) │     │
│  └─────────┬────────┘  └────────┬─────────┘  └──────────┘     │
│            │                    │                              │
│            └──────────┬─────────┘                             │
│                       ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              LLM Provider Abstraction Layer              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │  │  Vertex AI   │  │   OpenAI     │  │  Anthropic   │  │  │
│  │  │  (primary)   │  │  (fallback)  │  │  (optional)  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                       │                                        │
│                       ▼                                        │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Response Processor + Validator              │  │
│  │  Safety filter → Format → Cache → Log → Return          │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Schema

```sql
-- AI suggestion records
CREATE TABLE ai_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  entity_type     VARCHAR(100) NOT NULL,    -- 'ticket' | 'service_request'
  entity_id       UUID NOT NULL,
  suggestion_type VARCHAR(100) NOT NULL,
  -- 'summary' | 'response' | 'classification' | 'priority' | 'duplicate'
  -- 'sentiment' | 'knowledge' | 'risk'
  model_id        VARCHAR(100) NOT NULL,    -- 'gemini-1.5-pro' | 'gpt-4o'
  prompt_version  VARCHAR(50) NOT NULL,     -- For A/B testing + rollback
  input_tokens    INTEGER,
  output_tokens   INTEGER,
  latency_ms      INTEGER,
  confidence      NUMERIC,                  -- 0.0–1.0
  content         JSONB NOT NULL,           -- Suggestion payload (type-specific)
  -- For 'response': { suggestions: ['...', '...'] }
  -- For 'classification': { category: '...', confidence: 0.87 }
  -- For 'duplicate': { ticket_ids: ['uuid1', 'uuid2'], similarity_scores: [0.92, 0.85] }
  cache_hit       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback on suggestions
CREATE TABLE ai_feedback (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id   UUID NOT NULL REFERENCES ai_suggestions(id),
  user_id         UUID NOT NULL REFERENCES employees(id),
  feedback_type   VARCHAR(50) NOT NULL,     -- 'accepted' | 'rejected' | 'modified'
  applied_content TEXT,                     -- If modified/accepted, what was used
  rating          SMALLINT CHECK (rating BETWEEN 1 AND 5),
  comment         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AI interaction audit log
CREATE TABLE ai_interactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL,
  user_id         UUID REFERENCES employees(id),
  interaction_type VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(100),
  entity_id       UUID,
  model_id        VARCHAR(100),
  input_tokens    INTEGER NOT NULL DEFAULT 0,
  output_tokens   INTEGER NOT NULL DEFAULT 0,
  cost_usd        NUMERIC(10, 6),           -- Estimated cost
  success         BOOLEAN NOT NULL DEFAULT TRUE,
  error           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge base embeddings (pgvector)
CREATE TABLE kb_embeddings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id      UUID NOT NULL,            -- FK to knowledge_articles
  chunk_index     INTEGER NOT NULL,
  chunk_text      TEXT NOT NULL,
  embedding       VECTOR(1536),             -- OpenAI ada-002 | Vertex text-embedding-004
  model_id        VARCHAR(100) NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(article_id, chunk_index)
);

-- Vector similarity index
CREATE INDEX idx_kb_embeddings_vector ON kb_embeddings USING ivfflat (embedding vector_cosine_ops);

-- Prompt templates (versioned)
CREATE TABLE ai_prompt_templates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(255) NOT NULL UNIQUE,
  version         VARCHAR(50) NOT NULL,
  feature         VARCHAR(100) NOT NULL,
  system_prompt   TEXT NOT NULL,
  user_prompt_template TEXT NOT NULL,
  max_tokens      INTEGER NOT NULL DEFAULT 512,
  temperature     NUMERIC NOT NULL DEFAULT 0.3,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_ai_suggestions_entity ON ai_suggestions(entity_type, entity_id);
CREATE INDEX idx_ai_feedback_suggestion ON ai_feedback(suggestion_id);
CREATE INDEX idx_ai_interactions_tenant ON ai_interactions(tenant_id, created_at DESC);
```

---

## 5. RAG Architecture (Knowledge Base)

### Ingestion Pipeline
```
KB Article Created/Updated
  │
  ▼
Text chunker (500 token chunks, 50 token overlap)
  │
  ▼
Embedding model (text-embedding-004 or ada-002)
  │
  ▼
Store chunks + vectors in kb_embeddings
```

### Query Pipeline (at ticket view)
```
Ticket title + description (first 500 chars)
  │
  ▼
Generate query embedding
  │
  ▼
Vector similarity search: SELECT ... ORDER BY embedding <=> $query_embedding LIMIT 5
  │
  ▼
Return top 5 most relevant KB chunks with metadata
  │
  ▼
Include in LLM prompt context for response suggestions
```

---

## 6. Prompt Design

### Summary Prompt
```
System: You are an IT service desk AI assistant. Generate concise, professional summaries.

User: Summarize this support ticket in 2-3 sentences.
Title: {ticket_title}
Description: {ticket_description}
Recent Comments: {last_3_comments}
Category: {category}
Priority: {priority}
```

### Response Suggestion Prompt
```
System: You are an IT service desk assistant. Suggest 2 professional, empathetic replies.
Relevant Knowledge Base Context: {rag_chunks}

User: Suggest 2 replies for this ticket.
Title: {ticket_title}
Summary: {ai_summary}
Status: {status}
Requester: {requester_name}
```

### Classification Prompt
```
System: You are an ITSM classifier. Output valid JSON only.

User: Classify this ticket.
Title: {title}
Description: {description}
Available categories: {category_list}
Available departments: {department_list}

Output: {"category": "...", "department": "...", "priority": "P1|P2|P3|P4", "confidence": 0.0-1.0}
```

---

## 7. LLM Provider Abstraction

```javascript
// ai-copilot/llm-provider.service.js

class LLMProviderService {
  async complete(request) {
    const provider = this.selectProvider(request);
    try {
      return await provider.complete(request);
    } catch (primaryError) {
      // Fallback to secondary provider
      return await this.fallbackProvider.complete(request);
    }
  }

  selectProvider(request) {
    // Route based on feature + cost + latency requirements
    if (request.feature === 'executive_insights') return this.vertexProvider;
    if (request.requiresLowLatency) return this.openaiProvider;
    return this.primaryProvider; // Default: Vertex AI
  }
}
```

---

## 8. Cost Controls

| Control | Implementation |
|---|---|
| **Token limits** | Max 1,000 input tokens per request |
| **Request caching** | Cache responses for identical inputs (24h TTL) |
| **Rate limiting** | Max 10 AI requests/minute per user |
| **Feature flags** | Each AI feature independently togglable |
| **Budget alerts** | Alert when daily cost > threshold |
| **Tenant quotas** | Max tokens/day per tenant (configurable) |

---

## 9. AI Governance & Safety

| Control | Implementation |
|---|---|
| **PII Scrubbing** | Strip email, phone, SSN from prompts before sending to LLM |
| **Content Filtering** | Validate LLM output against safety categories |
| **Audit Trail** | All AI interactions logged in `ai_interactions` |
| **Feedback Loop** | User accept/reject feedback stored for model improvement |
| **Hallucination Detection** | Low-confidence responses show disclaimer |
| **Data Residency** | Option to use on-premise or regional LLM endpoints |

---

## 10. API Contracts

```
POST /api/v2/ai/summarize                Summarize a ticket
POST /api/v2/ai/suggest-responses        Response suggestions
POST /api/v2/ai/suggest-knowledge        Knowledge base suggestions
POST /api/v2/ai/classify                 Classify ticket (category/priority)
POST /api/v2/ai/detect-duplicates        Find duplicate tickets
POST /api/v2/ai/analyze-sentiment        Sentiment analysis

POST /api/v2/ai/feedback                 Submit feedback on suggestion
GET  /api/v2/ai/feedback/stats           Acceptance rates by feature

GET  /api/v2/ai/usage                    Usage + cost analytics (ADMIN)
```

---

## 11. Feature Flag

```
VITE_ENABLE_AI_COPILOT=true
ENABLE_AI_COPILOT=true           # backend
AI_PROVIDER=vertex               # vertex | openai | anthropic
AI_FALLBACK_PROVIDER=openai
```
