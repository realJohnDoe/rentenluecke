import { useEffect, useRef, useState } from 'react'

/**
 * Moves focus into a newly added list entry's name field.
 *
 * Without it, pressing "Rente hinzufügen" leaves focus on the add button while
 * the button itself moves down the page — a keyboard user has to hunt for the
 * card that just appeared, and on a phone the new card's first field still has
 * to be tapped. The new entry is always appended, so the field to focus is the
 * first text input of the last list item.
 *
 * The signal is set by the caller rather than derived from the list's length,
 * so importing a plan — which also grows the list — does not steal focus.
 *
 * Usage:
 *
 * ```tsx
 * const { listRef, focusAfterAdd } = useFocusOnAdd()
 * <Button onClick={() => { focusAfterAdd(); dispatch({ type: 'addPension' }) }}>…</Button>
 * <ul ref={listRef}>…</ul>
 * ```
 */
export function useFocusOnAdd() {
  const listRef = useRef<HTMLUListElement>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!pending) return
    setPending(false)
    // React has already committed the new entry by the time effects run, so
    // the last item is the one that was just added.
    const field = listRef.current?.querySelector<HTMLInputElement>(
      'li:last-of-type input[type="text"]',
    )
    field?.focus()
  }, [pending])

  return { listRef, focusAfterAdd: () => setPending(true) }
}
