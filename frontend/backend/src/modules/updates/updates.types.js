/**
 * @typedef {Object} EmployeeUpdate
 * @property {string} id
 * @property {string} user_id
 * @property {string} role
 * @property {'DAILY' | 'WEEKLY' | 'MONTHLY'} update_type
 * @property {string} [title]
 * @property {Object} content
 * @property {string} [project_id]
 * @property {string} created_at
 * @property {string} updated_at
 * @property {string} created_by
 */

const UPDATE_TYPES = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY'
};

module.exports = {
    UPDATE_TYPES
};
