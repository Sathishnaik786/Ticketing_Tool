# 20 — UAT Checklist
# Phase 5.0: Enterprise Service Management Platform

---

## 1. UAT Overview

**Purpose:** Verify that Phase 5.0 features meet business requirements from the perspective of real end users before general availability.

**UAT Participants:**

| Role | Persona | Validates |
|---|---|---|
| IT Admin | "Alex" | Workflow builder, SLA policies, automation rules, AI settings |
| IT Manager | "Priya" | Executive dashboards, approvals, SLA analytics, capacity planning |
| IT Agent | "Sam" | Ticket AI panel, SLA timers, workflow step approvals |
| Employee | "Jordan" | Service catalog, request submission, request tracking |
| HR Manager | "Divya" | Payroll unchanged, new HR catalog items, department reports |
| Auditor | "Chris" | Audit log completeness, data integrity, report export |

---

## 2. UAT Checklist — Phase 5.0: Workflow Engine

### WF-01: Create a Simple Workflow
- [ ] Admin navigates to `/app/admin/workflows`
- [ ] Admin clicks "New Workflow"
- [ ] Admin names it "Access Request" and selects trigger "Ticket Created"
- [ ] Admin drags 3 APPROVAL steps onto the canvas
- [ ] Admin names steps: "Manager Approval", "Security Approval", "IT Approval"
- [ ] Admin connects steps in sequence
- [ ] Admin configures each step with an approver role
- [ ] Admin clicks "Save Draft" → sees success toast
- [ ] Admin clicks "Publish" → workflow status shows "Active"
- [ ] **Pass Criteria:** Workflow visible in list with status "Active"

### WF-02: Workflow Execution via Ticket
- [ ] Employee creates a ticket with category "Access Request"
- [ ] Agent views ticket → sees "Workflow in Progress" panel
- [ ] Panel shows current step: "Manager Approval — Pending"
- [ ] Manager receives in-app notification to approve
- [ ] Manager clicks "Approve" → step advances
- [ ] "Security Approval" becomes the current step
- [ ] After all approvals → ticket workflow shows "Completed"
- [ ] **Pass Criteria:** All 3 steps executed in sequence; ticket reaches completion

### WF-03: Workflow Rejection
- [ ] Repeat WF-02 setup
- [ ] Manager rejects with reason "Access not justified"
- [ ] Ticket workflow shows "Rejected" status
- [ ] Employee receives notification with rejection reason
- [ ] **Pass Criteria:** Rejection halts workflow; requester notified

### WF-04: Workflow Step Timeout Escalation
- [ ] Create a workflow with a 1-minute step timeout (test-only config)
- [ ] Start execution; do NOT approve within 1 minute
- [ ] Escalation job triggers
- [ ] Step escalated to higher approver
- [ ] Escalation notification delivered
- [ ] **Pass Criteria:** Escalation fires within 2 minutes of timeout

### WF-05: Workflow Version History
- [ ] Admin edits an active workflow (creates draft)
- [ ] Admin publishes new version (v2)
- [ ] Version history drawer shows v1 and v2
- [ ] Admin views v1 definition — matches original
- [ ] **Pass Criteria:** Version history accurate and viewable

---

## 3. UAT Checklist — Phase 5.0: SLA Engine

### SLA-01: SLA Policy Creation
- [ ] Admin navigates to `/app/admin/sla`
- [ ] Admin creates new policy "Standard IT SLA"
- [ ] Admin sets P1: Response 30min, Resolution 4h
- [ ] Admin sets P2: Response 1h, Resolution 8h
- [ ] Admin sets P3: Response 4h, Resolution 24h
- [ ] Admin sets P4: Response 8h, Resolution 72h
- [ ] Admin marks policy as default
- [ ] Admin saves → policy appears in list
- [ ] **Pass Criteria:** Policy created with all 4 priority targets

### SLA-02: SLA Applied to New Ticket
- [ ] Agent creates a P1 (Critical) ticket
- [ ] Agent opens ticket detail
- [ ] SLA panel shows: Response Due: [30 min from now], Resolution Due: [4h from now]
- [ ] SLA countdown timer is counting down
- [ ] **Pass Criteria:** SLA timer visible and accurate

### SLA-03: SLA Warning State
- [ ] Set response target to 2 minutes (test config)
- [ ] Create P1 ticket; wait 1.5 minutes (75% threshold)
- [ ] SLA panel changes color to amber/warning state
- [ ] Agent receives in-app SLA warning notification
- [ ] **Pass Criteria:** Warning triggered at 75% elapsed

### SLA-04: SLA Breach Detection
- [ ] Continue from SLA-03; wait past 2 minutes
- [ ] SLA panel changes to red/breached state
- [ ] SLA breach record created (visible in admin analytics)
- [ ] Agent + Manager receive breach notification
- [ ] **Pass Criteria:** Breach detected within 2 minutes of due time

### SLA-05: SLA Pause on Pending Status
- [ ] Create ticket with active SLA
- [ ] Agent changes status to "Pending User"
- [ ] SLA timer pauses (no longer counting down)
- [ ] Agent changes status back to "In Progress"
- [ ] SLA due date extended by pause duration
- [ ] **Pass Criteria:** Timer pauses and extends correctly

### SLA-06: SLA Analytics Dashboard
- [ ] Manager navigates to `/app/analytics/sla`
- [ ] Compliance percentage displayed
- [ ] Breach table shows today's breaches
- [ ] 30-day trend chart renders
- [ ] Date range filter works (Last 7d / 30d / 90d)
- [ ] **Pass Criteria:** All widgets load; data matches expected

---

## 4. UAT Checklist — Phase 5.1: Service Catalog

### CAT-01: Browse Service Catalog
- [ ] Employee navigates to `/app/service-catalog`
- [ ] Categories visible: IT Access, IT Hardware, HR Services, etc.
- [ ] Employee clicks "IT Hardware" category
- [ ] "Laptop Request" item visible with icon and description
- [ ] Employee searches for "access" → "VPN Access" item appears
- [ ] **Pass Criteria:** Catalog loads, category filter works, search works

### CAT-02: Submit a Service Request
- [ ] Employee clicks "Laptop Request"
- [ ] Item detail page shows description + estimated SLA
- [ ] Employee clicks "Request This Service"
- [ ] Dynamic form renders with: Device Type (dropdown), Justification (textarea), Delivery Date (date)
- [ ] "Device Type = Laptop" shows additional field "Memory Size"
- [ ] Employee fills form and clicks "Submit"
- [ ] Success: redirected to My Requests page with request number SR-xxxxx
- [ ] Confirmation notification received
- [ ] **Pass Criteria:** Request submitted; SR number assigned; linked ticket created

### CAT-03: Request Form Validation
- [ ] Employee submits form with empty required fields
- [ ] Validation errors shown inline per field
- [ ] Employee cannot proceed without filling required fields
- [ ] **Pass Criteria:** Validation prevents submission with clear error messages

### CAT-04: Track My Requests
- [ ] Employee navigates to `/app/service-requests/my`
- [ ] Submitted request visible with: SR number, catalog name, status, submitted date
- [ ] Employee clicks request → detail page shows current workflow step
- [ ] **Pass Criteria:** Request tracking visible and accurate

### CAT-05: Admin Manages Catalog
- [ ] Admin navigates to `/app/admin/catalog`
- [ ] Admin creates new category "Finance Services"
- [ ] Admin creates new catalog item "Purchase Order" in that category
- [ ] Admin attaches a form with 3 fields
- [ ] Admin marks item as featured
- [ ] Item appears in catalog home featured section
- [ ] **Pass Criteria:** New catalog item visible to employees immediately

---

## 5. UAT Checklist — Phase 5.1: Automation Engine

### AUTO-01: Create an Automation Rule
- [ ] Admin navigates to `/app/admin/automation`
- [ ] Admin clicks "New Rule"
- [ ] Admin names rule "Auto-assign Critical IT Tickets"
- [ ] Admin selects trigger: "Ticket Created"
- [ ] Admin adds condition: Priority = CRITICAL
- [ ] Admin adds condition: Department = IT
- [ ] Admin adds action: Assign to Group "Network Team"
- [ ] Admin saves rule → status: Active
- [ ] **Pass Criteria:** Rule created and visible in list

### AUTO-02: Rule Fires Correctly
- [ ] Create a CRITICAL IT ticket (matching conditions)
- [ ] Wait 5 seconds
- [ ] Ticket now shows assignee group: "Network Team"
- [ ] Automation log entry visible for this rule
- [ ] **Pass Criteria:** Ticket auto-assigned; log entry created

### AUTO-03: Rule Condition NOT Met — No Action
- [ ] Create a HIGH priority IT ticket (not CRITICAL)
- [ ] Wait 5 seconds
- [ ] Ticket NOT auto-assigned
- [ ] No automation log entry for this rule
- [ ] **Pass Criteria:** Rule did not fire for non-matching ticket

### AUTO-04: Rule Test Mode
- [ ] Admin opens "Auto-assign Critical IT Tickets" rule
- [ ] Admin clicks "Test Rule"
- [ ] Modal shows last 10 tickets with MATCHED / NOT MATCHED labels
- [ ] CRITICAL IT tickets show MATCHED; others show NOT MATCHED
- [ ] **Pass Criteria:** Test mode accurately simulates rule

### AUTO-05: Disable/Enable Rule
- [ ] Admin toggles rule to "Inactive"
- [ ] Create a CRITICAL IT ticket
- [ ] Ticket NOT auto-assigned (rule is off)
- [ ] Admin re-enables rule
- [ ] Next CRITICAL IT ticket IS auto-assigned
- [ ] **Pass Criteria:** Enable/disable works immediately

---

## 6. UAT Checklist — Phase 5.2: Executive Intelligence

### EXE-01: Executive Command Dashboard
- [ ] Manager navigates to `/app/executive/command`
- [ ] KPI scorecard loads: MTTR, SLA %, Open tickets, Resolved today
- [ ] All values non-zero (or appropriate empty state shown)
- [ ] SLA 30-day sparkline renders
- [ ] Dashboard loads in < 3 seconds
- [ ] **Pass Criteria:** All KPI widgets load with correct data

### EXE-02: Department Performance
- [ ] Manager navigates to `/app/executive/departments`
- [ ] Department table shows: Department, Ticket Volume, MTTR, SLA %
- [ ] Sortable by any column
- [ ] Manager only sees their own department if scoped
- [ ] **Pass Criteria:** Department data accurate and filterable

### EXE-03: Download Report
- [ ] Admin navigates to `/app/executive/command`
- [ ] Admin clicks "Download Report" (PDF)
- [ ] System generates report (< 30 seconds)
- [ ] PDF downloaded successfully
- [ ] PDF contains correct KPI data for selected period
- [ ] **Pass Criteria:** PDF download works; data matches dashboard

---

## 7. UAT Checklist — Phase 5.3: AI Copilot

### AI-01: Ticket Summary
- [ ] Agent opens any ticket with description > 3 sentences
- [ ] AI panel visible on right side
- [ ] "Summary" tab shows 2–3 sentence summary
- [ ] Summary loads in < 5 seconds
- [ ] Summary is factually accurate to ticket content
- [ ] **Pass Criteria:** Summary generated; accurate; timely

### AI-02: Response Suggestions
- [ ] Agent opens "Suggestions" tab on any open ticket
- [ ] 2 draft responses shown
- [ ] Agent clicks "Use This" on first suggestion
- [ ] Reply composer populated with suggested text
- [ ] Agent clicks 👍 feedback button
- [ ] **Pass Criteria:** Suggestion useful; copy-to-composer works; feedback saved

### AI-03: Knowledge Suggestions
- [ ] Agent opens "Knowledge" tab
- [ ] 2–3 KB article suggestions shown (relevant to ticket topic)
- [ ] Agent clicks article → opens KB article in new tab
- [ ] **Pass Criteria:** KB articles relevant to ticket category

### AI-04: Duplicate Detection
- [ ] Create a ticket with subject "Cannot login to VPN"
- [ ] Open another ticket about "VPN login issue"
- [ ] AI "Duplicates" tab shows the first ticket with ≥ 0.85 similarity
- [ ] **Pass Criteria:** Duplicate detected with similarity score

### AI-05: Low Confidence Warning
- [ ] Open a ticket with very short description (< 20 words)
- [ ] AI summary shows confidence warning: "Confidence: XX% — verify before using"
- [ ] **Pass Criteria:** Low-confidence responses display warning

---

## 8. Legacy Preservation Checks (Non-Regression)

These must pass after every phase deployment:

- [ ] **EMS-01:** Payroll module fully functional (list, create, bulk processing)
- [ ] **EMS-02:** Attendance module fully functional
- [ ] **EMS-03:** Leave management fully functional
- [ ] **EMS-04:** Projects module fully functional
- [ ] **EMS-05:** All existing ticket CRUD operations work
- [ ] **EMS-06:** Existing approval management works (without workflow engine)
- [ ] **EMS-07:** Knowledge base CRUD works
- [ ] **EMS-08:** All feature flags from Phase 0–4 still work
- [ ] **EMS-09:** Dark mode renders correctly on all existing pages
- [ ] **EMS-10:** Mobile view (375px) renders correctly on dashboard and tickets

---

## 9. UAT Sign-Off Matrix

| Phase | UAT Lead | Business Sign-off | Engineering Sign-off | Date |
|---|---|---|---|---|
| Phase 5.0 (Workflow + SLA) | IT Manager | — | — | TBD |
| Phase 5.1 (Catalog + Automation) | IT Manager + HR | — | — | TBD |
| Phase 5.2 (Intelligence) | Executive Sponsor | — | — | TBD |
| Phase 5.3 (AI Copilot) | IT Manager | — | — | TBD |
| Full GA Release | All | — | — | TBD |

---

## 10. UAT Defect Classification

| Severity | Description | Resolution SLA |
|---|---|---|
| **Blocker** | Feature completely non-functional; data loss risk | Fix before UAT proceeds |
| **Critical** | Core workflow broken; incorrect data | Fix before phase sign-off |
| **Major** | Feature degraded but workaround exists | Fix in next sprint |
| **Minor** | UI/UX issues; cosmetic errors | Fix before GA |
| **Trivial** | Nice-to-have improvements | Add to backlog |
