const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const millions = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

const percent = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

/** "2.500 €" — for tooltips and key figures. */
export function formatEuro(value: number): string {
  return euro.format(value)
}

/**
 * Axis ticks: grouped euros, switching to millions only where the full figure
 * would no longer fit the axis gutter. Both panels use the same rule so their
 * numbers read alike.
 */
export function formatEuroAxis(value: number): string {
  if (Math.abs(value) >= 1_000_000) return `${millions.format(value / 1_000_000)} Mio. €`
  return euro.format(value)
}

/** "67" — ages are shown as whole years on the axis. */
export function formatAge(age: number): string {
  return String(Math.round(age))
}

/** "1,5 %" — a rate fraction (0.015) as a percentage, for compact summaries. */
export function formatPercent(fraction: number): string {
  return `${percent.format(fraction * 100)} %`
}
