import type { Plan, Projection } from './types'
import { seriesColor } from '../theme'
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
export function toChartRows(projection: Projection, ghostProjection?: Projection): ChartRow[] {
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
    }
    for (const [id, value] of Object.entries(point.assetValues)) row[assetValueKey(id)] = value
    for (const [id, value] of Object.entries(point.withdrawalIncome)) {
      row[withdrawalKey(id)] = value
    }
    for (const [id, value] of Object.entries(point.pensionIncome)) row[pensionKey(id)] = value
    return row
  })
}

/**
 * Colour slots are handed out across pensions and assets together, so an asset
 * keeps one identity in both panels and never shares a hue with a pension.
 * Disabled entries keep their slot: colour follows the entity, not its rank —
 * used both by the charts (only enabled entries) and by the input cards (every
 * entry, so a disabled one still shows the swatch it would get if re-enabled).
 */
export function pensionColor(plan: Plan, id: string): string {
  const index = plan.pensions.findIndex((pension) => pension.id === id)
  return seriesColor(index)
}

export function assetColor(plan: Plan, id: string): string {
  const index = plan.assets.findIndex((asset) => asset.id === id)
  return seriesColor(plan.pensions.length + index)
}

export function buildSeries(plan: Plan): { assets: ChartSeries[]; income: ChartSeries[] } {
  const pensions = plan.pensions
    .filter((pension) => pension.enabled)
    .map((pension) => ({
      key: pensionKey(pension.id),
      name: pension.name,
      color: pensionColor(plan, pension.id),
    }))

  const withdrawals = plan.assets
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      key: withdrawalKey(asset.id),
      name: de.withdrawalOf(asset.name),
      color: assetColor(plan, asset.id),
    }))

  const assets = plan.assets
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      key: assetValueKey(asset.id),
      name: asset.name,
      color: assetColor(plan, asset.id),
    }))

  // Pensions sit at the bottom of the income stack: they are the part that
  // cannot run out, so the layer above them reads as the part that can.
  return { assets, income: [...pensions, ...withdrawals] }
}
