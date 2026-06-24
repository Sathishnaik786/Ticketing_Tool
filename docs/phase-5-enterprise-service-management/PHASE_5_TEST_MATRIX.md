# PHASE 5 TEST MATRIX
# Enterprise Service Management Platform — Testing Verification Matrix

---

## 1. Test Levels & Coverage Targets

```
┌─────────────────────────────────────────────────────────────┐
│                       TEST MATRIX                           │
│                                                             │
│  ┌────────────────────────┐    ┌────────────────────────┐  │
│  │       UNIT TESTS       │    │   INTEGRATION TESTS    │  │
│  │   Vitest (JS/TS Files) │    │  Supertest (Express)   │  │
│  │   - Calculations       │    │  - DB Transactions     │  │
│  │   - Condition Parsing  │    │  - Queue Scheduling    │  │
│  └────────────────────────┘    └────────────────────────┘  │
│  ┌────────────────────────┐    ┌────────────────────────┐  │
│  │       E2E TESTS        │    │     SECURITY TESTS     │  │
│  │ Playwright (Full User)  │    │   Axe-Core & RLS       │  │
│  │   - Workflow builder   │    │   - SSRF checks        │  │
│  │   - Catalog requests   │    │   - IDOR prevention    │  │
│  └────────────────────────┘    └────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Test Specifications by Component

### Unit Tests (Vitest)
* **Workflow Engine:** Mock state transitions. Verify that if a step condition is met (e.g., approval status == APPROVED), the engine returns the correct next node ID.
* **SLA Calculation:** Verify that target dates map correctly based on priority level input (LOW, MEDIUM, HIGH, URGENT).
* **Automation Parser:** Assert condition parser returns correct boolean for string comparisons and integer thresholds.

### Integration Tests (Supertest)
* **API Routing & Gates:** Verify new routes reject access for roles without active authorization parameters.
* **Database State Isolation:** Verify that calling the Service Request submission endpoint successfully writes configuration files without altering existing HR employee tables.
* **BullMQ Jobs:** Verify jobs are correctly enqueued in Redis when ticket triggers fire.

### End-to-End Tests (Playwright)
* **Workflow Builder:** Simulates clicking step boxes, linking conditions, and saving configurations.
* **Service Request Submission:** Simulates an employee navigating to the Catalog, filling out dynamic fields (e.g. computer selection), and submitting. Asserts ticket status updates.
* **Executive Telemetry Page:** Verifies that dashboard charts, graphs, and export modals load without layout degradation.

### Security Vulnerability Tests
* **SSRF Target Validation:** Test endpoint against payload injection using private IP schemas to verify outgoing calls are blocked.
* **IDOR Validation:** Test GET request for workflows using random resource UUIDs, confirming requests are rejected with a 403 status.
* **RLS Coverage Check:** Script executing direct database operations as anonymous users, asserting that all operations are blocked.

### Performance Load Tests (k6 / autocannon)
* **Queue Latency Load:** Simulate 50 concurrent ticket creation actions, measuring worker execution delays.
* **Reporting Aggregation Stress:** Execute aggregate view queries during a simulated database write storm, asserting MTTR calculation time stays below 2 seconds.

### Accessibility Tests (Axe-Core / Vitest-Axe)
* **Visual Screens:** Validate that workflow builders, SLA timers, and analytics dashboards maintain a clear heading structure and contrast standards.
* **Interactive Controls:** Ensure drag-and-drop elements in builders and input fields on forms remain focusable and operable via standard keyboard triggers.
