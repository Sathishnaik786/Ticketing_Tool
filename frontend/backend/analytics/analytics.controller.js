const analyticsService = require('./analytics.service');

/**
 * Analytics Controller - Handles read-only analytics endpoints
 */
exports.getAdminOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getAdminOverview();
    res.status(200).json({ 
      success: true, 
      data,
      message: 'Admin overview analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getAdminOverview:', error);
    next(error);
  }
};

exports.getManagerTeamProgress = async (req, res, next) => {
  try {
    const managerId = req.user.employeeId;
    const data = await analyticsService.getManagerTeamProgress(managerId);
    res.status(200).json({ 
      success: true, 
      data,
      message: 'Manager team progress analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getManagerTeamProgress:', error);
    next(error);
  }
};

exports.getHRWorkforce = async (req, res, next) => {
  try {
    const data = await analyticsService.getHRWorkforce();
    res.status(200).json({ 
      success: true, 
      data,
      message: 'HR workforce analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getHRWorkforce:', error);
    next(error);
  }
};

exports.getEmployeeSelf = async (req, res, next) => {
  try {
    const employeeId = req.user.employeeId;
    const data = await analyticsService.getEmployeeSelf(employeeId);
    res.status(200).json({ 
      success: true, 
      data,
      message: 'Employee self analytics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getEmployeeSelf:', error);
    next(error);
  }
};