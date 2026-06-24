<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
=======
# 🚀 Enterprises Ticketing Management System (TMS)

> A modern, scalable, enterprise-grade Ticketing & Service Management Platform designed to streamline issue tracking, service requests, incident management, approvals, and operational support across departments.

---

# 📖 Overview

The **Enterprises Ticketing Management System (TMS)** is a centralized platform that enables employees, support teams, managers, and administrators to efficiently create, assign, monitor, resolve, and report on service tickets.

The system provides:

* 🎫 Ticket Lifecycle Management
* 👥 Role-Based Access Control (RBAC)
* 🔄 Workflow Automation
* ⏱ SLA Monitoring & Escalations
* 📊 Analytics & Reporting
* 🔔 Real-Time Notifications
* 📎 Attachments & Comments
* 📝 Audit Trails
* 🏢 Multi-Department Support

---

# 🎯 Business Objectives

The platform is designed to:

* Improve service delivery efficiency
* Reduce ticket resolution times
* Enforce SLA compliance
* Increase operational transparency
* Enable accountability through ownership tracking
* Provide leadership with actionable insights

---

# 🏗️ System Architecture

```text
┌────────────────────────────────────┐
│           Frontend Portal          │
│      React + TypeScript + Vite     │
└────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│          Backend API Layer         │
│          Node.js + Express         │
└────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│      Business Service Layer        │
│                                    │
│  Ticket Engine                     │
│  Assignment Engine                 │
│  SLA Engine                        │
│  Escalation Engine                 │
│  Notification Engine               │
│  Reporting Engine                  │
└────────────────────────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│      PostgreSQL / Supabase DB      │
└────────────────────────────────────┘
```

---

# 🛠 Technology Stack

## Frontend

* React 18+
* TypeScript
* Vite
* Tailwind CSS
* ShadCN UI
* React Router
* TanStack Query

## Backend

* Node.js
* Express.js
* JWT Authentication
* RBAC Middleware
* REST APIs

## Database

* PostgreSQL
* Supabase
* Row-Level Security (RLS)

## Security

* JWT Authentication
* Password Encryption
* Audit Logging
* Role-Based Authorization
* API Rate Limiting

---

# 👤 User Roles

| Role             | Description                  |
| ---------------- | ---------------------------- |
| Super Admin      | Full system control          |
| Department Admin | Department-level management  |
| Support Manager  | Team supervision             |
| Support Agent    | Ticket handling              |
| Employee         | Ticket creation and tracking |
| Auditor          | Read-only reporting access   |

---

# 🎫 Ticket Lifecycle

```text
Open
 │
 ▼
Assigned
 │
 ▼
In Progress
 │
 ├────────► Pending User
 │              │
 │              ▼
 │          User Response
 │
 ▼
Resolved
 │
 ▼
Closed
```

Additional States:

```text
Rejected
Cancelled
Reopened
Escalated
```

---

# 📂 Core Modules

## 1. Authentication & Authorization

Features:

* Secure Login
* JWT Authentication
* Session Management
* Password Reset
* Role-Based Access Control

---

## 2. Ticket Management

### Capabilities

* Create Ticket
* Edit Ticket
* Assign Ticket
* Reassign Ticket
* Close Ticket
* Reopen Ticket
* Escalate Ticket

### Ticket Information

```text
Ticket Number
Title
Description
Department
Category
Subcategory
Priority
Status
Requester
Assignee
Created Date
Due Date
Resolution Notes
Attachments
```

---

## 3. Category Management

Support structured ticket classification.

Example:

```text
IT Support
 ├─ Hardware
 ├─ Software
 ├─ Network

HR
 ├─ Payroll
 ├─ Recruitment
 ├─ Employee Services

Administration
 ├─ Facilities
 ├─ Transport
```

---

## 4. Assignment Engine

Supported Methods:

### Manual Assignment

Manager selects agent.

### Round Robin

Automatic equal distribution.

### Queue-Based Assignment

Department queues.

### Skill-Based Assignment

Assign based on expertise.

---

## 5. SLA Management

Define service targets.

| Priority | Response Time | Resolution Time |
| -------- | ------------- | --------------- |
| Critical | 15 Minutes    | 4 Hours         |
| High     | 30 Minutes    | 8 Hours         |
| Medium   | 2 Hours       | 24 Hours        |
| Low      | 8 Hours       | 72 Hours        |

### Features

* SLA Tracking
* SLA Breach Alerts
* Escalation Rules
* Compliance Reports

---

## 6. Escalation Engine

```text
L1 Support
      │
      ▼
L2 Support
      │
      ▼
Team Lead
      │
      ▼
Department Manager
      │
      ▼
Executive Management
```

Automatic escalation occurs when SLA thresholds are exceeded.

---

## 7. Comments & Collaboration

Features:

* Internal Notes
* Public Comments
* Mention Users
* Activity Timeline
* Threaded Discussions

---

## 8. Attachment Management

Supported Files:

* PDF
* DOCX
* XLSX
* PNG
* JPG
* ZIP

Features:

* Secure Upload
* Download Permissions
* Version Tracking

---

## 9. Notifications

### Email Notifications

* Ticket Created
* Ticket Assigned
* Status Updated
* Ticket Closed

### In-App Notifications

Real-time updates.

### Future

* SMS
* WhatsApp
* Microsoft Teams
* Slack

---

# 📊 Dashboards

## Executive Dashboard

Shows:

* Total Tickets
* Open Tickets
* Closed Tickets
* Escalated Tickets
* SLA Compliance
* Department Performance

---

## Manager Dashboard

Shows:

* Team Workload
* Agent Productivity
* Resolution Metrics
* Pending Tickets

---

## Agent Dashboard

Shows:

* Assigned Tickets
* Due Today
* Escalations
* Performance Metrics

---

## Employee Dashboard

Shows:

* My Tickets
* Ticket Status
* Recent Activities
* Pending Requests

---

# 📈 Reporting & Analytics

## Operational Reports

* Open Tickets
* Closed Tickets
* Aging Report
* Pending Approval Report

## SLA Reports

* SLA Compliance
* Breached Tickets
* Response Time Analysis

## Performance Reports

* Agent Productivity
* Department Efficiency
* Resolution Trends

---

# 🗄 Database Schema

## Core Tables

```text
users
roles
permissions
departments

tickets
ticket_categories
ticket_subcategories

ticket_comments
ticket_attachments
ticket_history

ticket_assignments
ticket_sla_rules
ticket_escalations

notifications
audit_logs
```

---

# 🔐 Security Architecture

## Authentication

* JWT Tokens
* Secure Sessions
* Password Encryption

## Authorization

* RBAC Permissions
* Department Isolation
* Resource-Level Access

## Auditing

Every action is logged:

```text
Ticket Created
Ticket Updated
Assignment Changed
Status Changed
Comment Added
Ticket Closed
```

---

# 🌐 REST API Structure

```text
/api/auth

/api/tickets
/api/tickets/:id

/api/categories
/api/subcategories

/api/comments
/api/attachments

/api/assignments

/api/sla

/api/escalations

/api/reports

/api/dashboard

/api/notifications
```

---

# 🚀 Deployment Architecture

```text
GitHub
   │
   ▼
Frontend (Netlify / Vercel)
   │
   ▼
Backend (Render / AWS)
   │
   ▼
PostgreSQL / Supabase
```

---

# 📅 Product Roadmap

## Phase 1 – MVP

✅ Authentication
✅ Ticket Creation
✅ Assignment Workflow
✅ Dashboard
✅ Notifications

---

## Phase 2

✅ SLA Engine
✅ Escalation Management
✅ Attachments
✅ Reports

---

## Phase 3

✅ Knowledge Base
✅ Self-Service Portal
✅ AI Categorization
✅ AI Assignment Suggestions

---

## Phase 4

✅ Chatbot Support
✅ WhatsApp Ticketing
✅ Predictive Analytics
✅ Intelligent SLA Optimization

---

# 🎯 Expected Benefits

* 50% Faster Ticket Resolution
* Improved SLA Compliance
* Centralized Issue Tracking
* Better Resource Allocation
* Complete Auditability
* Enhanced User Experience
* Real-Time Operational Visibility

---

**Ticketing Management System (TMS)**
*Enterprise Service Management Platform for Modern Organizations*

**Version:** 1.0.0
**Architecture:** Enterprise-Ready
**Deployment Model:** Cloud / On-Premise
**Status:** Production Ready 🚀
>>>>>>> 618377ac96b018fbdc3e7b8bd8cf48e211f12b05
