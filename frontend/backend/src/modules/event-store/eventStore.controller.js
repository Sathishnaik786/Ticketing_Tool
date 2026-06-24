const service = require('./eventStore.service');
const replayService = require('./eventReplay.service');
const { resolveTenantId } = require('../../lib/tenantResolver');

const getEventsHistory = async (req, res) => {
  const { type, id } = req.params;
  try {
    const tenantId = await resolveTenantId(req.user);
    const history = await service.getHistory(tenantId, type.toUpperCase(), id);
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

const replayTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const tenantId = await resolveTenantId(req.user);
    const state = await replayService.reconstructTicketState(tenantId, id);
    if (!state) {
      return res.status(404).json({
        success: false,
        message: 'No events found to reconstruct state for the specified ticket.'
      });
    }
    return res.status(200).json({
      success: true,
      data: state
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

module.exports = {
  getEventsHistory,
  replayTicket
};
