const repository = require('./notification.repository');
const { resolveTenantId } = require('../../lib/tenantResolver');

const getPreferences = async (req, res) => {
  const userId = req.user?.id;
  try {
    const tenantId = await resolveTenantId(req.user);
    const preferences = await repository.getUserPreferences(tenantId, userId);
    return res.status(200).json({ success: true, data: preferences });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePreferences = async (req, res) => {
  const userId = req.user?.id;
  const { preferences } = req.body; // array of { template_key, enabled_channels }

  if (!Array.isArray(preferences)) {
    return res.status(400).json({ success: false, message: 'Invalid preferences format. Expected array.' });
  }

  try {
    const tenantId = await resolveTenantId(req.user);
    const updated = await repository.savePreferences(tenantId, userId, preferences);
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};
