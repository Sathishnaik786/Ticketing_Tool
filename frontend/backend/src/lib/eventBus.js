const EventEmitter = require('events');
const redis = require('./redis');

class EventBus extends EventEmitter {
  constructor() {
    super();
    this.redisEnabled = false;
    this.initRedisSubscription();
  }

  initRedisSubscription() {
    if (redis.isRedisConnected()) {
      this.redisEnabled = true;
      // Listening for distributed cross-node events
      redis.subscribe('app_events_bus', (msg) => {
        try {
          const { eventName, payload } = JSON.parse(msg);
          super.emit(eventName, payload);
        } catch (e) {
          console.error('EventBus: subscription parse error:', e.message);
        }
      });
    }
  }

  emit(eventName, payload) {
    const logger = require('./auditLogger');
    logger.info(`[EventBus] Emit: ${eventName}`, { eventName, payload });

    // 1. Emit to local listeners on this server node
    super.emit(eventName, payload);

    // 2. If Redis is enabled, broadcast to other server instances
    if (this.redisEnabled && redis.isRedisConnected()) {
      try {
        const msg = JSON.stringify({ eventName, payload });
        redis.publish('app_events_bus', msg);
      } catch (err) {
        console.error('EventBus: failed to broadcast event to Redis:', err.message);
      }
    }
  }

  // Subscription helper wrapper
  subscribe(eventName, handler) {
    this.on(eventName, handler);
    return () => {
      this.off(eventName, handler);
    };
  }
}

const busInstance = new EventBus();

module.exports = busInstance;
