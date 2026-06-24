const repository = require('./catalog.repository');
const TicketService = require('../ticketing/services/ticket.service');
const eventStore = require('../event-store/eventStore.service');

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

    // Validate fields response mapping
    const responsesMap = {};
    responses.forEach(r => {
      responsesMap[r.field_id] = r.value;
    });

    item.fields.forEach(field => {
      const val = responsesMap[field.id];
      if (field.is_required && (val === undefined || val === null || val === '')) {
        throw AppError.badRequest(`Field "${field.label}" is required.`);
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
