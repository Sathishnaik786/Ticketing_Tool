# EMS Extraction Plan — Phase 9.2.5

This document outlines the step-by-step extraction plan to non-destructively isolate the legacy EMS artifacts into `ems_backup/` while preserving full compilation and rollback integrity.

---

## 1. Directory Setup

Create the backup structure at the root of the repository:
```text
ems_backup/
  frontend/
    pages/
    modules/
    components/
      dashboard/
      common/
    services/
  backend/
    routes/
    controllers/
```

---

## 2. Relocated Legacy Artifacts

### 💻 Frontend Pages & Components
The following files are relocated to preserve the primary source directories for ETMS:
* `frontend/src/pages/Attendance.tsx` → `ems_backup/frontend/pages/Attendance.tsx`
* `frontend/src/pages/Leaves.tsx` → `ems_backup/frontend/pages/Leaves.tsx`
* `frontend/src/pages/Calendar.tsx` → `ems_backup/frontend/pages/Calendar.tsx`
* `frontend/src/pages/Meetups.tsx` → `ems_backup/frontend/pages/Meetups.tsx`
* `frontend/src/pages/Projects.tsx` → `ems_backup/frontend/pages/Projects.tsx`
* `frontend/src/pages/MyProjects.tsx` → `ems_backup/frontend/pages/MyProjects.tsx`
* `frontend/src/pages/ProjectDetail.tsx` → `ems_backup/frontend/pages/ProjectDetail.tsx`
* `frontend/src/pages/MyPayslips.tsx` → `ems_backup/frontend/pages/MyPayslips.tsx`
* `frontend/src/modules/updates/` (entire folder) → `ems_backup/frontend/modules/updates/`
* `frontend/src/components/dashboard/UpdatesQuickAccess.tsx` → `ems_backup/frontend/components/dashboard/UpdatesQuickAccess.tsx`
* `frontend/src/components/dashboard/AnalyticsOverview.tsx` → `ems_backup/frontend/components/dashboard/AnalyticsOverview.tsx`
* `frontend/src/components/common/MeetupCard.tsx` → `ems_backup/frontend/components/common/MeetupCard.tsx`
* `frontend/src/components/common/ProjectCard.tsx` → `ems_backup/frontend/components/common/ProjectCard.tsx`
* `frontend/src/components/common/ProjectStatusBadge.tsx` → `ems_backup/frontend/components/common/ProjectStatusBadge.tsx`
* `frontend/src/services/chatService.ts` → `ems_backup/frontend/services/chatService.ts`

### ⚙️ Backend Routes & Controllers
* `backend/src/routes/attendance.routes.js` → `ems_backup/backend/routes/attendance.routes.js`
* `backend/src/routes/leave.routes.js` → `ems_backup/backend/routes/leave.routes.js`
* `backend/src/routes/calendar.routes.js` → `ems_backup/backend/routes/calendar.routes.js`
* `backend/src/routes/meetup.routes.js` → `ems_backup/backend/routes/meetup.routes.js`
* `backend/src/routes/project.routes.js` → `ems_backup/backend/routes/project.routes.js`
* `backend/src/routes/chat.routes.js` → `ems_backup/backend/routes/chat.routes.js`
* `backend/src/controllers/attendance.controller.js` → `ems_backup/backend/controllers/attendance.controller.js`
* `backend/src/controllers/calendar.controller.js` → `ems_backup/backend/controllers/calendar.controller.js`
* `backend/src/controllers/chat.controller.js` → `ems_backup/backend/controllers/chat.controller.js`
* `backend/src/controllers/chat.service.js` → `ems_backup/backend/controllers/chat.service.js`
* `backend/src/controllers/leave.controller.js` → `ems_backup/backend/controllers/leave.controller.js`
* `backend/src/controllers/meetup.controller.js` → `ems_backup/backend/controllers/meetup.controller.js`
* `backend/src/controllers/meetup.service.js` → `ems_backup/backend/controllers/meetup.service.js`
* `backend/src/controllers/project.controller.js` → `ems_backup/backend/controllers/project.controller.js`
* `backend/src/controllers/project.service.js` → `ems_backup/backend/controllers/project.service.js`

---

## 3. Compilation Integrity Strategy

To keep the repository compiling and running during the UAT verification gate, we establish alias mapping:

### ⚙️ Frontend Config Mappings
1. **tsconfig.json paths mapping**:
   ```json
   "ems_backup/*": ["../ems_backup/*"]
   ```
2. **tsconfig.app.json include mapping**:
   Include `"../ems_backup/**/*"` so TypeScript transpiles the archived code files.
3. **vite.config.ts resolution alias & server permission**:
   ```typescript
   alias: {
     "@": path.resolve(__dirname, "./src"),
     "ems_backup": path.resolve(__dirname, "../ems_backup"),
   }
   ```
   Add standard server allow array:
   ```typescript
   fs: {
     allow: [
       path.resolve(__dirname),
       path.resolve(__dirname, "../ems_backup")
     ]
   }
   ```

4. **App.tsx Imports Updates**:
   Point the lazy imports to the new alias:
   ```typescript
   const AttendancePage = lazyPage(() => import("ems_backup/frontend/pages/Attendance"));
   const Leaves = lazyPage(() => import("ems_backup/frontend/pages/Leaves"));
   const CalendarPage = lazyPage(() => import("ems_backup/frontend/pages/Calendar"));
   const MeetupsPage = lazyPage(() => import("ems_backup/frontend/pages/Meetups"));
   const Projects = lazyPage(() => import('ems_backup/frontend/pages/Projects'));
   const MyProjects = lazyPage(() => import('ems_backup/frontend/pages/MyProjects'));
   const ProjectDetail = lazyPage(() => import('ems_backup/frontend/pages/ProjectDetail'));
   ```
   And `updatesRoutes`:
   ```typescript
   import { updatesRoutes } from 'ems_backup/frontend/modules/updates/updates.routes';
   ```

---

## 4. Rollback Verification Plan

Should UAT require restoration:
1. Revert changes to `App.tsx`, `vite.config.ts`, and `tsconfig*.json` using Git.
2. Copy files from `ems_backup/frontend/pages/` back to `frontend/src/pages/`, etc.
3. Verify that the repository compiles perfectly.
