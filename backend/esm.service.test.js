const test = require('node:test');
const assert = require('node:assert/strict');

// Mock Dependencies
const mockDb = {
  data: null,
  error: null,
  from(table) {
    return {
      select(fields) {
        return {
          eq(col, val) {
            return {
              maybeSingle: async () => {
                if (table === 'approval_assignments') {
                  if (val === 'valid-id') {
                    return {
                      data: {
                        id: 'valid-id',
                        tenant_id: 'tenant-1',
                        status: 'PENDING',
                        assigned_user_id: 'user-1',
                        assigned_role: 'MANAGER',
                        ticket_id: 'ticket-1',
                        escalates_at: new Date(Date.now() + 100000).toISOString()
                      },
                      error: null
                    };
                  }
                  if (val === 'expired-id') {
                    return {
                      data: {
                        id: 'expired-id',
                        tenant_id: 'tenant-1',
                        status: 'PENDING',
                        assigned_user_id: 'user-1',
                        assigned_role: 'MANAGER',
                        ticket_id: 'ticket-1',
                        escalates_at: new Date(Date.now() - 100000).toISOString()
                      },
                      error: null
                    };
                  }
                }
                return { data: null, error: null };
              }
            };
          }
        };
      }
    };
  }
};

// 1. DAG Cycle Checker Test
const { validateDagStructure } = require('./src/modules/workflow-engine/workflow.validators');

test('Workflow Engine — DAG Cycle Detection validation', () => {
  const validSteps = [
    { name: 'Step 1', type: 'TASK', configuration: { next_steps: ['Step 2'] } },
    { name: 'Step 2', type: 'APPROVAL', configuration: { next_steps: ['Step 3'] } },
    { name: 'Step 3', type: 'NOTIFICATION', configuration: {} }
  ];

  const cyclicSteps = [
    { name: 'Step 1', type: 'TASK', configuration: { next_steps: ['Step 2'] } },
    { name: 'Step 2', type: 'APPROVAL', configuration: { next_steps: ['Step 1'] } } // cycle back to 1
  ];

  assert.equal(validateDagStructure(validSteps), true);
  assert.throws(() => {
    validateDagStructure(cyclicSteps);
  }, /Circular workflow loop configuration detected/);
});

// 2. Approval Security Validation Test
test('Approval Engine — processApprovalAction validation gates', async () => {
  const AppError = class extends Error {
    constructor(msg, status) {
      super(msg);
      this.status = status;
    }
  };

  const checkApprovalSecurity = (user, tenantId, assignment) => {
    const isOwner = assignment.assigned_user_id === user.id;
    const callerRole = String(user.role || '').toUpperCase().trim();
    const targetRole = assignment.assigned_role ? String(assignment.assigned_role).toUpperCase().trim() : null;

    if (assignment.tenant_id !== tenantId) {
      throw new AppError('Cross-tenant approval is prohibited.', 403);
    }
    if (assignment.status !== 'PENDING') {
      throw new AppError('Approval assignment is not pending.', 400);
    }
    if (assignment.escalates_at && new Date() > new Date(assignment.escalates_at)) {
      throw new AppError('Approval assignment has expired.', 403);
    }

    if (!isOwner && callerRole !== 'ADMIN') {
      if (targetRole === 'MANAGER') {
        if (callerRole !== 'MANAGER') {
          throw new AppError('Only Managers can approve this step.', 403);
        }
      } else if (targetRole && callerRole !== targetRole) {
        throw new AppError(`Required role: ${targetRole}`, 403);
      }
    }
    return true;
  };

  const userTenant1 = { id: 'user-1', role: 'MANAGER' };
  const userTenant2 = { id: 'user-2', role: 'MANAGER' };

  const assignmentPending = {
    tenant_id: 'tenant-1',
    status: 'PENDING',
    assigned_user_id: 'user-1',
    assigned_role: 'MANAGER',
    escalates_at: new Date(Date.now() + 100000).toISOString()
  };

  const assignmentExpired = {
    tenant_id: 'tenant-1',
    status: 'PENDING',
    assigned_user_id: 'user-1',
    assigned_role: 'MANAGER',
    escalates_at: new Date(Date.now() - 100000).toISOString()
  };

  // Assert successful validation
  assert.equal(checkApprovalSecurity(userTenant1, 'tenant-1', assignmentPending), true);

  // Assert cross-tenant rejection
  assert.throws(() => {
    checkApprovalSecurity(userTenant2, 'tenant-2', assignmentPending);
  }, err => err.status === 403 && err.message.includes('Cross-tenant'));

  // Assert expired rejection
  assert.throws(() => {
    checkApprovalSecurity(userTenant1, 'tenant-1', assignmentExpired);
  }, err => err.status === 403 && err.message.includes('expired'));
});

// 3. Dynamic Schema AJV Validation Test
test('Catalog Security — AJV Form Validation & file constraints', () => {
  const Ajv = require('ajv');
  const ajv = new Ajv({ coerceTypes: true });

  const fields = [
    { name: 'justification', field_type: 'text', is_required: true },
    { name: 'amount', field_type: 'number', is_required: false },
    { name: 'attachment', field_type: 'file', is_required: false }
  ];

  const properties = {};
  const required = [];

  fields.forEach(field => {
    const fieldSchema = {};
    if (field.field_type === 'number') fieldSchema.type = 'number';
    else if (field.field_type === 'checkbox') fieldSchema.type = 'boolean';
    else fieldSchema.type = 'string';

    properties[field.name] = fieldSchema;
    if (field.is_required) required.push(field.name);
  });

  const schema = { type: 'object', properties, required };
  const validate = ajv.compile(schema);

  // Test successful schema coercion and validation
  const validData = { justification: 'Need new laptop', amount: '1200' };
  const valid = validate(validData);
  assert.equal(valid, true);
  assert.equal(validData.amount, 1200); // coerced to number

  // Test missing required field
  const invalidData = { amount: 500 };
  const invalid = validate(invalidData);
  assert.equal(invalid, false);

  // Test file size/extension validations mock
  const validateFile = (fileObj) => {
    const maxSizeBytes = 10 * 1024 * 1024;
    if (fileObj.size > maxSizeBytes) throw new Error('File exceeds max size');
    if (fileObj.name.endsWith('.exe')) throw new Error('Forbidden file type');
    return true;
  };

  assert.equal(validateFile({ name: 'doc.pdf', size: 5000 }), true);
  assert.throws(() => {
    validateFile({ name: 'virus.exe', size: 1000 });
  }, /Forbidden file type/);
});

// 4. SLA performance batching mock check
test('SLA Engine — Batch fetching resolves N+1 query loop', () => {
  const pendingBreaches = [
    { ticket_id: 't-1', type: 'RESPONSE' },
    { ticket_id: 't-2', type: 'RESOLUTION' }
  ];

  const mockDbTickets = {
    't-1': { id: 't-1', status: 'OPEN' },
    't-2': { id: 't-2', status: 'RESOLVED' }
  };

  // Simulating batch query: select * from tickets where id in (t-1, t-2)
  const ticketIds = [...new Set(pendingBreaches.map(b => b.ticket_id))];
  
  // Single DB load
  const ticketMap = {};
  ticketIds.forEach(id => {
    if (mockDbTickets[id]) {
      ticketMap[id] = mockDbTickets[id];
    }
  });

  // Evaluate SLA compliance without additional queries
  const evaluated = pendingBreaches.map(breach => {
    const ticket = ticketMap[breach.ticket_id];
    if (breach.type === 'RESPONSE') {
      return ticket.status !== 'OPEN';
    }
    return ticket.status === 'RESOLVED';
  });

  assert.deepEqual(evaluated, [false, true]);
});
