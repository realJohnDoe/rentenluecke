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

/** Number of distinct colours available before slots have to be reused. */
export const SERIES_SLOT_COUNT = SERIES_SLOTS.length

export function seriesColor(index: number): string {
  return SERIES_SLOTS[index % SERIES_SLOT_COUNT] as string
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
