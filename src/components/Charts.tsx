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
import type { ValueMode } from '../model/types'
import { Card } from './ui/Card'
import { useMediaQuery, NARROW_QUERY } from '../hooks/useMediaQuery'
import { chartInk } from '../theme'
import { formatAge, formatAxisNumber, formatEuro, formatEuroAxis } from '../format'
import { de } from '../i18n/de'

const SYNC_ID = 'rentenluecke'
const CHART_MARGIN = { top: 8, right: 16, bottom: 0, left: 0 }
const GAP_PATTERN_ID = 'gap-hatch'

/**
 * The y-axis gutter. "400.000 €" needs all 76px, which on a desktop panel is
 * fine but on a phone is a fifth of the viewport spent on tick labels — so a
 * narrow panel scales its ticks down to bare digits (see `axisScale`) and
 * needs far less room for them. 46px is set by the widest tick the scaling
 * leaves alone: a four-digit figure under ten thousand, like "9.999".
 */
const AXIS_WIDTH = { wide: 76, narrow: 46 }

/**
 * How a panel labels its y-axis, given the largest value it has to show.
 *
 * A wide panel spells every tick out in full. A narrow one divides the ticks
 * down to two or three digits and names the factor once, in the panel header:
 * "400" under a "Tsd. €" heading rather than "400.000 €" five times down the
 * gutter. Ticks are left free of spaces on purpose — Recharts word-wraps tick
 * text onto a second line whatever width the axis is given, so "400 Tsd."
 * renders as "400" over "Tsd." and no gutter width fixes it.
 */
function axisScale(max: number, narrow: boolean) {
  if (!narrow) {
    return { width: AXIS_WIDTH.wide, format: formatEuroAxis, unit: de.axisUnitEuro, scaled: false }
  }
  const [divisor, unit] =
    max >= 1_000_000
      ? [1_000_000, de.axisUnitMillionEuro]
      : max >= 10_000
        ? [1000, de.axisUnitThousandEuro]
        : [1, de.axisUnitEuro]
  return {
    width: AXIS_WIDTH.narrow,
    format: (value: number) => formatAxisNumber(value / divisor),
    unit,
    scaled: true,
  }
}

/**
 * Panel heights. The wide values are taller because the desktop layout puts
 * the charts beside a tall column of inputs and would otherwise leave the
 * bottom half of the page empty; the income panel is the taller of the two in
 * both cases because it carries a stack, a target line and the gap.
 */
const PANEL_HEIGHT = {
  assets: { wide: 260, narrow: 190 },
  income: { wide: 340, narrow: 250 },
}

type Props = {
  rows: ChartRow[]
  assetSeries: ChartSeries[]
  incomeSeries: ChartSeries[]
  timeline: Timeline
  valueMode: ValueMode
  /** Name of the inactive scenario, shown on the dashed ghost line. */
  ghostScenarioName: string
}

export function Charts({
  rows,
  assetSeries,
  incomeSeries,
  timeline,
  valueMode,
  ghostScenarioName,
}: Props) {
  const narrow = useMediaQuery(NARROW_QUERY)
  const ticks = ageTicks(timeline, narrow)
  const domain: [number, number] = [timeline.currentAge, timeline.endAge]
  const assetMax = niceMax(
    Math.max(...rows.map((row) => Math.max(row.totalAssetValue, row.ghostAssetValue)), 0),
  )
  // The income stack is topped off by the gap, so it never rises above the target.
  const incomeMax = niceMax(
    Math.max(...rows.map((row) => Math.max(row.totalIncome, row.target, row.ghostIncome)), 0),
  )
  const assetAxis = axisScale(assetMax, narrow)
  const incomeAxis = axisScale(incomeMax, narrow)

  const ghostLegend = (key: string): LegendEntry => ({
    key,
    name: ghostScenarioName,
    color: chartInk.secondary,
    kind: 'dashed',
  })
  const targetLegendName =
    valueMode === 'nominal' ? `${de.target} · ${de.kaufkrafterhalt}` : de.target

  return (
    <div className="flex flex-col gap-3">
      <Panel
        title={de.assetsPanelTitle}
        hint={de.assetsPanelHint}
        /* A wide panel spells "400.000 €" out on every tick, so repeating the
         * unit in the header would say nothing. A scaled one has to name the
         * factor its bare digits stand for. */
        unit={assetAxis.scaled ? assetAxis.unit : undefined}
        series={assetSeries}
        extraLegend={[ghostLegend('ghostAssetValue')]}
        height={narrow ? PANEL_HEIGHT.assets.narrow : PANEL_HEIGHT.assets.wide}
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
            width={assetAxis.width}
            domain={[0, assetMax]}
            tickCount={5}
            allowDecimals={false}
            stroke={chartInk.axis}
            tick={{ fill: chartInk.muted, fontSize: 12 }}
            tickFormatter={assetAxis.format}
          />
          <RetirementMarker age={timeline.retirementAge} withLabel={!narrow} />
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
          <Line
            type="monotone"
            dataKey="ghostAssetValue"
            name={ghostScenarioName}
            stroke={chartInk.secondary}
            strokeDasharray="5 4"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
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
        unit={de.axisUnitPerMonth(incomeAxis.unit)}
        series={incomeSeries}
        extraLegend={[
          { key: 'target', name: targetLegendName, color: chartInk.primary, kind: 'line' },
          { key: 'gap', name: de.gap, color: chartInk.gap, kind: 'hatch' },
          ghostLegend('ghostIncome'),
        ]}
        height={narrow ? PANEL_HEIGHT.income.narrow : PANEL_HEIGHT.income.wide}
        /* Only the lower panel labels the shared age axis — the two are stacked
         * and synced, so repeating it on both would just be noise. */
        axisLabel={de.axisAge}
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
            width={incomeAxis.width}
            domain={[0, incomeMax]}
            tickCount={5}
            allowDecimals={false}
            stroke={chartInk.axis}
            tick={{ fill: chartInk.muted, fontSize: 12 }}
            tickFormatter={incomeAxis.format}
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
          <Line
            type="monotone"
            dataKey="ghostIncome"
            name={ghostScenarioName}
            stroke={chartInk.secondary}
            strokeDasharray="5 4"
            strokeWidth={1.5}
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
    </div>
  )
}

type LegendEntry = ChartSeries & { kind?: 'area' | 'line' | 'hatch' | 'dashed' }

function Panel({
  title,
  hint,
  unit,
  series,
  extraLegend = [],
  height,
  axisLabel,
  children,
}: {
  title: string
  hint: string
  /** The y-axis unit, shown next to the title rather than rotated up the axis.
   * Omitted where the ticks already state it. */
  unit?: string
  series: ChartSeries[]
  extraLegend?: LegendEntry[]
  height: number
  axisLabel?: string
  children: ReactNode
}) {
  return (
    <Card
      title={title}
      hint={hint}
      aside={
        unit ? <span className="text-xs tabular-nums text-ink-muted">{unit}</span> : undefined
      }
    >
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
      {axisLabel ? (
        <p className="mt-1 text-center text-xs text-ink-muted">{axisLabel}</p>
      ) : null}
      <Legend entries={[...series, ...extraLegend]} />
    </Card>
  )
}

function Legend({ entries }: { entries: LegendEntry[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
      {entries.map((entry) => (
        <li key={entry.key} className="flex items-center gap-1.5">
          <Swatch entry={entry} />
          <span className="text-ink-secondary">{entry.name}</span>
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
        className="inline-block h-0.5 w-4 shrink-0 rounded-full"
        style={{ background: entry.color }}
      />
    )
  }
  if (entry.kind === 'dashed') {
    return (
      <span
        aria-hidden
        className="inline-block w-4 shrink-0"
        style={{ borderTop: `1.5px dashed ${entry.color}` }}
      />
    )
  }
  if (entry.kind === 'hatch') {
    // The chart's SVG pattern cannot be referenced from an HTML element, so the
    // legend repeats the same 45° hatch as a CSS gradient.
    return (
      <span
        aria-hidden
        className="inline-block size-3 shrink-0 rounded-sm"
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
      className="inline-block size-3 shrink-0 rounded-sm"
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
    <div className="max-w-[min(16rem,80vw)] rounded-lg border border-hairline bg-surface px-3 py-2 text-xs shadow-lg">
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
            className="inline-block size-2 shrink-0 rounded-sm"
            style={{ background: color }}
          />
        ) : (
          <span aria-hidden className="inline-block size-2 shrink-0" />
        )}
        <span className="text-ink-secondary">{name}</span>
      </dt>
      <dd className={`text-right ${strong ? 'font-semibold' : ''}`}>{formatEuro(value)}</dd>
    </>
  )
}

/**
 * Whole-year ticks at a spacing that keeps the axis readable at any span.
 * A phone fits roughly half as many labels as a desktop panel, so it takes the
 * next coarser step.
 */
function ageTicks(timeline: Timeline, narrow = false): number[] {
  const span = timeline.endAge - timeline.currentAge
  const wideStep = span > 40 ? 10 : span > 20 ? 5 : span > 8 ? 2 : 1
  const step = narrow ? nextCoarserStep(wideStep) : wideStep
  const first = Math.ceil(timeline.currentAge / step) * step
  const ticks: number[] = []
  for (let age = first; age <= timeline.endAge; age += step) ticks.push(age)
  return ticks
}

const STEPS = [1, 2, 5, 10, 20] as const

function nextCoarserStep(step: number): number {
  return STEPS.find((candidate) => candidate > step) ?? step
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
