import {
  CHILD_SESSION_EVENT_TYPES,
  seedChildIds,
  updateChildSessionMembership,
  type ChildSessionEvent,
} from "./session-children"
import type { TuiPluginApi } from "@opencode-ai/plugin/tui"

function mergeSeededIntoCurrentChildIds(current: ReadonlySet<string>, seeded: ReadonlySet<string>): ReadonlySet<string> {
  if (seeded.size === 0) return current

  const next = new Set(current)
  for (const childID of seeded) next.add(childID)
  return next.size === current.size ? current : next
}

function applyChildSessionEvent(
  parentSessionID: string,
  applyUpdate: (reducer: (current: ReadonlySet<string>) => ReadonlySet<string>) => void,
): (event: ChildSessionEvent) => void {
  return (event) => {
    applyUpdate((current) => updateChildSessionMembership(current, parentSessionID, event))
  }
}

/**
 * Seeds `sessionID`'s child ids from a one-time `client.session.children()`
 * snapshot, then subscribes to live session events to keep the set in sync.
 *
 * Returns an unsubscribe function.
 */
export function trackChildSessions(
  api: TuiPluginApi,
  parentSessionID: string,
  applyUpdate: (reducer: (current: ReadonlySet<string>) => ReadonlySet<string>) => void,
): () => void {
  void api.client.session
    .children({ sessionID: parentSessionID })
    .then((result) => {
      const seededChildIds = seedChildIds(result.data ?? [], parentSessionID)
      applyUpdate((current) => mergeSeededIntoCurrentChildIds(current, seededChildIds))
    })
    .catch(() => {})

  const handleChildSessionEvent = applyChildSessionEvent(parentSessionID, applyUpdate)
  const unsubscribeAll = CHILD_SESSION_EVENT_TYPES.map((type) => api.event.on(type, handleChildSessionEvent))

  return () => {
    for (const unsubscribe of unsubscribeAll) unsubscribe()
  }
}
