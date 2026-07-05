export type ChildSession = {
  id: string
  parentID?: string
}

export const CHILD_SESSION_EVENT_TYPES = [
  "session.created",
  "session.updated",
  "session.deleted",
] as const

export type ChildSessionEventType = (typeof CHILD_SESSION_EVENT_TYPES)[number]

/**
 * The three session lifecycle events that can change whether a session
 * counts as a child of the current one. Matches the SDK's event shape:
 * `event.properties.info` is the full session, `event.properties.sessionID`
 * is a redundant top-level id.
 */
export type ChildSessionEvent = {
  type: ChildSessionEventType
  properties: {
    sessionID: string
    info: ChildSession
  }
}

export function isChildOf(session: ChildSession, parentSessionID: string): boolean {
  return session.parentID === parentSessionID
}

/** Build the initial set of child session ids from a one-time snapshot (e.g. `client.session.children`). */
export function seedChildIds(sessions: readonly ChildSession[], parentSessionID: string): ReadonlySet<string> {
  const ids = new Set<string>()
  for (const session of sessions) {
    if (isChildOf(session, parentSessionID)) ids.add(session.id)
  }
  return ids
}

/**
 * Update the current child-id set from one live session event.
 *
 * - `session.created` and `session.updated` add the session id when it now
 *   belongs to the current parent, or remove it when it no longer does.
 * - `session.deleted` removes the session id if it is currently tracked.
 * - If the event does not change membership, return the same set reference so
 *   Solid can skip a pointless update.
 */
export function updateChildSessionMembership(
  ids: ReadonlySet<string>,
  parentSessionID: string,
  event: ChildSessionEvent,
): ReadonlySet<string> {
  const { info } = event.properties

  switch (event.type) {
    case "session.deleted": {
      if (!ids.has(info.id)) return ids
      const next = new Set(ids)
      next.delete(info.id)
      return next
    }

    case "session.created":
    case "session.updated": {
      const belongs = isChildOf(info, parentSessionID)
      const isTracked = ids.has(info.id)
      if (belongs === isTracked) return ids

      const next = new Set(ids)
      if (belongs) next.add(info.id)
      else next.delete(info.id)
      return next
    }
  }
}
