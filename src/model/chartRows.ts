import type { Plan, Projection } from './types'
import { otherSeriesColor, seriesColor, SERIES_SLOT_COUNT } from '../theme'
import { de } from '../i18n/de'

/** A projection point flattened into the shape Recharts wants. */
export type ChartRow = {
  age: number
  target: number
  gap: number
  totalIncome: number
  totalAssetValue: number
  /** Total for the inactive scenario, drawn as a dashed outline. */
  ghostAssetValue: number
  ghostIncome: number
  /** Sum of every asset beyond the eight-colour palette. See `isOverflowAsset`/`isOverflowPension`. */
  otherAssetValue: number
  /** Sum of every pension and withdrawal beyond the eight-colour palette. */
  otherIncome: number
} & Record<string, number>

/** One stacked band in a chart panel. */
export type ChartSeries = {
  key: string
  name: string
  color: string
}

export const assetValueKey = (id: string) => `assetValue:${id}`
export const withdrawalKey = (id: string) => `withdrawal:${id}`
export const pensionKey = (id: string) => `pension:${id}`

/**
 * `ghostProjection`, when given, is the inactive scenario's projection — same
 * plan and value mode, only the contribution behaviour differs, so it always
 * has exactly as many points as `projection`.
 */
export function toChartRows(
  plan: Plan,
  projection: Projection,
  ghostProjection?: Projection,
): ChartRow[] {
  return projection.points.map((point, index) => {
    const ghostPoint = ghostProjection?.points[index]
    const row: ChartRow = {
      age: point.age,
      target: point.target,
      gap: point.gap,
      totalIncome: point.totalMonthlyIncome,
      totalAssetValue: point.totalAssetValue,
      ghostAssetValue: ghostPoint?.totalAssetValue ?? 0,
      ghostIncome: ghostPoint?.totalMonthlyIncome ?? 0,
      otherAssetValue: 0,
      otherIncome: 0,
    }
    for (const [id, value] of Object.entries(point.assetValues)) {
      if (isOverflowAsset(plan, id)) row.otherAssetValue += value
      else row[assetValueKey(id)] = value
    }
    for (const [id, value] of Object.entries(point.withdrawalIncome)) {
      if (isOverflowAsset(plan, id)) row.otherIncome += value
      else row[withdrawalKey(id)] = value
    }
    for (const [id, value] of Object.entries(point.pensionIncome)) {
      if (isOverflowPension(plan, id)) row.otherIncome += value
      else row[pensionKey(id)] = value
    }
    return row
  })
}

/**
 * Whether an entity falls outside the eight-colour palette, judged by its own
 * `colorIndex` (see `Pension`/`Asset` in `types.ts`) rather than its current
 * position — the slot is assigned once, at creation, and never moves, so
 * dragging an entity around the list cannot push it into or out of overflow.
 * Any entity past the eighth slot folds into the "Other" band (`otherIncome`
 * / `otherAssetValue`) instead of reusing a hue that already names someone
 * else.
 */
function isOverflowPension(plan: Plan, id: string): boolean {
  const pension = plan.pensions.find((candidate) => candidate.id === id)
  return (pension?.colorIndex ?? 0) >= SERIES_SLOT_COUNT
}

function isOverflowAsset(plan: Plan, id: string): boolean {
  const asset = plan.assets.find((candidate) => candidate.id === id)
  return (asset?.colorIndex ?? 0) >= SERIES_SLOT_COUNT
}

/**
 * Colour slots are handed out across pensions and assets together, so an asset
 * keeps one identity in both panels and never shares a hue with a pension.
 * Each entry's slot is `colorIndex`, assigned once at creation: colour follows
 * the entity, not its rank, so disabling an entry or dragging it to a new spot
 * in the list never changes its colour — used both by the charts (only
 * enabled entries) and by the input cards (every entry, so a disabled one
 * still shows the swatch it would get if re-enabled). Past the eighth entity
 * there is no slot left to keep, so every later entry shares
 * `otherSeriesColor` — the same colour the chart groups it under.
 */
export function pensionColor(plan: Plan, id: string): string {
  const pension = plan.pensions.find((candidate) => candidate.id === id)
  const index = pension?.colorIndex ?? 0
  return index < SERIES_SLOT_COUNT ? seriesColor(index) : otherSeriesColor
}

export function assetColor(plan: Plan, id: string): string {
  const asset = plan.assets.find((candidate) => candidate.id === id)
  const index = asset?.colorIndex ?? 0
  return index < SERIES_SLOT_COUNT ? seriesColor(index) : otherSeriesColor
}

/**
 * Income series split by the two bands of the stack, in sidebar order —
 * the order the corresponding entry list (PensionList / AssetList) shows
 * them in, top to bottom. Kept apart rather than flattened so a consumer can
 * turn each band into stacking order separately (see `Charts.tsx`):
 * flattening first would lose the boundary between them.
 */
export type IncomeSeries = {
  pensions: ChartSeries[]
  withdrawals: ChartSeries[]
}

export function buildSeries(plan: Plan): { assets: ChartSeries[]; income: IncomeSeries } {
  const pensions = plan.pensions
    .filter((pension) => pension.enabled && !isOverflowPension(plan, pension.id))
    .map((pension) => ({
      key: pensionKey(pension.id),
      name: pension.name,
      color: pensionColor(plan, pension.id),
    }))

  const withdrawals = plan.assets
    .filter((asset) => asset.enabled && !isOverflowAsset(plan, asset.id))
    .map((asset) => ({
      key: withdrawalKey(asset.id),
      name: de.withdrawalOf(asset.name),
      color: assetColor(plan, asset.id),
    }))

  const assets = plan.assets
    .filter((asset) => asset.enabled && !isOverflowAsset(plan, asset.id))
    .map((asset) => ({
      key: assetValueKey(asset.id),
      name: asset.name,
      color: assetColor(plan, asset.id),
    }))

  const hasOverflowPension = plan.pensions.some(
    (pension) => pension.enabled && isOverflowPension(plan, pension.id),
  )
  const hasOverflowAsset = plan.assets.some(
    (asset) => asset.enabled && isOverflowAsset(plan, asset.id),
  )
  const otherIncome =
    hasOverflowPension || hasOverflowAsset
      ? [{ key: 'otherIncome', name: de.otherSeries, color: otherSeriesColor }]
      : []
  const otherAssets = hasOverflowAsset
    ? [{ key: 'otherAssetValue', name: de.otherSeries, color: otherSeriesColor }]
    : []

  // Pensions sit at the bottom of the income stack: they are the part that
  // cannot run out, so the layer above them reads as the part that can. That
  // split is a deliberate choice, independent of sidebar order — Charts.tsx
  // is the one that turns each band's sidebar order into stacking order. The
  // "Other" band, when present, is appended after the real withdrawals — it
  // groups whichever entities ran out of colour slots, not a specific kind
  // of income, but has no sidebar entry of its own to slot in elsewhere.
  return {
    assets: [...assets, ...otherAssets],
    income: { pensions, withdrawals: [...withdrawals, ...otherIncome] },
  }
}
