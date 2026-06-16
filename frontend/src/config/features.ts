export const isTicketingEnabled =
  import.meta.env.VITE_ENABLE_TICKETING === 'true';

export const isTicketFeedbackEnabled =
  import.meta.env.VITE_ENABLE_TICKET_FEEDBACK === 'true';

export const isTicketAssignmentsEnabled =
  import.meta.env.VITE_ENABLE_TICKET_ASSIGNMENTS === 'true';

export const isCommunicationTrackingEnabled =
  import.meta.env.VITE_ENABLE_COMMUNICATION_TRACKING === 'true';
