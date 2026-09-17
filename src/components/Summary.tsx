import { Card } from './ui/Card'
import type { ProjectionSummary } from '../model/types'
import { formatEuro } from '../format'
import { de } from '../i18n/de'

type Props = {
  summary: ProjectionSummary
  /** The inactive scenario's summary and name, shown as a smaller muted line. */
  ghostSummary: ProjectionSummary
  ghostScenarioName: string
}

export function Summary({ summary, ghostSummary, ghostScenarioName }: Props) {
  return (
    <Card title={de.summaryTitle}>
      {/*
       * `subgrid` is what keeps the four figures aligned: the labels wrap to
       * two lines at some widths and not others, and without a shared row
       * track the values underneath would sit at four different heights.
       */}
      <dl className="grid grid-cols-2 grid-rows-[auto_auto_auto] gap-x-4 gap-y-5 sm:grid-cols-4">
        <Figure
          label={de.assetValueAtRetirement}
          value={formatEuro(summary.assetValueAtRetirement)}
          ghostValue={formatEuro(ghostSummary.assetValueAtRetirement)}
          ghostScenarioName={ghostScenarioName}
        />
        <Figure
          label={de.incomeAtRetirement}
          value={formatEuro(summary.incomeAtRetirement)}
          note={de.perMonth}
          ghostValue={formatEuro(ghostSummary.incomeAtRetirement)}
          ghostScenarioName={ghostScenarioName}
        />
        <Figure
          label={de.gapAtRetirement}
          value={formatEuro(summary.gapAtRetirement)}
          note={de.perMonth}
          highlight={summary.gapAtRetirement > 0}
          ghostValue={formatEuro(ghostSummary.gapAtRetirement)}
          ghostScenarioName={ghostScenarioName}
        />
        <Figure
          label={de.averageGap}
          value={formatEuro(summary.averageGap)}
          note={de.perMonth}
          highlight={summary.averageGap > 0}
          ghostValue={formatEuro(ghostSummary.averageGap)}
          ghostScenarioName={ghostScenarioName}
        />
      </dl>
    </Card>
  )
}

function Figure({
  label,
  value,
  note,
  highlight = false,
  ghostValue,
  ghostScenarioName,
}: {
  label: string
  value: string
  note?: string
  highlight?: boolean
  ghostValue: string
  ghostScenarioName: string
}) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 gap-0">
      <dt className="text-xs leading-snug text-ink-muted">{label}</dt>
      <dd
        className={`self-end text-xl font-semibold tabular-nums tracking-tight
          ${highlight ? 'text-critical' : ''}`}
      >
        {value}
        {note ? (
          <span className="ml-1 text-xs font-normal text-ink-muted">{note}</span>
        ) : null}
      </dd>
      {/* A second `dd` rather than a `p`: only `dt` and `dd` are allowed
          inside a `dl`'s grouping `div`, and the ghost figure really is a
          second description of the same term. */}
      <dd className="mt-0.5 text-xs tabular-nums text-ink-muted">
        {ghostScenarioName}: {ghostValue}
      </dd>
    </div>
  )
}
