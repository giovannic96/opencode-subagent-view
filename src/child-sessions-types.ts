import type { Part } from "@opencode-ai/sdk/v2"

export type ChildSession = {
  id: string
  parentID?: string
  title?: string
  agent?: string
}

export const CHILD_SESSION_EVENT_TYPES = [
  "session.created",
  "session.updated",
  "session.status",
  "session.idle",
  "session.deleted",
  "session.next.step.ended",
  "session.next.step.failed",
  "session.next.tool.input.started",
  "session.next.tool.called",
  "session.next.retried",
  "message.part.updated",
] as const

export type ChildSessionEventType = (typeof CHILD_SESSION_EVENT_TYPES)[number]

export type ChildSessionStatus = {
  type: "idle" | "retry" | "busy"
}

export type ChildSessionEvent =
  | {
      type: "session.created" | "session.updated"
      properties: {
        sessionID: string
        info: ChildSession
      }
    }
  | {
      type: "session.deleted"
      properties: {
        sessionID: string
        info: ChildSession
      }
    }
  | {
      type: "session.status"
      properties: {
        sessionID: string
        status: ChildSessionStatus
      }
    }
  | {
      type: "session.idle"
      properties: {
        sessionID: string
      }
    }
  | {
      type: "session.next.step.ended"
      properties: {
        sessionID: string
      }
    }
  | {
      type: "session.next.step.failed"
      properties: {
        sessionID: string
      }
    }
  | {
      type: "session.next.tool.input.started"
      properties: {
        sessionID: string
        name: string
      }
    }
    | {
      type: "session.next.tool.called"
      properties: {
        sessionID: string
        tool: string
        input?: Record<string, unknown>
        provider?: {
          executed: boolean
          metadata?: Record<string, Record<string, unknown>>
        }
      }
    }
  | {
      type: "session.next.retried"
      properties: {
        sessionID: string
        attempt: number
      }
    }
  | {
      type: "message.part.updated"
      properties: {
        sessionID: string
        part: Part
        time: number
      }
    }

export type ChildSessionRecordStatus = "active" | "idle" | "retry" | "error"

export type ChildSessionRecord = {
  id: string
  label: string
  status: ChildSessionRecordStatus
  activity?: string
}

export type ChildSessionRecords = ReadonlyMap<string, ChildSessionRecord>
