import type { ChildSessionRecordStatus } from "./child-sessions-types"
import type { ChildSession } from "./child-sessions-types"

export type ChildSessionStatusTone = "success" | "warning" | "error" | "muted"

export type ChildSessionStatusMeta = {
  icon: string
  tone: ChildSessionStatusTone
}

export const DEFAULT_CHILD_SESSION_LABEL_MAX_LENGTH = 72

export function formatChildSessionLabel(session: ChildSession): string {
  const agent = session.agent ?? "unknown"
  const title = (session.title ?? "Cooking stuff").replace(/\s*\(@[^)]* subagent\)$/u, "")
  return `[${agent}] ${title}`
}

export function truncateChildSessionLabel(label: string, maxLength = DEFAULT_CHILD_SESSION_LABEL_MAX_LENGTH): string {
  if (label.length <= maxLength) return label
  if (maxLength <= 1) return label.slice(0, maxLength)
  return `${label.slice(0, maxLength - 1)}…`
}

export function getChildStatusMeta(status: ChildSessionRecordStatus): ChildSessionStatusMeta {
  switch (status) {
    case "active":
      return { icon: "●", tone: "success" }
    case "retry":
      return { icon: "◐", tone: "warning" }
    case "error":
      return { icon: "✖", tone: "error" }
    default:
      return { icon: "○", tone: "muted" }
  }
}
