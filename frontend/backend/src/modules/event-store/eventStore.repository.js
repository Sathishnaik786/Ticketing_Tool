const { supabaseAdmin } = require('../../lib/supabase');

const insertEvent = async (eventData) => {
  const { tenant_id, aggregate_type, aggregate_id, event_type, event_version, payload, meta_data, actor_id } = eventData;
  
  const { data, error } = await supabaseAdmin
    .from('event_store')
    .insert([{
      tenant_id,
      aggregate_type,
      aggregate_id,
      event_type,
      event_version,
      payload,
      meta_data,
      actor_id
    }])
    .select()
    .single();

  if (error) {
    throw new Error(`EventStore repository error: ${error.message}`);
  }
  return data;
};

const getEventsForAggregate = async (tenantId, aggregateType, aggregateId) => {
  const { data, error } = await supabaseAdmin
    .from('event_store')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('aggregate_type', aggregateType)
    .eq('aggregate_id', aggregateId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`EventStore repository query error: ${error.message}`);
  }
  return data;
};

const registerProcessedEvent = async (eventId, tenantId, handlerName) => {
  const { error } = await supabaseAdmin
    .from('processed_events')
    .insert([{
      event_id: eventId,
      tenant_id: tenantId,
      handler_name: handlerName
    }]);

  if (error) {
    if (error.code === '23505') {
      return false; // Duplicate transaction (idempotency trigger)
    }
    throw new Error(`Idempotency register error: ${error.message}`);
  }
  return true;
};

module.exports = {
  insertEvent,
  getEventsForAggregate,
  registerProcessedEvent
};
