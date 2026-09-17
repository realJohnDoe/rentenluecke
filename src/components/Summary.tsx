import type { ProjectionSummary } from '../model/types'
import { formatEuro } from '../format'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

export function Summary({ summary }: { summary: ProjectionSummary }) {
  return (
    <section
      className="rounded-lg border p-3"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <h2 className="mb-2 text-sm font-semibold">{de.summaryTitle}</h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Figure label={de.assetValueAtRetirement} value={formatEuro(summary.assetValueAtRetirement)} />
        <Figure
          label={de.incomeAtRetirement}
          value={formatEuro(summary.incomeAtRetirement)}
          note={de.perMonth}
        />
        <Figure
          label={de.gapAtRetirement}
          value={formatEuro(summary.gapAtRetirement)}
          note={de.perMonth}
          highlight={summary.gapAtRetirement > 0}
        />
        <Figure
          label={de.averageGap}
          value={formatEuro(summary.averageGap)}
          note={de.perMonth}
          highlight={summary.averageGap > 0}
        />
      </dl>
    </section>
  )
}

function Figure({
  label,
  value,
  note,
  highlight = false,
}: {
  label: string
  value: string
  note?: string
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-xs" style={{ color: chartInk.muted }}>
        {label}
      </dt>
      <dd
        className="text-lg font-semibold"
        style={highlight ? { color: chartInk.gap } : undefined}
      >
        {value}
        {note ? (
          <span className="ml-1 text-xs font-normal" style={{ color: chartInk.muted }}>
            {note}
          </span>
        ) : null}
      </dd>
    </div>
  )
}
