const repository = require('./sla.repository');
const eventStore = require('../event-store/eventStore.service');
const logger = require('../../lib/auditLogger');
const { getQueue } = require('../../lib/queue');
const { supabaseAdmin } = require('../../lib/supabase');

class SlaService {
  async createSlaPolicy(tenantId, payload) {
    const { name, description, priority, category, subcategory, department_id, business_unit_id, catalog_item_id, response_target_mins, resolution_target_mins, is_active, rules } = payload;

    const policy = await repository.createPolicy({
      tenant_id: tenantId,
      name,
      description,
      priority,
      category,
      subcategory,
      department_id,
      business_unit_id,
      catalog_item_id,
      response_target_mins,
      resolution_target_mins,
      is_active
    });

    const createdRules = [];
    if (rules && Array.isArray(rules)) {
      for (const rule of rules) {
        const createdRule = await repository.createEscalationRule({
          tenant_id: tenantId,
          policy_id: policy.id,
          trigger_event: rule.trigger_event,
          buffer_percentage: rule.buffer_percentage,
          action_type: rule.action_type,
          action_payload: rule.action_payload
        });
        createdRules.push(createdRule);
      }
    }

    // Record Event in Event Store
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'SLA_POLICY',
      aggregate_id: policy.id,
      event_type: 'sla.policy.created',
      payload: { policy_id: policy.id, name }
    });

    return { ...policy, rules: createdRules };
  }

  async getPolicies(tenantId) {
    return await repository.getPolicies(tenantId);
  }

  async getPolicyDetails(tenantId, id) {
    return await repository.getPolicyWithRules(tenantId, id);
  }

  async updateSlaPolicy(tenantId, id, payload) {
    const { name, description, priority, category, subcategory, department_id, business_unit_id, catalog_item_id, response_target_mins, resolution_target_mins, is_active, rules } = payload;

    const policy = await repository.updatePolicy(tenantId, id, {
      name,
      description,
      priority,
      category,
      subcategory,
      department_id,
      business_unit_id,
      catalog_item_id,
      response_target_mins,
      resolution_target_mins,
      is_active
    });

    // Replace escalation rules
    await repository.deleteEscalationRules(tenantId, id);

    const createdRules = [];
    if (rules && Array.isArray(rules)) {
      for (const rule of rules) {
        const createdRule = await repository.createEscalationRule({
          tenant_id: tenantId,
          policy_id: policy.id,
          trigger_event: rule.trigger_event,
          buffer_percentage: rule.buffer_percentage,
          action_type: rule.action_type,
          action_payload: rule.action_payload
        });
        createdRules.push(createdRule);
      }
    }

    // Record Event
    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'SLA_POLICY',
      aggregate_id: id,
      event_type: 'sla.policy.updated',
      payload: { policy_id: id, name }
    });

    return { ...policy, rules: createdRules };
  }

  async deleteSlaPolicy(tenantId, id) {
    await repository.deletePolicy(tenantId, id);

    await eventStore.recordEvent({
      tenant_id: tenantId,
      aggregate_type: 'SLA_POLICY',
      aggregate_id: id,
      event_type: 'sla.policy.deleted',
      payload: { policy_id: id }
    });

    return true;
  }

  async matchAndApplySLA(tenantId, ticketId) {
    logger.info(`SlaEngine: evaluating policy for ticket ${ticketId}`);

    // Fetch the ticket
    const { data: ticket, error: ticketError } = await supabaseAdmin
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .maybeSingle();

    if (ticketError || !ticket) {
      logger.warn(`SlaEngine: Ticket ${ticketId} not found, skipping SLA match.`);
      return null;
    }

    // Fetch service request details if this ticket was created from service catalog
    const { data: serviceRequest } = await supabaseAdmin
      .from('service_requests')
      .select('item_id')
      .eq('tenant_id', tenantId)
      .eq('ticket_id', ticketId)
      .maybeSingle();

    const catalogItemId = serviceRequest?.item_id || null;

    // Fetch active policies
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('sla_policies')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('is_active', true);

    if (policiesError || !policies || policies.length === 0) {
      logger.info(`SlaEngine: No active SLA policies configured for tenant ${tenantId}.`);
      return null;
    }

    let bestPolicy = null;
    let highestScore = -1;

    for (const policy of policies) {
      let score = 0;
      let mismatch = false;

      // 1. Catalog Item Specificity
      if (policy.catalog_item_id) {
        if (policy.catalog_item_id === catalogItemId) {
          score += 100;
        } else {
          mismatch = true;
        }
      }

      // 2. Subcategory Specificity
      if (policy.subcategory) {
        // Assume ticket has subcategory or we ignore if not matching
        if (ticket.subcategory_id === policy.subcategory) { // Subcategory matches
          score += 50;
        } else {
          mismatch = true;
        }
      }

      // 3. Category Specificity
      if (policy.category) {
        if (ticket.category_id === policy.category) {
          score += 30;
        } else {
          mismatch = true;
        }
      }

      // 4. Department Specificity
      if (policy.department_id) {
        if (ticket.department_id === policy.department_id) {
          score += 20;
        } else {
          mismatch = true;
        }
      }

      // 5. Priority Specificity
      if (policy.priority) {
        if (ticket.priority === policy.priority) {
          score += 5;
        } else {
          mismatch = true;
        }
      }

      if (!mismatch && score > highestScore) {
        highestScore = score;
        bestPolicy = policy;
      }
    }

    if (!bestPolicy) {
      logger.info(`SlaEngine: No matching SLA policy found for ticket ${ticketId}.`);
      return null;
    }

    logger.info(`SlaEngine: Matched policy "${bestPolicy.name}" (score: ${highestScore}) for ticket ${ticketId}`);

    const baseDate = new Date(ticket.created_at || Date.now());
    const responseDue = new Date(baseDate.getTime() + bestPolicy.response_target_mins * 60 * 1000);
    const resolutionDue = new Date(baseDate.getTime() + bestPolicy.resolution_target_mins * 60 * 1000);

    // Update ticket due dates
    await supabaseAdmin
      .from('tickets')
      .update({
        sla_response_due_at: responseDue.toISOString(),
        sla_resolution_due_at: resolutionDue.toISOString()
      })
      .eq('id', ticketId);

    // Create breach checkpoint records
    await repository.createBreachRecord({
      tenant_id: tenantId,
      ticket_id: ticketId,
      policy_id: bestPolicy.id,
      breach_type: 'RESPONSE',
      target_time: responseDue.toISOString()
    });

    await repository.createBreachRecord({
      tenant_id: tenantId,
      ticket_id: ticketId,
      policy_id: bestPolicy.id,
      breach_type: 'RESOLUTION',
      target_time: resolutionDue.toISOString()
    });

    return bestPolicy;
  }

  async checkBreachesAndTriggerEscalations(tenantId) {
    logger.info(`SlaEngine: checking breaches for tenant ${tenantId}`);

    const pendingBreaches = await repository.getPendingBreaches(tenantId);
    if (!pendingBreaches || pendingBreaches.length === 0) return;

    const now = new Date();

    for (const breach of pendingBreaches) {
      const targetTime = new Date(breach.target_time);

      if (now > targetTime) {
        // Breach happened! Verify if ticket is already responded/resolved
        const { data: ticket } = await supabaseAdmin
          .from('tickets')
          .select('*')
          .eq('id', breach.ticket_id)
          .maybeSingle();

        if (!ticket) continue;

        let alreadyCompleted = false;

        if (breach.breach_type === 'RESPONSE') {
          // Responded if status is not OPEN or comment exists
          alreadyCompleted = ticket.status !== 'OPEN';
        } else if (breach.breach_type === 'RESOLUTION') {
          alreadyCompleted = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED';
        }

        if (alreadyCompleted) {
          // If already met target, close breach record as non-breached or set breached_at equal to resolution
          await repository.updateBreach(tenantId, breach.id, {
            breached_at: targetTime.toISOString(), // safe fallback
            is_acknowledged: true
          });
          continue;
        }

        // Mark as Breached
        logger.warn(`SlaEngine: SLA Breach detected! Ticket: ${breach.ticket_id}, Type: ${breach.breach_type}`);

        await repository.updateBreach(tenantId, breach.id, {
          breached_at: now.toISOString()
        });

        // Trigger Event
        await eventStore.recordEvent({
          tenant_id: tenantId,
          aggregate_type: 'SLA_BREACH',
          aggregate_id: breach.id,
          event_type: 'sla.breach.occurred',
          payload: {
            breach_id: breach.id,
            ticket_id: breach.ticket_id,
            breach_type: breach.breach_type,
            policy_id: breach.policy_id
          }
        });

        // Fetch policy rules and execute actions
        const policy = await repository.getPolicyWithRules(tenantId, breach.policy_id);
        if (policy && policy.rules) {
          // Find rules triggered by BREACHED event
          const rules = policy.rules.filter(r => r.trigger_event === 'BREACHED');
          for (const rule of rules) {
            await this.executeEscalationAction(tenantId, ticket, rule);
          }
        }
      }
    }
  }

  async executeEscalationAction(tenantId, ticket, rule) {
    logger.info(`SlaEngine: executing escalation rule ${rule.id} of type ${rule.action_type} for ticket ${ticket.id}`);

    try {
      if (rule.action_type === 'NOTIFY_MANAGER') {
        const recipientUserId = rule.action_payload?.manager_user_id || '11111111-1111-1111-1111-111111111111';

        const queue = getQueue('notify-queue');
        await queue.add('sendNotification', {
          tenantId,
          recipientId: recipientUserId,
          templateKey: 'SLA_BREACHED',
          data: { ticket_id: ticket.id }
        });
      } 
      else if (rule.action_type === 'REASSIGN_TICKET') {
        const newAssigneeId = rule.action_payload?.assignee_id;
        if (newAssigneeId) {
          await supabaseAdmin
            .from('tickets')
            .update({ assignee_id: newAssigneeId })
            .eq('id', ticket.id);

          logger.info(`SlaEngine: Reassigned ticket ${ticket.id} to ${newAssigneeId}`);
        }
      } 
      else if (rule.action_type === 'ESCALATE_PRIORITY') {
        const priorityChain = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
        const currentIdx = priorityChain.indexOf(ticket.priority);
        if (currentIdx !== -1 && currentIdx < priorityChain.length - 1) {
          const nextPriority = priorityChain[currentIdx + 1];

          await supabaseAdmin
            .from('tickets')
            .update({ priority: nextPriority })
            .eq('id', ticket.id);

          logger.info(`SlaEngine: Escalated priority of ticket ${ticket.id} to ${nextPriority}`);
        }
      }
    } catch (err) {
      logger.error(`SlaEngine: Escalation action execution failed for rule ${rule.id}:`, err.message);
    }
  }

  async acknowledgeBreach(tenantId, breachId, userId) {
    return await repository.updateBreach(tenantId, breachId, {
      is_acknowledged: true
    });
  }
}

const serviceInstance = new SlaService();

module.exports = serviceInstance;
