const repository = require('./eventStore.repository');

const reconstructTicketState = async (tenantId, ticketId) => {
  const events = await repository.getEventsForAggregate(tenantId, 'TICKET', ticketId);

  if (!events || events.length === 0) {
    return null;
  }

  // Initial State reducer
  let state = {
    id: ticketId,
    tenant_id: tenantId,
    title: '',
    description: '',
    status: 'open',
    priority: 'low',
    assigned_to: null,
    comments: [],
    history: []
  };

  events.forEach((event) => {
    const { event_type, payload, created_at, actor_id } = event;
    
    state.history.push({
      event_type,
      timestamp: created_at,
      actor_id
    });

    switch (event_type) {
      case 'ticket.created':
        state.title = payload.title || state.title;
        state.description = payload.description || state.description;
        state.status = payload.status || state.status;
        state.priority = payload.priority || state.priority;
        state.assigned_to = payload.assigned_to || state.assigned_to;
        break;
      
      case 'ticket.updated':
        if (payload.title !== undefined) state.title = payload.title;
        if (payload.description !== undefined) state.description = payload.description;
        if (payload.status !== undefined) state.status = payload.status;
        if (payload.priority !== undefined) state.priority = payload.priority;
        if (payload.assigned_to !== undefined) state.assigned_to = payload.assigned_to;
        break;

      case 'ticket.comment_added':
        state.comments.push({
          comment_id: payload.comment_id,
          body: payload.body,
          actor_id,
          created_at
        });
        break;

      case 'ticket.assigned':
        state.assigned_to = payload.assigned_to;
        break;

      case 'ticket.closed':
        state.status = 'closed';
        break;

      default:
        break;
    }
  });

  return state;
};

module.exports = {
  reconstructTicketState
};
