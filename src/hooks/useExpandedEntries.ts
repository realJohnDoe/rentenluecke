import { useEffect, useRef, useState } from 'react'

/**
 * Tracks which entries in a list are expanded, keyed by id.
 *
 * Newly added entries (ids not present on the previous render) start expanded
 * so their defaults are immediately editable — the reason this needs to watch
 * `ids` at all rather than being plain `useState`. Pensions and assets behave
 * identically here, so the rule lives in one place.
 */
export function useExpandedEntries(ids: string[]) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set())
  const knownIds = useRef(new Set(ids))

  // `ids` is a fresh array on every render, so the effect is keyed on its
  // contents instead. Ids can come from an imported file, so they are compared
  // as JSON rather than joined on a separator they might contain.
  const idKey = JSON.stringify(ids)
  useEffect(() => {
    const currentIds = JSON.parse(idKey) as string[]
    const added = currentIds.filter((id) => !knownIds.current.has(id))
    if (added.length > 0) setExpandedIds((prev) => new Set([...prev, ...added]))
    knownIds.current = new Set(currentIds)
  }, [idKey])

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return { isExpanded: (id: string) => expandedIds.has(id), toggle }
}
