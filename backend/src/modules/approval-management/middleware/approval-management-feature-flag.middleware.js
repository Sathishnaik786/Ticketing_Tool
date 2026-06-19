function approvalManagementFeatureFlag(req, res, next) {
  if (process.env.ENABLE_APPROVAL_ENGINE !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Approval engine module disabled',
    });
  }
  return next();
}

module.exports = approvalManagementFeatureFlag;
