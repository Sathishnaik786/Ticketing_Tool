const { z } = require('zod');

const SubmitRequestSchema = z.object({
  item_id: z.string().uuid('Invalid catalog item ID'),
  responses: z.array(z.object({
    field_id: z.string().uuid('Invalid field ID'),
    value: z.any()
  })).min(1, 'At least one field response is required')
});

module.exports = {
  SubmitRequestSchema
};
