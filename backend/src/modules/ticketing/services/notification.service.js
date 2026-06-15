const AppError = require('../../../utils/app-error');
const { NOTIFICATION_TYPES } = require('../ticketing.types');
const { pushRealtimeNotification } = require('./notification-integration.service');
const { logTicketingEvent } = require('../lib/ticketing-logger');

class NotificationService {
  constructor(deps = {}) {
    this._chatService = deps.chatService || null;
  }

  _getChatService() {
    if (!this._chatService) {
      this._chatService = require('../../../controllers/chat.service');
    }
    return this._chatService;
  }

  async notifyTicketCreated({ recipientUserId, ticketId, ticketNumber, title }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_CREATED,
      title: 'Ticket Created',
      message: `Ticket ${ticketNumber}: ${title}`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketAssigned({ recipientUserId, ticketId, ticketNumber, title }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
      title: 'Ticket Assigned',
      message: `You were assigned ticket ${ticketNumber}: ${title}`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketReassigned({ recipientUserId, ticketId, ticketNumber, title }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_ASSIGNED,
      title: 'Ticket Reassigned',
      message: `Ticket ${ticketNumber} was reassigned to you: ${title}`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketUpdated({ recipientUserId, ticketId, ticketNumber, message }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_UPDATED,
      title: 'Ticket Updated',
      message: message || `Ticket ${ticketNumber} was updated`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketStatusChanged({ recipientUserId, ticketId, ticketNumber, status }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_UPDATED,
      title: 'Ticket Status Changed',
      message: `Ticket ${ticketNumber} status changed to ${status}`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketClosed({ recipientUserId, ticketId, ticketNumber }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_UPDATED,
      title: 'Ticket Closed',
      message: `Ticket ${ticketNumber} was closed`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketReopened({ recipientUserId, ticketId, ticketNumber }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_UPDATED,
      title: 'Ticket Reopened',
      message: `Ticket ${ticketNumber} was reopened`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketComment({ recipientUserId, ticketId, ticketNumber }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_COMMENT,
      title: 'New Ticket Comment',
      message: `New comment on ticket ${ticketNumber}`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async notifyTicketEscalated({ recipientUserId, ticketId, ticketNumber }) {
    return this._notify({
      recipientUserId,
      type: NOTIFICATION_TYPES.TICKET_ESCALATED,
      title: 'Ticket Escalated',
      message: `Ticket ${ticketNumber} was escalated`,
      link: `/app/tickets/${ticketId}`,
      sourceId: ticketId,
      event: 'notification_sent',
    });
  }

  async _notify({ recipientUserId, type, title, message, link, sourceId, event }) {
    if (!recipientUserId) {
      return null;
    }

    try {
      const notification = await this._getChatService().createNotification(
        recipientUserId,
        type,
        title,
        message,
        link,
        sourceId
      );

      pushRealtimeNotification(recipientUserId, notification);
      logTicketingEvent(event || 'notification_sent', {
        eventType: type,
        ticketId: sourceId,
        recipientCount: 1,
      });

      return notification;
    } catch (error) {
      throw AppError.internal('Unable to send ticket notification');
    }
  }
}

module.exports = NotificationService;
