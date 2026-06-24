function communicationTrackingFeatureFlag(req, res, next) {
  if (process.env.ENABLE_COMMUNICATION_TRACKING !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Communication tracking module disabled',
    });
  }
  return next();
}

module.exports = communicationTrackingFeatureFlag;
