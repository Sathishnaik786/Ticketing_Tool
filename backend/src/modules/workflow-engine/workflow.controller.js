const repository = require('./workflow.repository');
const service = require('./workflow.service');
const { CreateWorkflowSchema, validateDagStructure } = require('./workflow.validators');
const { resolveTenantId } = require('../../lib/tenantResolver');

const createDraft = async (req, res) => {
  const { workflowId } = req.params;
  
  try {
    const tenantId = await resolveTenantId(req.user);
    const payload = CreateWorkflowSchema.parse(req.body);
    validateDagStructure(payload.steps);

    const draft = await repository.createWorkflowDraft(tenantId, workflowId, payload.steps);
    return res.status(201).json({ success: true, data: draft });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
};

const publish = async (req, res) => {
  const { workflowId, versionId } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    const version = await repository.publishVersion(tenantId, workflowId, versionId);
    return res.status(200).json({ success: true, data: version });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTicketState = async (req, res) => {
  const { ticketId } = req.params;

  try {
    const tenantId = await resolveTenantId(req.user);
    const runState = await repository.getTicketWorkflowState(tenantId, ticketId);
    return res.status(200).json({ success: true, data: runState });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createDraft,
  publish,
  getTicketState
};
