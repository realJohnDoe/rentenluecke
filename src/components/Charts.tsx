import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReactNode } from 'react'
import type { ChartRow, ChartSeries } from '../model/chartRows'
import type { Timeline } from '../model/finance'
import { chartInk } from '../theme'
import { formatAge, formatEuro, formatEuroAxis } from '../format'
import { de } from '../i18n/de'

const SYNC_ID = 'rentenluecke'
const AXIS_WIDTH = 76
const CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 }
const GAP_PATTERN_ID = 'gap-hatch'

type Props = {
  rows: ChartRow[]
  assetSeries: ChartSeries[]
  incomeSeries: ChartSeries[]
  timeline: Timeline
}

export function Charts({ rows, assetSeries, incomeSeries, timeline }: Props) {
  const ticks = ageTicks(timeline)
  const domain: [number, number] = [timeline.currentAge, timeline.endAge]
  const assetMax = niceMax(Math.max(...rows.map((row) => row.totalAssetValue), 0))
  // The income stack is topped off by the gap, so it never rises above the target.
  const incomeMax = niceMax(
    Math.max(...rows.map((row) => Math.max(row.totalIncome, row.target)), 0),
  )

  return (
    <div className="flex flex-col gap-2">
      <Panel
        title={de.assetsPanelTitle}
        hint={de.assetsPanelHint}
        series={assetSeries}
        height={200}
      >
        <ComposedChart data={rows} syncId={SYNC_ID} margin={CHART_MARGIN}>
          <CartesianGrid stroke={chartInk.grid} vertical={false} />
          <XAxis
            dataKey="age"
            type="number"
            domain={domain}
            ticks={ticks}
            tick={false}
            height={24}
            stroke={chartInk.axis}
          />
          <YAxis
            width={AXIS_WIDTH}
            domain={[0, assetMax]}
            tickCount={5}
            allowDecimals={false}
            stroke={chartInk.axis}
            tick={{ fill: chartInk.muted, fontSize: 12 }}
            tickFormatter={formatEuroAxis}
          />
          <RetirementMarker age={timeline.retirementAge} withLabel />
          {assetSeries.map((series) => (
            <Area
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stackId="assets"
              fill={series.color}
              fillOpacity={1}
              stroke={chartInk.surface}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
          <Tooltip
            cursor={{ stroke: chartInk.axis, strokeWidth: 1 }}
            content={(props) => (
              <ChartTooltip
                {...asTooltipProps(props)}
                rows={rows}
                series={assetSeries}
                totalKey="totalAssetValue"
                totalLabel={de.assetsPanelTitle}
              />
            )}
          />
        </ComposedChart>
      </Panel>

      <Panel
        title={de.incomePanelTitle}
        hint={de.incomePanelHint}
        series={incomeSeries}
        extraLegend={[
          { key: 'target', name: de.target, color: chartInk.primary, kind: 'line' },
          { key: 'gap', name: de.gap, color: chartInk.gap, kind: 'hatch' },
        ]}
        height={280}
      >
        <ComposedChart data={rows} syncId={SYNC_ID} margin={CHART_MARGIN}>
          <defs>
            <pattern
              id={GAP_PATTERN_ID}
              patternUnits="userSpaceOnUse"
              width="7"
              height="7"
              patternTransform="rotate(45)"
            >
              <rect width="7" height="7" fill={chartInk.gap} fillOpacity={0.12} />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke={chartInk.gap}
                strokeWidth="2"
                strokeOpacity={0.5}
              />
            </pattern>
          </defs>
          <CartesianGrid stroke={chartInk.grid} vertical={false} />
          <XAxis
            dataKey="age"
            type="number"
            domain={domain}
            ticks={ticks}
            height={24}
            stroke={chartInk.axis}
            tick={{ fill: chartInk.muted, fontSize: 12 }}
            tickFormatter={formatAge}
          />
          <YAxis
            width={AXIS_WIDTH}
            domain={[0, incomeMax]}
            tickCount={5}
            allowDecimals={false}
            stroke={chartInk.axis}
            tick={{ fill: chartInk.muted, fontSize: 12 }}
            tickFormatter={formatEuroAxis}
          />
          <RetirementMarker age={timeline.retirementAge} />
          {incomeSeries.map((series) => (
            <Area
              key={series.key}
              type="monotone"
              dataKey={series.key}
              name={series.name}
              stackId="income"
              fill={series.color}
              fillOpacity={1}
              stroke={chartInk.surface}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
          {/* Stacked on top of the income bands, so it reaches exactly the target. */}
          <Area
            type="monotone"
            dataKey="gap"
            name={de.gap}
            stackId="income"
            fill={`url(#${GAP_PATTERN_ID})`}
            stroke={chartInk.gap}
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="target"
            name={de.target}
            stroke={chartInk.primary}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          <Tooltip
            cursor={{ stroke: chartInk.axis, strokeWidth: 1 }}
            content={(props) => (
              <ChartTooltip
                {...asTooltipProps(props)}
                rows={rows}
                series={incomeSeries}
                totalKey="totalIncome"
                totalLabel={de.totalIncome}
                showTargetAndGap
              />
            )}
          />
        </ComposedChart>
      </Panel>

      <p className="text-center text-xs" style={{ color: chartInk.muted }}>
        {de.axisAge}
      </p>
    </div>
  )
}

type LegendEntry = ChartSeries & { kind?: 'area' | 'line' | 'hatch' }

function Panel({
  title,
  hint,
  series,
  extraLegend = [],
  height,
  children,
}: {
  title: string
  hint: string
  series: ChartSeries[]
  extraLegend?: LegendEntry[]
  height: number
  children: ReactNode
}) {
  return (
    <section
      className="rounded-lg border p-3"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mb-2 text-xs" style={{ color: chartInk.muted }}>
        {hint}
      </p>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      <Legend entries={[...series, ...extraLegend]} />
    </section>
  )
}

function Legend({ entries }: { entries: LegendEntry[] }) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-1.5">
          <Swatch entry={entry} />
          <span style={{ color: chartInk.secondary }}>{entry.name}</span>
        </li>
      ))}
    </ul>
  )
}

function Swatch({ entry }: { entry: LegendEntry }) {
  if (entry.kind === 'line') {
    return (
      <span
        aria-hidden
        className="inline-block h-0.5 w-4 rounded-full"
        style={{ background: entry.color }}
      />
    )
  }
  if (entry.kind === 'hatch') {
    // The chart's SVG pattern cannot be referenced from an HTML element, so the
    // legend repeats the same 45° hatch as a CSS gradient.
    return (
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-sm"
        style={{
          border: `1px solid ${entry.color}`,
          backgroundImage: `repeating-linear-gradient(45deg, transparent 0 2px, ${entry.color} 2px 3.5px)`,
        }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="inline-block h-3 w-3 rounded-sm"
      style={{ background: entry.color }}
    />
  )
}

function RetirementMarker({ age, withLabel = false }: { age: number; withLabel?: boolean }) {
  return (
    <ReferenceLine
      x={age}
      stroke={chartInk.secondary}
      strokeDasharray="4 4"
      label={
        withLabel
          ? {
              value: `${de.retirementStart} ${formatAge(age)}`,
              position: 'insideTopLeft',
              fill: chartInk.secondary,
              fontSize: 12,
            }
          : undefined
      }
    />
  )
}

type TooltipState = { active?: boolean; label?: number }

/** Recharts types its `content` callback loosely; we only need these two fields. */
function asTooltipProps(props: unknown): TooltipState {
  const { active, label } = props as { active?: boolean; label?: unknown }
  return { active, label: typeof label === 'number' ? label : undefined }
}

function ChartTooltip({
  active,
  label,
  rows,
  series,
  totalKey,
  totalLabel,
  showTargetAndGap = false,
}: TooltipState & {
  rows: ChartRow[]
  series: ChartSeries[]
  totalKey: 'totalIncome' | 'totalAssetValue'
  totalLabel: string
  showTargetAndGap?: boolean
}) {
  if (!active || label === undefined) return null
  const row = rows.find((candidate) => candidate.age === label)
  if (!row) return null

  return (
    <div
      className="rounded-md border px-3 py-2 text-xs shadow-sm"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <p className="mb-1 font-semibold">
        {de.axisAge} {formatAge(row.age)}
      </p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 tabular-nums">
        {series.map((entry) => (
          <TooltipRow
            key={entry.key}
            color={entry.color}
            name={entry.name}
            value={row[entry.key] ?? 0}
          />
        ))}
        <TooltipRow name={totalLabel} value={row[totalKey]} strong />
        {showTargetAndGap ? (
          <>
            <TooltipRow name={de.target} value={row.target} />
            <TooltipRow name={de.gap} value={row.gap} color={chartInk.gap} />
          </>
        ) : null}
      </dl>
    </div>
  )
}

function TooltipRow({
  color,
  name,
  value,
  strong = false,
}: {
  color?: string
  name: string
  value: number
  strong?: boolean
}) {
  return (
    <>
      <dt className={`flex items-center gap-1.5 ${strong ? 'font-semibold' : ''}`}>
        {color ? (
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-sm"
            style={{ background: color }}
          />
        ) : (
          <span aria-hidden className="inline-block h-2 w-2" />
        )}
        <span style={{ color: chartInk.secondary }}>{name}</span>
      </dt>
      <dd className={`text-right ${strong ? 'font-semibold' : ''}`}>{formatEuro(value)}</dd>
    </>
  )
}

/** Whole-year ticks at a spacing that keeps the axis readable at any span. */
function ageTicks(timeline: Timeline): number[] {
  const span = timeline.endAge - timeline.currentAge
  const step = span > 40 ? 10 : span > 20 ? 5 : span > 8 ? 2 : 1
  const first = Math.ceil(timeline.currentAge / step) * step
  const ticks: number[] = []
  for (let age = first; age <= timeline.endAge; age += step) ticks.push(age)
  return ticks
}

/**
 * Round an axis maximum up to a value whose quarters are still whole numbers, so
 * the ticks read 0 / 100.000 / 200.000 … instead of 0 / 85.000 / 170.000 …
 */
function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalised = value / magnitude
  const step = [1, 2, 4, 5, 8, 10].find((candidate) => normalised <= candidate) ?? 10
  return step * magnitude
}
