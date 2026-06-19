function executiveAnalyticsFeatureFlag(req, res, next) {
  if (process.env.ENABLE_EXECUTIVE_ANALYTICS !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Executive analytics module disabled',
    });
  }
  return next();
}

module.exports = executiveAnalyticsFeatureFlag;
