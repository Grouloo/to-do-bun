import type { UUID } from "../../types/uuid"
import { Table } from "../../Database"

export type Task = {
  id: UUID
  title : string
  description : string
  priority : Priority
  createdAt : string
  status : Status
}

export enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum Status {
    TO_DO = "to_do",
    IN_PROGRESS = "in_progress",
    DONE = "done",
    CANCELLED ="cancelled",
}

export const TaskTable = Table<Task>({
  table: "task",
  primaryKey: "id",
  schema: {
    id: {
      type: "text",
    },
    title: {
      type: "text",
    },
    description: {
      type: "text",
    },
    priority: {
      type: "text",
    },
    createdAt: {
      type: "text",
    },
    status: {
      type: "text",
    },
  },
})