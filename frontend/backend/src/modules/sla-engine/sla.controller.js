const service = require('./sla.service');
const repository = require('./sla.repository');
const { resolveTenantId } = require('../../lib/tenantResolver');

const createPolicy = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await service.createSlaPolicy(tenantId, req.body);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPolicies = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await service.getPolicies(tenantId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getPolicy = async (req, res) => {
  const { id } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await service.getPolicyDetails(tenantId, id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'SLA Policy not found' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updatePolicy = async (req, res) => {
  const { id } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await service.updateSlaPolicy(tenantId, id, req.body);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const deletePolicy = async (req, res) => {
  const { id } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    await service.deleteSlaPolicy(tenantId, id);
    return res.status(200).json({ success: true, message: 'SLA Policy deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getBreaches = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await repository.getBreaches(tenantId);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const acknowledgeBreach = async (req, res) => {
  const { id } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    const result = await service.acknowledgeBreach(tenantId, id, req.user?.id);
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicy,
  updatePolicy,
  deletePolicy,
  getBreaches,
  acknowledgeBreach
};
