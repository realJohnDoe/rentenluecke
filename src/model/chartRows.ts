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

export function toChartRows(projection: Projection): ChartRow[] {
  return projection.points.map((point) => {
    const row: ChartRow = {
      age: point.age,
      target: point.target,
      gap: point.gap,
      totalIncome: point.totalMonthlyIncome,
      totalAssetValue: point.totalAssetValue,
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
 * Disabled entries keep their slot: colour follows the entity, not its rank.
 */
export function buildSeries(plan: Plan): { assets: ChartSeries[]; income: ChartSeries[] } {
  const pensionColor = new Map(plan.pensions.map((p, index) => [p.id, seriesColor(index)]))
  const assetColor = new Map(
    plan.assets.map((a, index) => [a.id, seriesColor(plan.pensions.length + index)]),
  )

  const pensions = plan.pensions
    .filter((pension) => pension.enabled)
    .map((pension) => ({
      key: pensionKey(pension.id),
      name: pension.name,
      color: pensionColor.get(pension.id) ?? seriesColor(0),
    }))

  const withdrawals = plan.assets
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      key: withdrawalKey(asset.id),
      name: de.withdrawalOf(asset.name),
      color: assetColor.get(asset.id) ?? seriesColor(0),
    }))

  const assets = plan.assets
    .filter((asset) => asset.enabled)
    .map((asset) => ({
      key: assetValueKey(asset.id),
      name: asset.name,
      color: assetColor.get(asset.id) ?? seriesColor(0),
    }))

  // Pensions sit at the bottom of the income stack: they are the part that
  // cannot run out, so the layer above them reads as the part that can.
  return { assets, income: [...pensions, ...withdrawals] }
}
