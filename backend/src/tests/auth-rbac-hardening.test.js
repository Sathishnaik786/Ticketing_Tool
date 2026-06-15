const test = require('node:test');
const assert = require('node:assert/strict');
const {
  assertAdminCanModifyRole,
  assertValidRole,
  normalizeRole,
  syncEmployeeRoleUpdate,
} = require('../services/role-sync.service');
const AppError = require('../utils/app-error');

function createMockDb(initialEmployee, options = {}) {
  const state = {
    employee: { ...initialEmployee },
    userRole: initialEmployee.userRole ?? initialEmployee.role,
    userUpdateShouldFail: Boolean(options.userUpdateShouldFail),
    employeeUpdateShouldFail: Boolean(options.employeeUpdateShouldFail),
  };

  function buildEmployeeQuery(mode, payload) {
    const query = {
      _mode: mode,
      _payload: payload,
      select(columns) {
        query._columns = columns;
        return query;
      },
      update(updatePayload) {
        return buildEmployeeQuery('update', updatePayload);
      },
      eq(_column, value) {
        query._eqValue = value;

        if (query._mode !== 'update') {
          return query;
        }

        const updateResult = {
          select(_columns) {
            return updateResult;
          },
          single: async () => {
            if (state.employeeUpdateShouldFail) {
              return { data: null, error: { message: 'employee update failed' } };
            }
            state.employee = { ...state.employee, ...query._payload };
            return { data: { ...state.employee }, error: null };
          },
          then(resolve, reject) {
            state.employee = { ...state.employee, ...query._payload };
            Promise.resolve({ data: null, error: null }).then(resolve, reject);
          },
        };

        return updateResult;
      },
      single: async () => {
        if (query._mode === 'select') {
          return {
            data: {
              id: state.employee.id,
              user_id: state.employee.user_id,
              role: state.employee.role,
            },
            error: null,
          };
        }

        return { data: null, error: { code: 'PGRST116' } };
      },
    };

    if (mode === 'select') {
      query.select = () => query;
    }

    return query;
  }

  const db = {
    from(table) {
      if (table === 'employees') {
        return buildEmployeeQuery('select');
      }

      if (table === 'users') {
        return {
          update(payload) {
            return {
              eq: async () => {
                if (state.userUpdateShouldFail) {
                  state.employee.role = initialEmployee.role;
                  return { error: { message: 'users update failed' } };
                }
                state.userRole = payload.role;
                return { error: null };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table ${table}`);
    },
    __state: state,
  };

  return db;
}

test('assertAdminCanModifyRole allows ADMIN to change role', () => {
  const result = assertAdminCanModifyRole('ADMIN', { role: 'HR' });
  assert.equal(result.allowed, true);
});

test('assertAdminCanModifyRole denies MANAGER role escalation', () => {
  const result = assertAdminCanModifyRole('MANAGER', { role: 'ADMIN' });
  assert.equal(result.allowed, false);
  assert.match(result.message, /administrators/i);
});

test('assertAdminCanModifyRole denies HR role escalation', () => {
  const result = assertAdminCanModifyRole('HR', { role: 'ADMIN' });
  assert.equal(result.allowed, false);
});

test('assertAdminCanModifyRole denies EMPLOYEE role escalation', () => {
  const result = assertAdminCanModifyRole('EMPLOYEE', { role: 'MANAGER' });
  assert.equal(result.allowed, false);
});

test('assertAdminCanModifyRole allows non-role profile updates for MANAGER', () => {
  const result = assertAdminCanModifyRole('MANAGER', { firstName: 'Updated' });
  assert.equal(result.allowed, true);
});

test('role update syncs employees.role and users.role', async () => {
  const db = createMockDb({
    id: 'emp-1',
    user_id: 'user-1',
    role: 'EMPLOYEE',
  });

  const result = await syncEmployeeRoleUpdate(db, {
    employeeId: 'emp-1',
    newRole: 'MANAGER',
    actorUserId: 'admin-1',
  });

  assert.equal(result.changed, true);
  assert.equal(normalizeRole(result.employee.role), 'MANAGER');
  assert.equal(db.__state.userRole, 'MANAGER');
});

test('role update rollback restores employees.role when users update fails', async () => {
  const db = createMockDb(
    {
      id: 'emp-2',
      user_id: 'user-2',
      role: 'EMPLOYEE',
    },
    { userUpdateShouldFail: true }
  );

  await assert.rejects(
    () => syncEmployeeRoleUpdate(db, {
      employeeId: 'emp-2',
      newRole: 'ADMIN',
      actorUserId: 'admin-1',
    }),
    (error) => error instanceof AppError && /restored/i.test(error.message)
  );

  assert.equal(normalizeRole(db.__state.employee.role), 'EMPLOYEE');
});

test('failed employee update rolls back transaction via thrown error', async () => {
  const db = createMockDb(
    {
      id: 'emp-3',
      user_id: 'user-3',
      role: 'HR',
    },
    { employeeUpdateShouldFail: true }
  );

  await assert.rejects(
    () => syncEmployeeRoleUpdate(db, {
      employeeId: 'emp-3',
      newRole: 'ADMIN',
      actorUserId: 'admin-1',
    }),
    (error) => error instanceof AppError
  );

  assert.equal(normalizeRole(db.__state.employee.role), 'HR');
  assert.equal(db.__state.userRole, 'HR');
});

test('assertValidRole rejects invalid roles', () => {
  assert.throws(() => assertValidRole('SUPERADMIN'), AppError);
});

test('ProtectedRoute unauthorized redirect target is /app/unauthorized', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/components/ProtectedRoute.tsx'),
    'utf8'
  );
  assert.match(source, /Navigate to="\/app\/unauthorized"/);
});

test('AdminUsers page guard redirects non-admin users', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const source = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/pages/AdminUsers.tsx'),
    'utf8'
  );
  assert.match(source, /user\.role !== 'ADMIN'/);
  assert.match(source, /Navigate to="\/app\/unauthorized"/);
});

test('logout clears tokens and invokes Supabase signOut', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const authSession = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/services/authSession.ts'),
    'utf8'
  );
  const authContext = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/contexts/AuthContext.tsx'),
    'utf8'
  );

  assert.match(authSession, /clearAuthStorage/);
  assert.match(authSession, /supabaseSignOut/);
  assert.match(authSession, /queryClient\?\.clear/);
  assert.match(authContext, /performLogout/);
});

test('session refresh stores refresh_token and retries on 401', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const authController = fs.readFileSync(
    path.join(__dirname, '../controllers/auth.controller.js'),
    'utf8'
  );
  const apiSource = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/services/api.ts'),
    'utf8'
  );
  const authSession = fs.readFileSync(
    path.join(__dirname, '../../../frontend/src/services/authSession.ts'),
    'utf8'
  );

  assert.match(authController, /refresh_token/);
  assert.match(authSession, /tryRefreshSession/);
  assert.match(apiSource, /res\.status === 401/);
  assert.match(apiSource, /refreshAccessTokenOnce/);
});
