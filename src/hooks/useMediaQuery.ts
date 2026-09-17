import { useEffect, useState } from 'react'

/**
 * Subscribes to a media query. The charts need this in JavaScript rather than
 * in CSS because Recharts takes its axis width and panel height as numeric
 * props, so there is no class to swap at a breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setMatches(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])

  return matches
}

/** Below Tailwind's `sm` breakpoint the charts switch to their compact axis. */
export const NARROW_QUERY = '(max-width: 639px)'
