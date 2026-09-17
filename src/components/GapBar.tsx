import type { ProjectionSummary } from '../model/types'
import { formatEuro } from '../format'
import { de } from '../i18n/de'

/**
 * A one-line live readout of the gap, pinned to the top of the viewport while
 * the input cards are being edited.
 *
 * On a phone the page is a single column with the results on top, so the
 * figure a field changes sits a screenful or more above the field itself. This
 * is rendered as the first child of the input column, which is what gives it
 * the right lifetime from plain `position: sticky` alone — no scroll listener:
 * it rides along for exactly as long as the inputs are on screen and is gone
 * again the moment the charts scroll back into view. From `lg` the two columns
 * are side by side and the Summary card never leaves the screen, so it is not
 * rendered at all.
 *
 * `aria-hidden` because it is a convenience copy: the same figure is in the
 * Summary card already, properly labelled, and announcing it a second time on
 * every keystroke would be noise.
 */
export function GapBar({ summary }: { summary: ProjectionSummary }) {
  const shortfall = summary.gapAtRetirement > 0

  return (
    <div
      aria-hidden
      /* `-mx-4 px-4` cancels the page gutter so the bar spans the full width
         once it is stuck — a pinned strip that stops short of the edges reads
         as a card that failed to scroll. */
      className="sticky top-0 z-10 -mx-4 flex items-baseline justify-between gap-2
        border-b border-hairline bg-surface px-4 py-2 shadow-sm sm:-mx-6 sm:px-6 lg:hidden"
    >
      <span className="min-w-0 truncate text-xs font-medium text-ink-secondary">
        {de.gapAtRetirement}
      </span>
      <span className="shrink-0 tabular-nums">
        <span className={`text-sm font-semibold ${shortfall ? 'text-critical' : ''}`}>
          {formatEuro(summary.gapAtRetirement)}
        </span>
        <span className="ml-1 text-xs font-normal text-ink-muted">{de.perMonth}</span>
      </span>
    </div>
  )
}
