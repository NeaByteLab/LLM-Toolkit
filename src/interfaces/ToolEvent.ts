/**
 * Event data for when a tool is requested.
 * @description Contains information about a tool that has been requested for execution.
 */
export interface ToolRequestedEvent {
  /** The name of the tool being requested */
  toolName: string
  /** The arguments to pass to the tool */
  arguments: Record<string, unknown>
}

/**
 * Event data for when a tool execution is completed.
 * @description Contains information about a tool execution result.
 */
export interface ToolResponseEvent {
  /** The name of the tool that was executed */
  toolName: string
  /** The arguments that were passed to the tool */
  arguments: Record<string, unknown>
  /** The result of the tool execution */
  result: string
}
