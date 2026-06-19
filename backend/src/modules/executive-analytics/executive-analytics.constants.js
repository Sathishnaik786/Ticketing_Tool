const BUSINESS_UNITS = Object.freeze([
  'Aparna Realty',
  'Aparna RMC',
  'Aparna Tiles',
  'Venster',
  'Alteza',
  'Rollform',
  'Unispace',
  'Externa',
  'Corporate Services',
]);

const DEPARTMENT_NAMES = Object.freeze([
  'HR',
  'IT',
  'Finance',
  'Procurement',
  'Facilities',
  'Administration',
]);

const CLOSED_STATUSES = Object.freeze(['CLOSED', 'RESOLVED']);
const OPEN_STATUSES = Object.freeze([
  'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER', 'REOPENED', 'ESCALATED',
]);

const ENTERPRISE_ROLES = Object.freeze(['HR', 'ADMIN', 'SUPER_ADMIN']);
const DEPARTMENT_ROLES = Object.freeze(['MANAGER', 'HR', 'ADMIN', 'SUPER_ADMIN']);

const REPORT_TYPES = Object.freeze([
  'EXECUTIVE', 'DEPARTMENT', 'BUSINESS_UNIT', 'SLA', 'CSAT', 'APPROVAL', 'KNOWLEDGE', 'TREND',
]);

const EXPORT_FORMATS = Object.freeze(['JSON', 'CSV', 'XLSX', 'PDF']);

module.exports = {
  BUSINESS_UNITS,
  DEPARTMENT_NAMES,
  CLOSED_STATUSES,
  OPEN_STATUSES,
  ENTERPRISE_ROLES,
  DEPARTMENT_ROLES,
  REPORT_TYPES,
  EXPORT_FORMATS,
};
