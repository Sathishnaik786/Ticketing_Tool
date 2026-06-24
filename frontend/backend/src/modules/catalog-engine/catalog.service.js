const repository = require('./catalog.repository');
const TicketService = require('../ticketing/services/ticket.service');
const eventStore = require('../event-store/eventStore.service');
const Ajv = require('ajv');

// Existing app errors helper check
let AppError;
try {
  AppError = require('../../utils/app-error');
} catch (e) {
  // Simple fallback error class
  AppError = class extends Error {
    static badRequest(msg) { return new AppError(msg, 400); }
    static notFound(msg) { return new AppError(msg, 404); }
    static internal(msg) { return new AppError(msg, 500); }
    static forbidden(msg) { return new AppError(msg, 403); }
    constructor(msg, status) {
      super(msg);
      this.status = status;
    }
  };
}

class CatalogService {
  constructor(deps = {}) {
    this.ticketService = deps.ticketService || new TicketService();
  }

  async getCatalogCategories(tenantId) {
    return await repository.getCategories(tenantId);
  }

  async getCatalogItems(tenantId, categoryId) {
    return await repository.getItemsByCategory(tenantId, categoryId);
  }

  async getItemDetails(tenantId, itemId) {
    const details = await repository.getItemWithFormFields(tenantId, itemId);
    if (!details) {
      throw AppError.notFound('Catalog item not found');
    }
    return details;
  }

  async submitRequest(user, payload) {
    const { resolveTenantId } = require('../../lib/tenantResolver');
    const tenantId = await resolveTenantId(user);
    const { item_id, responses } = payload;

    // Fetch the item schema
    const item = await this.getItemDetails(tenantId, item_id);

    // Validate fields response mapping using AJV dynamic compiler
    const responsesMap = {};
    responses.forEach(r => {
      const field = item.fields.find(f => f.id === r.field_id);
      if (field) {
        let val = r.value;
        if (field.field_type === 'number' && val !== '') {
          const num = Number(val);
          if (!isNaN(num)) {
            val = num;
          }
        } else if (field.field_type === 'checkbox') {
          if (val === 'true' || val === true) val = true;
          else if (val === 'false' || val === false) val = false;
        }
        responsesMap[field.name] = val;
      }
    });

    // Build JSON Schema dynamically
    const properties = {};
    const required = [];

    item.fields.forEach(field => {
      const fieldSchema = {};
      
      switch (field.field_type) {
        case 'number':
          fieldSchema.type = 'number';
          break;
        case 'checkbox':
          fieldSchema.type = 'boolean';
          break;
        case 'select':
          fieldSchema.type = 'string';
          if (Array.isArray(field.options) && field.options.length > 0) {
            fieldSchema.enum = field.options;
          }
          break;
        case 'file':
          fieldSchema.type = 'string';
          break;
        case 'text':
        case 'textarea':
        default:
          fieldSchema.type = 'string';
          break;
      }

      properties[field.name] = fieldSchema;

      if (field.is_required) {
        required.push(field.name);
      }
    });

    const schema = {
      type: 'object',
      properties,
      required,
      additionalProperties: true
    };

    const ajv = new Ajv({ allErrors: true, coerceTypes: true });
    const validate = ajv.compile(schema);
    const valid = validate(responsesMap);

    if (!valid) {
      const errorsStr = validate.errors.map(err => {
        const fieldName = err.instancePath ? err.instancePath.substring(1) : err.params.missingProperty;
        return `Field "${fieldName}" ${err.message}`;
      }).join(', ');
      throw AppError.badRequest(`Validation Error: ${errorsStr}`);
    }

    // Additional custom validations (e.g. file size and extension checks)
    item.fields.forEach(field => {
      if (field.field_type === 'file') {
        const fileVal = responsesMap[field.name];
        if (fileVal) {
          try {
            const fileData = typeof fileVal === 'string' ? JSON.parse(fileVal) : fileVal;
            if (fileData && typeof fileData === 'object') {
              const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit
              if (fileData.size && fileData.size > maxSizeBytes) {
                throw AppError.badRequest(`File "${fileData.name || field.label}" exceeds maximum allowed size of 10MB.`);
              }
              const forbiddenExtensions = ['.exe', '.bat', '.sh', '.cmd', '.com', '.msi'];
              const fileName = (fileData.name || '').toLowerCase();
              if (forbiddenExtensions.some(ext => fileName.endsWith(ext))) {
                throw AppError.badRequest(`File type for "${fileData.name}" is forbidden.`);
              }
            }
          } catch (e) {
            // Ignore JSON parsing errors if file format is raw URI
          }
        }
      }
    });

    // Create ticket in existing ETMS ticketing
    const ticketPayload = {
      title: `Service Request: ${item.name}`,
      description: item.description || `Service request form submitted by employee ${user.email}`,
      priority: 'MEDIUM',
      category_id: null,
      department_id: null
    };

    const ticketResult = await this.ticketService.createTicket(user, ticketPayload);
    const ticket = ticketResult.data;

    // Write to ESM catalog requests log
    const serviceRequest = await repository.createServiceRequest({
      tenant_id: tenantId,
      item_id,
      ticket_id: ticket.id,
      requested_by: user.id,
      responses
    });

    // Write events to Event Store
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'CATALOG_REQUEST',
      aggregate_id: serviceRequest.id,
      event_type: 'catalog.requested',
      payload: {
        request_id: serviceRequest.id,
        item_id,
        ticket_id: ticket.id,
        requested_by: user.id
      },
      actor_id: user.id
    });

    return {
      success: true,
      serviceRequest,
      ticket
    };
  }
}

module.exports = new CatalogService();
