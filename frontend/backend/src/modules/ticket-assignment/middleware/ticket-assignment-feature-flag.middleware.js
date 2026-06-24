function ticketAssignmentFeatureFlag(req, res, next) {
  if (process.env.ENABLE_TICKET_ASSIGNMENTS !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Ticket assignment module disabled',
    });
  }
  return next();
}

module.exports = ticketAssignmentFeatureFlag;
