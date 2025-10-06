/**
 * Tool schema for task planning operations.
 * @description Defines the schema for creating and managing task lists with task breakdown and progress tracking.
 */
export default {
  type: 'function',
  function: {
    name: 'TaskPlan',
    description:
      'Create and manage task lists for complex projects. Breaks down large tasks into manageable subtasks with status tracking and progress monitoring. Useful for organizing multi-step development work. Status icons: [ ] = Not started, [/] = In progress, [-] = Cancelled, [x] = Completed.',
    parameters: {
      type: 'object',
      properties: {
        action: {
          type: 'string',
          enum: ['create', 'update', 'get', 'clear'],
          description:
            'The action to perform on the task list. Create new tasks, update existing ones, get current tasks, or clear all tasks.'
        },
        id: {
          type: 'number',
          description:
            'Unique identifier for the task item. Required for create and update actions.'
        },
        title: {
          type: 'string',
          description:
            'The main title or description of the task item. Should be clear and descriptive of what needs to be accomplished.'
        },
        description: {
          type: 'string',
          description:
            'Detailed description of the task item. Include specific requirements, acceptance criteria, or implementation details.'
        },
        status: {
          type: 'string',
          enum: ['pending', 'in_progress', 'completed', 'cancelled'],
          description:
            'Current status of the task item. Pending means not started, in_progress means currently being worked on, completed means finished, cancelled means no longer needed.'
        }
      },
      required: ['action']
    }
  }
}
