/**
 * Categorical slots from the validated palette, assigned in fixed order.
 * The order is the colour-blindness safety mechanism, so entries keep their slot
 * even when other entries are disabled — colour follows the entity, not its rank.
 */
const SERIES_SLOTS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
  'var(--series-6)',
  'var(--series-7)',
  'var(--series-8)',
] as const

/** Number of distinct colours available before entities have to be grouped. */
export const SERIES_SLOT_COUNT = SERIES_SLOTS.length

/**
 * Colour for the ninth-and-later entity. A generated hue would silently repeat
 * one already in use — indistinguishable from whichever entity holds that slot
 * — so overflow entities are folded into a single, explicitly ungrouped "Other"
 * band instead. See `chartRows.ts`.
 */
export const otherSeriesColor = 'var(--text-muted)'

/** `index` must be below `SERIES_SLOT_COUNT` — callers route anything at or
 * beyond it to `otherSeriesColor` rather than here. */
export function seriesColor(index: number): string {
  return SERIES_SLOTS[index] as string
}

export const chartInk = {
  surface: 'var(--surface)',
  grid: 'var(--gridline)',
  axis: 'var(--axis)',
  muted: 'var(--text-muted)',
  secondary: 'var(--text-secondary)',
  primary: 'var(--text-primary)',
  gap: 'var(--status-critical)',
} as const
