const logger = require('../lib/logger');

const DEFAULT_VIEW_ALL_ROLES = ['SUPER_ADMIN'];

const normalizeRole = (role) => String(role || '').toUpperCase();

const getUserPermissions = (user) => {
  if (!user) return [];
  if (Array.isArray(user.permissions)) return user.permissions;
  if (Array.isArray(user.rolePermissions)) return user.rolePermissions;
  return [];
};

const hasViewAllAccess = (user, options = {}) => {
  const allowedRoles = options.allowRoles || DEFAULT_VIEW_ALL_ROLES;
  const viewAllPermissions = options.permissions || [];
  const role = normalizeRole(user?.role);

  if (allowedRoles.map(normalizeRole).includes(role)) return true;

  const userPermissions = getUserPermissions(user);
  return viewAllPermissions.some((permission) => userPermissions.includes(permission));
};

const getRequestedEmployeeId = (req, fieldName = 'employeeId') => {
  return (
    req.params?.[fieldName] ||
    req.query?.[fieldName] ||
    req.body?.[fieldName] ||
    req.params?.employee_id ||
    req.query?.employee_id ||
    req.body?.employee_id
  );
};

const logDeniedAccess = (req, requestedEmployeeId, reason) => {
  logger.warn('Ownership access denied', {
    reason,
    requestedEmployeeId,
    userId: req.user?.id,
    userEmployeeId: req.user?.employeeId,
    role: req.user?.role,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.ip,
  });
};

const validateSelfAccess = (options = {}) => {
  const fieldName = options.fieldName || 'employeeId';

  return (req, res, next) => {
    const requestedEmployeeId = getRequestedEmployeeId(req, fieldName);
    const userEmployeeId = req.user?.employeeId;

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (hasViewAllAccess(req.user, options)) {
      return next();
    }

    if (requestedEmployeeId && userEmployeeId && String(requestedEmployeeId) === String(userEmployeeId)) {
      return next();
    }

    logDeniedAccess(req, requestedEmployeeId, 'employee_ownership_mismatch');
    return res.status(403).json({
      success: false,
      message: 'Access denied',
    });
  };
};

module.exports = {
  validateSelfAccess,
  hasViewAllAccess,
  getRequestedEmployeeId,
  logDeniedAccess,
};
