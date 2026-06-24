const SocketHandlers = require('../../../socketHandlers');

function pushRealtimeNotification(recipientUserId, notification) {
  if (!recipientUserId || !notification) {
    return;
  }

  try {
    const io = SocketHandlers.getIO();
    if (io) {
      SocketHandlers.emitNotification(io, recipientUserId, notification);
    }
  } catch (_error) {
    // Real-time push is best-effort; REST polling remains the fallback.
  }
}

module.exports = {
  pushRealtimeNotification,
};
