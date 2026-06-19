const NotificationCenterService = require('../services/notification-center.service');

const service = new NotificationCenterService();

function getUser(req) {
  return {
    id: req.user?.id,
    role: req.user?.role,
    employeeId: req.user?.employeeId,
    departmentId: req.user?.departmentId,
  };
}

exports.getMyNotifications = async (req, res, next) => {
  try {
    const result = await service.getMyNotifications(getUser(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const result = await service.getUnreadCount(getUser(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const result = await service.markRead(getUser(req), req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    const result = await service.markAllRead(getUser(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getPreferences = async (req, res, next) => {
  try {
    const result = await service.getPreferences(getUser(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const result = await service.updatePreferences(getUser(req), req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const result = await service.getAnalytics(getUser(req), req.query);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.listTemplates = async (req, res, next) => {
  try {
    const result = await service.listTemplates(getUser(req));
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const result = await service.createTemplate(getUser(req), req.body);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const result = await service.updateTemplate(getUser(req), req.params.id, req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const result = await service.deleteTemplate(getUser(req), req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};
