const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { validateSelfAccess, hasViewAllAccess } = require('./src/middlewares/ownership.middleware');

const root = __dirname;
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

const makeResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

test('validateSelfAccess allows matching employee ownership', () => {
  const middleware = validateSelfAccess();
  const req = {
    method: 'GET',
    originalUrl: '/api/documents/emp-1',
    params: { employeeId: 'emp-1' },
    user: { id: 'user-1', employeeId: 'emp-1', role: 'EMPLOYEE' },
  };
  const res = makeResponse();
  let called = false;

  middleware(req, res, () => {
    called = true;
  });

  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test('validateSelfAccess denies mismatched employee ownership', () => {
  const middleware = validateSelfAccess();
  const req = {
    method: 'GET',
    originalUrl: '/api/documents/emp-2',
    params: { employeeId: 'emp-2' },
    user: { id: 'user-1', employeeId: 'emp-1', role: 'EMPLOYEE' },
  };
  const res = makeResponse();
  let called = false;

  middleware(req, res, () => {
    called = true;
  });

  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { success: false, message: 'Access denied' });
});

test('validateSelfAccess allows SUPER_ADMIN full access', () => {
  assert.equal(hasViewAllAccess({ role: 'SUPER_ADMIN' }), true);
});

test('profile update blocks sensitive employee fields', () => {
  const source = read('src/controllers/employee.controller.js');
  for (const field of ['role', 'salary', 'status', 'departmentId', 'managerId', 'employeeCode', 'permissions', 'isAdmin', 'isSuperAdmin']) {
    assert.match(source, new RegExp(`['"]${field}['"]`));
  }
  assert.match(source, /Blocked sensitive profile update attempt/);
  assert.match(source, /Profile update contains restricted fields/);
});

test('self-service controllers use req.user.employeeId for audit attribution', () => {
  const attendance = read('src/controllers/attendance.controller.js');
  const leave = read('src/controllers/leave.controller.js');
  const documents = read('src/controllers/document.controller.js');

  assert.doesNotMatch(attendance + leave + documents, /req\.user\.employee\?\.id/);
  assert.match(leave, /approved_by: req\.user\.employeeId/);
  assert.match(documents, /uploaded_by: req\.user\.employeeId/);
});

test('payroll employee-scoped controllers enforce ownership before service-role reads', () => {
  const payrollRecord = read('src/modules/payroll/controllers/payroll-record.controller.ts');
  const tax = read('src/modules/payroll/controllers/tax.controller.ts');
  const payslip = read('src/modules/payroll/controllers/payslip.controller.ts');

  assert.match(payrollRecord, /payroll_record_employee_mismatch/);
  assert.match(tax, /tax_profile_employee_mismatch/);
  assert.match(tax, /tax_profile_update_employee_mismatch/);
  assert.match(payslip, /payslip_employee_mismatch/);
  assert.match(payslip, /payslip_detail_employee_mismatch/);
});

test('supabase admin client does not fall back to anon key', () => {
  const source = read('src/lib/supabase.js');
  assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY\s*\|\|/);
  assert.match(source, /SUPABASE_SERVICE_ROLE_KEY missing/);
});

test('debug routes require SUPER_ADMIN', () => {
  const source = read('src/app.js');
  assert.match(source, /app\.get\('\/redis-test', adminLimiter, authMiddleware, requireRole\('SUPER_ADMIN'\)/);
  assert.match(source, /app\.get\('\/cache-stats', adminLimiter, authMiddleware, requireRole\('SUPER_ADMIN'\)/);
});
