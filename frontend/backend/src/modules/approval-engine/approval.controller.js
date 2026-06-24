const service = require('./approval.service');
const repository = require('./approval.repository');

const processAction = async (req, res) => {
  const { assignment_id, action, comments } = req.body;
  if (!assignment_id || !action) {
    return res.status(400).json({ success: false, message: 'Missing parameters assignment_id or action.' });
  }

  try {
    const result = await service.processApprovalAction(req.user, { assignment_id, action, comments });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(403).json({ success: false, message: err.message });
  }
};

const { resolveTenantId } = require('../../lib/tenantResolver');

const getUserPending = async (req, res) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  try {
    const tenantId = await resolveTenantId(req.user);
    const assignments = await repository.getPendingUserAssignments(
      tenantId,
      userId,
      userRole ? [userRole] : []
    );
    return res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  processAction,
  getUserPending
};
