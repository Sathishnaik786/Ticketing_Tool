const AppError = require('../utils/app-error');
const logger = require('../lib/logger');

const EMS_ROLE_CODES = Object.freeze(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']);

function normalizeRoleCode(roleCode) {
  return String(roleCode || '').trim().toUpperCase();
}

/**
 * Resolve runtime RBAC role from user_roles -> roles.role_code.
 * Live schema authority; does not read employees.role or users.role.
 */
async function getUserRole(db, userId) {
  if (!userId) {
    return null;
  }

  const { data, error } = await db
    .from('user_roles')
    .select('role_id, assigned_at, roles(role_code, role_name, is_active)')
    .eq('user_id', userId)
    .order('assigned_at', { ascending: false });

  if (error) {
    logger.error('role_resolution_failed', {
      userId,
      error: error.message,
    });
    throw AppError.internal('Unable to resolve user role');
  }

  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  const activeAssignments = data.filter((row) => row.roles?.is_active !== false);
  const candidates = activeAssignments.length > 0 ? activeAssignments : data;

  const emsMatch = candidates.find((row) =>
    EMS_ROLE_CODES.includes(normalizeRoleCode(row.roles?.role_code))
  );
  const selected = emsMatch || candidates[0];
  const roleCode = normalizeRoleCode(selected?.roles?.role_code);

  return roleCode || null;
}

module.exports = {
  EMS_ROLE_CODES,
  normalizeRoleCode,
  getUserRole,
};
