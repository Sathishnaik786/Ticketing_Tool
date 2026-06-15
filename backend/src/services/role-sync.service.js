const AppError = require('../utils/app-error');
const logger = require('../lib/logger');

const VALID_ROLES = Object.freeze(['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE']);

function normalizeRole(role) {
  return String(role || '').toUpperCase();
}

function assertAdminCanModifyRole(actorRole, body) {
  const roleProvided = body.role !== undefined;
  if (roleProvided && actorRole !== 'ADMIN') {
    return {
      allowed: false,
      message: 'Only administrators can modify user roles',
    };
  }
  return { allowed: true };
}

function assertValidRole(role) {
  const normalized = normalizeRole(role);
  if (!VALID_ROLES.includes(normalized)) {
    throw AppError.badRequest(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`);
  }
  return normalized;
}

/**
 * Synchronize role change from employees (source of truth) to users.
 * Rolls back employees.role if users update fails.
 */
async function syncEmployeeRoleUpdate(db, { employeeId, newRole, actorUserId }) {
  const normalizedRole = assertValidRole(newRole);

  const { data: employee, error: fetchError } = await db
    .from('employees')
    .select('id, user_id, role')
    .eq('id', employeeId)
    .single();

  if (fetchError?.code === 'PGRST116' || !employee) {
    throw AppError.notFound('Employee not found');
  }
  if (fetchError) {
    throw AppError.internal('Unable to load employee for role sync');
  }

  const previousRole = normalizeRole(employee.role);
  if (previousRole === normalizedRole) {
    return { employee, previousRole, changed: false };
  }

  const { data: updatedEmployee, error: employeeUpdateError } = await db
    .from('employees')
    .update({ role: normalizedRole })
    .eq('id', employeeId)
    .select('*')
    .single();

  if (employeeUpdateError) {
    logger.error('role_sync_employee_update_failed', {
      employeeId,
      previousRole,
      newRole: normalizedRole,
      actorUserId,
      error: employeeUpdateError.message,
    });
    throw AppError.internal('Unable to update employee role');
  }

  if (employee.user_id) {
    const { error: userUpdateError } = await db
      .from('users')
      .update({ role: normalizedRole })
      .eq('id', employee.user_id);

    if (userUpdateError) {
      await db
        .from('employees')
        .update({ role: previousRole })
        .eq('id', employeeId);

      logger.error('role_sync_rollback', {
        employeeId,
        userId: employee.user_id,
        previousRole,
        attemptedRole: normalizedRole,
        actorUserId,
        error: userUpdateError.message,
      });

      throw AppError.internal('Role sync failed; employee role restored');
    }
  }

  logger.info('role_sync_success', {
    employeeId,
    userId: employee.user_id || null,
    previousRole,
    newRole: normalizedRole,
    actorUserId,
  });

  return {
    employee: updatedEmployee,
    previousRole,
    changed: true,
  };
}

module.exports = {
  VALID_ROLES,
  normalizeRole,
  assertValidRole,
  assertAdminCanModifyRole,
  syncEmployeeRoleUpdate,
};
