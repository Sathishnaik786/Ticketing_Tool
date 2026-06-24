/**
 * Shared mocks for ticketing service unit tests.
 */
const noopAsync = async () => null;

const mockNotificationService = {
  notifyTicketCreated: noopAsync,
  notifyTicketAssigned: noopAsync,
  notifyTicketReassigned: noopAsync,
  notifyTicketUpdated: noopAsync,
  notifyTicketStatusChanged: noopAsync,
  notifyTicketClosed: noopAsync,
  notifyTicketReopened: noopAsync,
  notifyTicketComment: noopAsync,
  notifyTicketEscalated: noopAsync,
};

const mockActivityService = {
  logActivity: async () => ({ id: 'activity-mock' }),
};

module.exports = {
  mockNotificationService,
  mockActivityService,
};
