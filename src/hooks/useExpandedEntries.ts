import { useEffect, useState } from 'react'

/**
 * Tracks which entries in a list are expanded, keyed by id. Everything starts
 * collapsed — including a freshly loaded or imported plan, however many
 * entries it has.
 *
 * A newly added entry is the one exception: it should open immediately so its
 * defaults are editable without an extra tap. The signal for that is set by
 * the caller (see `expandAfterAdd`) rather than derived from the list growing,
 * for the same reason `useFocusOnAdd` takes an explicit signal instead of
 * watching the list's length — importing a plan grows the list too, and must
 * not expand it. The new entry is always appended, so the id to expand is
 * simply the last one once the signal fires.
 */
export function useExpandedEntries(ids: string[]) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const [pendingAdd, setPendingAdd] = useState(false)

  useEffect(() => {
    if (!pendingAdd) return
    setPendingAdd(false)
    const addedId = ids[ids.length - 1]
    if (addedId !== undefined) setExpandedIds((prev) => new Set(prev).add(addedId))
  }, [pendingAdd, ids])

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return {
    isExpanded: (id: string) => expandedIds.has(id),
    toggle,
    expandAfterAdd: () => setPendingAdd(true),
  }
}
