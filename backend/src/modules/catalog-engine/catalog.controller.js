const service = require('./catalog.service');
const { SubmitRequestSchema } = require('./catalog.validators');
const { resolveTenantId } = require('../../lib/tenantResolver');

const getCategories = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req.user);
    const categories = await service.getCatalogCategories(tenantId);
    return res.status(200).json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getItems = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const tenantId = await resolveTenantId(req.user);
    const items = await service.getCatalogItems(tenantId, categoryId);
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getItemDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantId = await resolveTenantId(req.user);
    const item = await service.getItemDetails(tenantId, id);
    return res.status(200).json({ success: true, data: item });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const submitRequest = async (req, res) => {
  try {
    const payload = SubmitRequestSchema.parse(req.body);
    const result = await service.submitRequest(req.user, payload);
    return res.status(201).json(result);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ success: false, errors: err.errors });
    }
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCategories,
  getItems,
  getItemDetails,
  submitRequest
};
