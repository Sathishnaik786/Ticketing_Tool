function knowledgeManagementFeatureFlag(req, res, next) {
  if (process.env.ENABLE_KNOWLEDGE_BASE !== 'true') {
    return res.status(503).json({
      success: false,
      message: 'Knowledge base module disabled',
    });
  }
  return next();
}

module.exports = knowledgeManagementFeatureFlag;
