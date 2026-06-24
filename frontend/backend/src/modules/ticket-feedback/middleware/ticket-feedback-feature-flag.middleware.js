function ticketFeedbackFeatureFlag(req, res, next) {
  if (process.env.ENABLE_TICKET_FEEDBACK !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Ticket feedback module disabled',
    });
  }
  return next();
}

module.exports = ticketFeedbackFeatureFlag;
