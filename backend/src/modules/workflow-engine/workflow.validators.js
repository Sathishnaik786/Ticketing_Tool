const { z } = require('zod');

const StepTypeEnum = z.enum(['APPROVAL', 'TASK', 'NOTIFICATION']);

const StepSchema = z.object({
  name: z.string().min(1, 'Step name is required'),
  type: StepTypeEnum,
  assigned_role: z.string().optional(),
  assigned_user_id: z.string().uuid().optional(),
  configuration: z.record(z.any()).default({})
});

const CreateWorkflowSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  steps: z.array(StepSchema).min(1, 'At least one step configuration is required')
});

// DAG validation: checks for cycle paths
const validateDagStructure = (steps) => {
  const adjacencyList = {};
  steps.forEach((step, index) => {
    const nextSteps = step.configuration?.next_steps || [];
    adjacencyList[index] = nextSteps;
  });

  const visited = new Set();
  const recStack = new Set();

  const isCyclic = (node) => {
    if (recStack.has(node)) return true;
    if (visited.has(node)) return false;

    visited.add(node);
    recStack.add(node);

    const neighbors = adjacencyList[node] || [];
    for (const neighbor of neighbors) {
      // Map neighbor names back to index indices
      const index = steps.findIndex(s => s.name === neighbor);
      if (index !== -1) {
        if (isCyclic(index)) return true;
      }
    }

    recStack.delete(node);
    return false;
  };

  for (let i = 0; i < steps.length; i++) {
    if (isCyclic(i)) {
      throw new Error('DAG Validation: Circular workflow loop configuration detected.');
    }
  }
  return true;
};

module.exports = {
  CreateWorkflowSchema,
  validateDagStructure
};
