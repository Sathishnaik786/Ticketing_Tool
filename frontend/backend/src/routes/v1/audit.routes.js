'use strict';

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../../lib/supabase');
const authMiddleware = require('../../middlewares/auth.middleware');
const requireRole = require('../../middlewares/role.middleware');
const logger = require('../../lib/logger');

/**
 * GET /api/v1/audit
 *
 * Query parameters:
 * - actorId: UUID of the actor
 * - entityType: Target resource type (e.g. TICKET, USER)
 * - entityId: UUID of the resource
 * - startDate: ISO Date string (created_at >= startDate)
 * - endDate: ISO Date string (created_at <= endDate)
 * - page: page number (default 1)
 * - limit: items per page (default 50)
 *
 * RBAC: ADMIN or HR
 */
router.get('/', authMiddleware, requireRole('ADMIN', 'HR'), async (req, res) => {
  try {
    const { actorId, entityType, entityId, startDate, endDate, page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const offset = (pageNum - 1) * limitNum;

    // Start query on audit_logs table
    let dbQuery = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' });

    // Apply filtering options
    if (actorId) {
      dbQuery = dbQuery.eq('actor_id', actorId);
    }
    if (entityType) {
      dbQuery = dbQuery.eq('entity_type', entityType);
    }
    if (entityId) {
      dbQuery = dbQuery.eq('entity_id', entityId);
    }
    if (startDate) {
      dbQuery = dbQuery.gte('created_at', startDate);
    }
    if (endDate) {
      dbQuery = dbQuery.lte('created_at', endDate);
    }

    // Apply descending order and pagination range
    dbQuery = dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: logs, count, error } = await dbQuery;

    if (error) {
      logger.error('Error querying audit_logs table', { error: error.message });
      return res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
    }

    // Enrich logs with actor employee details (first name, last name, role)
    const actorIds = [...new Set(logs.map(log => log.actor_id).filter(Boolean))];
    const employeeMap = {};

    if (actorIds.length > 0) {
      // Query employees for name details
      const { data: employees, error: empError } = await supabaseAdmin
        .from('employees')
        .select('user_id, first_name, last_name')
        .in('user_id', actorIds);

      // Query user_roles and roles tables for role details
      const { data: userRoles, error: userRolesError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, roles(role_code)')
        .in('user_id', actorIds);

      const userRoleMap = {};
      if (!userRolesError && userRoles) {
        userRoles.forEach(ur => {
          userRoleMap[ur.user_id] = ur.roles?.role_code;
        });
      }

      if (!empError && employees) {
        employees.forEach(emp => {
          employeeMap[emp.user_id] = {
            first_name: emp.first_name,
            last_name: emp.last_name,
            role: userRoleMap[emp.user_id] || 'EMPLOYEE'
          };
        });
      }
    }

    const enrichedLogs = logs.map(log => {
      const actor = employeeMap[log.actor_id];
      return {
        ...log,
        actor: actor ? {
          first_name: actor.first_name,
          last_name: actor.last_name,
          role: actor.role
        } : null
      };
    });

    const total = count || 0;
    const pages = Math.ceil(total / limitNum);

    return res.status(200).json({
      success: true,
      data: {
        logs: enrichedLogs,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages
        }
      }
    });
  } catch (err) {
    logger.error('Unhandled error in audit logs router', { error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = { auditRouter: router };
