import { describe, expect, test } from "bun:test"
import { isChildOf, seedChildIds, updateChildSessionMembership, type ChildSessionEvent } from "../src/session-children"

const PARENT = "ses_parent"

function createdEvent(id: string, parentID?: string): ChildSessionEvent {
  return { type: "session.created", properties: { sessionID: id, info: { id, parentID } } }
}

function updatedEvent(id: string, parentID?: string): ChildSessionEvent {
  return { type: "session.updated", properties: { sessionID: id, info: { id, parentID } } }
}

function deletedEvent(id: string, parentID?: string): ChildSessionEvent {
  return { type: "session.deleted", properties: { sessionID: id, info: { id, parentID } } }
}

describe("isChildOf", () => {
  test("true when parentID matches", () => {
    expect(isChildOf({ id: "ses_a", parentID: PARENT }, PARENT)).toBe(true)
  })

  test("false when parentID differs", () => {
    expect(isChildOf({ id: "ses_a", parentID: "ses_other" }, PARENT)).toBe(false)
  })

  test("false when parentID is missing (a root session)", () => {
    expect(isChildOf({ id: "ses_a" }, PARENT)).toBe(false)
  })
})

describe("seedChildIds", () => {
  test("keeps only sessions whose parentID matches", () => {
    const ids = seedChildIds(
      [
        { id: "ses_a", parentID: PARENT },
        { id: "ses_b", parentID: "ses_other" },
        { id: "ses_c" },
        { id: "ses_d", parentID: PARENT },
      ],
      PARENT,
    )
    expect([...ids].sort()).toEqual(["ses_a", "ses_d"])
  })

  test("empty list in, empty set out", () => {
    expect(seedChildIds([], PARENT).size).toBe(0)
  })
})

describe("updateChildSessionMembership", () => {
  test("session.created for a matching child adds it", () => {
    const before = new Set<string>()
    const after = updateChildSessionMembership(before, PARENT, createdEvent("ses_a", PARENT))
    expect([...after]).toEqual(["ses_a"])
  })

  test("session.created for an unrelated session is a no-op and keeps the same reference", () => {
    const before = new Set<string>(["ses_existing"])
    const after = updateChildSessionMembership(before, PARENT, createdEvent("ses_other", "ses_not_our_parent"))
    expect(after).toBe(before)
  })

  test("session.updated re-adding an already-tracked child is a no-op and keeps the same reference", () => {
    const before = new Set<string>(["ses_a"])
    const after = updateChildSessionMembership(before, PARENT, updatedEvent("ses_a", PARENT))
    expect(after).toBe(before)
  })

  test("session.updated whose parentID no longer matches removes it (defensive case)", () => {
    const before = new Set<string>(["ses_a"])
    const after = updateChildSessionMembership(before, PARENT, updatedEvent("ses_a", "ses_someone_else"))
    expect([...after]).toEqual([])
  })

  test("session.deleted removes a tracked child", () => {
    const before = new Set<string>(["ses_a", "ses_b"])
    const after = updateChildSessionMembership(before, PARENT, deletedEvent("ses_a", PARENT))
    expect([...after].sort()).toEqual(["ses_b"])
  })

  test("session.deleted for an id we don't track is a no-op and keeps the same reference", () => {
    const before = new Set<string>(["ses_b"])
    const after = updateChildSessionMembership(before, PARENT, deletedEvent("ses_a", PARENT))
    expect(after).toBe(before)
  })
})
