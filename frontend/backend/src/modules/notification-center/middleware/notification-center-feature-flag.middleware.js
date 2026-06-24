function notificationCenterFeatureFlag(req, res, next) {
  if (process.env.ENABLE_NOTIFICATION_CENTER !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Notification center module disabled',
    });
  }
  return next();
}

module.exports = notificationCenterFeatureFlag;
