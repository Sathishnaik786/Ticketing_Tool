/**
 * Feature flag gate for ETMS ticketing routes.
 * Returns 503 when ENABLE_TICKETING is not explicitly enabled.
 */
function ticketingFeatureFlag(req, res, next) {
  if (process.env.ENABLE_TICKETING !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Ticketing module disabled',
    });
  }
  return next();
}

module.exports = ticketingFeatureFlag;
