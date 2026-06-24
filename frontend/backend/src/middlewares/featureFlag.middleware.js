const { evaluateFeatureFlag } = require('../lib/featureFlags');

const checkFeatureFlag = (flagKey) => {
  return async (req, res, next) => {
    const { resolveTenantId } = require('../lib/tenantResolver');
    const tenantId = await resolveTenantId(req.user);
    const departmentId = req.user?.department_id || null;

    const enabled = await evaluateFeatureFlag(flagKey, {
      tenantId,
      departmentId
    });

    if (!enabled) {
      return res.status(403).json({
        success: false,
        message: `Feature Gate: '${flagKey}' is not enabled for your environment or tenant.`
      });
    }

    next();
  };
};

module.exports = checkFeatureFlag;
