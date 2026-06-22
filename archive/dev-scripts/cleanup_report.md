# Repository Cleanup Report

## Summary of Action
All development helper scripts, scratchpads, and custom inline test setups matching `scratch_*.js`, `test_*.js`, and `tmp_*.js` have been relocated to `/archive/dev-scripts/` for codebase hygiene and production readiness. The original files have been replaced with minimal comment markers indicating their archived path.

## Archived File Inventory

### Root Directory Scripts
- **Original Path:** `/scratch_check_db.js`  
  **Archived Path:** [/archive/dev-scripts/scratch_check_db.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/scratch_check_db.js)  
  *Purpose:* Supabase database tables lookup and employee table column reflection.

- **Original Path:** `/scratch_check_schema.js`  
  **Archived Path:** [/archive/dev-scripts/scratch_check_schema.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/scratch_check_schema.js)  
  *Purpose:* Reflect employees schema datatype mappings.

- **Original Path:** `/scratch_check_schema_2.js`  
  **Archived Path:** [/archive/dev-scripts/scratch_check_schema_2.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/scratch_check_schema_2.js)  
  *Purpose:* Reflect bulk upload rows sample keys.

- **Original Path:** `/scratch_debug_data.js`  
  **Archived Path:** [/archive/dev-scripts/scratch_debug_data.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/scratch_debug_data.js)  
  *Purpose:* Prints first 5 employees records.

- **Original Path:** `/scratch_test_preview.js`  
  **Archived Path:** [/archive/dev-scripts/scratch_test_preview.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/scratch_test_preview.js)  
  *Purpose:* Generates dummy payroll preview.

- **Original Path:** `/test_employees_api.js`  
  **Archived Path:** [/archive/dev-scripts/test_employees_api.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/test_employees_api.js)  
  *Purpose:* Runs dummy controller requests to employees endpoint.

### Backend Scripts
- **Original Path:** `/backend/test_analytics.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_analytics.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_analytics.js)  
  *Purpose:* Verification of legacy analytics controller functions.

- **Original Path:** `/backend/test_login.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_login.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_login.js)  
  *Purpose:* Axios-based test suite verifying token generation and authentication.

- **Original Path:** `/backend/test_meetups_api.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_meetups_api.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_meetups_api.js)  
  *Purpose:* Verification of meetups API endpoints and calendar creation.

- **Original Path:** `/backend/test_profile_api.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_profile_api.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_profile_api.js)  
  *Purpose:* Verification of employee profiles update endpoints.

- **Original Path:** `/backend/test_projects_api.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_projects_api.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_projects_api.js)  
  *Purpose:* Verification of projects and health checks.

- **Original Path:** `/backend/test_rbac.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_rbac.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_rbac.js)  
  *Purpose:* Checks basic endpoints fail with 401/403 for unauthorized users.

- **Original Path:** `/backend/test_admin_creation.js`  
  **Archived Path:** [/archive/dev-scripts/backend_test_admin_creation.js](file:///c:/Users/DELL/Downloads/Ticketing_Tool/archive/dev-scripts/backend_test_admin_creation.js)  
  *Purpose:* Provides terminal instructions for database administrator bootstrapping.
