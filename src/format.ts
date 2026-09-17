const euro = new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const millions = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 })

const thousands = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 })

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

/**
 * A bare grouped number — "400", "4.000" — for a phone-width axis, where
 * "400.000 €" would claim a fifth of the viewport. The currency and the factor
 * it has been divided by are stated once in the panel header instead, which is
 * also what keeps these ticks free of the spaces Recharts would wrap on.
 */
export function formatAxisNumber(value: number): string {
  return thousands.format(value)
}

/** "67" — ages are shown as whole years on the axis. */
export function formatAge(age: number): string {
  return String(Math.round(age))
}

/** "1,5 %" — a rate fraction (0.015) as a percentage, for compact summaries. */
export function formatPercent(fraction: number): string {
  return `${percent.format(fraction * 100)} %`
}

/**
 * A number as the text of an editable field.
 *
 * Rates are stored as fractions and edited as percents, so the value a field
 * gets back is `0.07 * 100` — which in binary floating point is
 * 7.000000000000001, and `String` would show every digit of it. Twelve
 * significant digits is far more precision than any input here carries and
 * short enough to round that noise away.
 */
export function formatFieldValue(value: number): string {
  if (!Number.isFinite(value)) return '0'
  return String(Number(value.toPrecision(12)))
}
