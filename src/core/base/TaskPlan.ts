import type { SchemaTaskPlan } from '@interfaces/index'

/**
 * Handles task planning operations with task management and status tracking.
 * @description Executes task planning operations including create, update, get, and clear actions.
 */
export default class TaskPlan {
  /** Static array to store tasks in memory */
  private static taskData: SchemaTaskPlan[] = []
  /** The action to perform on the task list */
  private readonly action: 'create' | 'update' | 'get' | 'clear'
  /** Unique identifier for the task item */
  private readonly id?: number | undefined
  /** The main title or description of the task item */
  private readonly title?: string | undefined
  /** Detailed description of the task item */
  private readonly description?: string | undefined
  /** Current status of the task item */
  private readonly status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | undefined

  /**
   * Creates a new TaskPlan instance.
   * @description Initializes the task planning operation with action and optional task data.
   * @param args - The task planning schema containing action and optional task data
   */
  constructor(args: SchemaTaskPlan) {
    const { action, id, title, description, status }: SchemaTaskPlan = args
    this.action = action
    this.id = id
    this.title = title
    this.description = description
    this.status = status
  }

  /**
   * Executes the task planning operation.
   * @description Performs validation and executes the specified task action.
   * @returns Task operation result or error message if validation/execution fails
   * @throws {Error} When task operations fail or validation errors occur
   */
  execute(): string {
    switch (this.action) {
      case 'create':
        return this.createTask()
      case 'update':
        return this.updateTask()
      case 'clear':
        return this.clearTask()
      case 'get':
        return this.getTask()
      default:
        return `Error! Unknown action: ${String(this.action)}`
    }
  }

  /**
   * Creates a new task.
   * @description Creates a new task with the provided data and stores it in memory array.
   * @returns Success message with task details
   */
  private createTask(): string {
    if (this.title === undefined || this.title.trim() === '') {
      return 'Error! Title is required for create action.'
    }
    if (this.id === undefined) {
      return 'Error! Task ID is required for create action.'
    }
    const newTask: SchemaTaskPlan = {
      action: 'create',
      id: this.id,
      title: this.title,
      description: this.description ?? '',
      status: this.status ?? 'pending'
    }
    TaskPlan.taskData.push(newTask)
    TaskPlan.taskData.sort((a: SchemaTaskPlan, b: SchemaTaskPlan) => (a.id ?? 0) - (b.id ?? 0))
    return `Task created successfully!\n\n${this.getTask()}`
  }

  /**
   * Updates an existing task.
   * @description Updates the specified task with new data.
   * @returns Success message with updated task details
   */
  private updateTask(): string {
    if (this.id === undefined) {
      return 'Error! Task ID is required for update action.'
    }
    const taskIndex: number = TaskPlan.taskData.findIndex(
      (task: SchemaTaskPlan) => task.id === this.id
    )
    if (taskIndex === -1) {
      return `Error! Task with ID ${this.id} not found.`
    }
    const existingTask: SchemaTaskPlan | undefined = TaskPlan.taskData[taskIndex]
    if (!existingTask) {
      return `Error! Task with ID ${this.id} not found.`
    }
    const updatedTask: SchemaTaskPlan = {
      action: 'update',
      id: this.id,
      title: this.title ?? existingTask.title ?? '',
      description: this.description ?? existingTask.description ?? '',
      status: this.status ?? existingTask.status ?? 'pending'
    }
    TaskPlan.taskData[taskIndex] = updatedTask
    return `Task updated successfully!\n\n${this.getTask()}`
  }

  /**
   * Clears all tasks.
   * @description Clears all tasks from the task list.
   * @returns Success message
   */
  private clearTask(): string {
    TaskPlan.taskData = []
    return 'All tasks cleared successfully!'
  }

  /**
   * Retrieves task information.
   * @description Gets information about the specified task or lists all tasks.
   * @returns Task information or task list
   */
  private getTask(): string {
    if (TaskPlan.taskData.length === 0) {
      return 'No tasks found.'
    }
    const taskList: string = TaskPlan.taskData
      .map((task: SchemaTaskPlan) => {
        const statusIcon: string = this.getStatusIcon(task.status ?? 'pending')
        return `${statusIcon} ${task.title} [ID: ${task.id}]\n${task.description}\n`
      })
      .join('\n')
    return taskList
  }

  /**
   * Gets the status icon for the specified status.
   * @description Returns the appropriate status icon based on the status.
   * @returns Status icon
   */
  private getStatusIcon(status: string): string {
    switch (status) {
      case 'pending':
        return '[ ]'
      case 'in_progress':
        return '[/]'
      case 'cancelled':
        return '[-]'
      case 'completed':
        return '[x]'
      default:
        return '[ ]'
    }
  }
}
