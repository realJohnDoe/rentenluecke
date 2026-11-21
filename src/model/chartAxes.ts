import type { Timeline } from './finance'
import { formatAxisNumber, formatEuroAxis } from '../format'
import { de } from '../i18n/de'

/**
 * The y-axis gutter. "400.000 €" needs all 76px, which on a desktop panel is
 * fine but on a phone is a fifth of the viewport spent on tick labels — so a
 * narrow panel scales its ticks down to bare digits (see `axisScale`) and
 * needs far less room for them. 46px is set by the widest tick the scaling
 * leaves alone: a four-digit figure under ten thousand, like "9.999".
 */
export const AXIS_WIDTH = { wide: 76, narrow: 46 }

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
export function axisScale(max: number, narrow: boolean) {
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
 * Whole-year ticks at a spacing that keeps the axis readable at any span.
 * A phone fits roughly half as many labels as a desktop panel, so it takes the
 * next coarser step.
 */
export function ageTicks(timeline: Timeline, narrow = false): number[] {
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
 * the ticks read 0 / 90.000 / 180.000 … instead of 0 / 85.000 / 170.000 …
 *
 * Every rung below 4 is a multiple of 0.4, which is what keeps the quarters
 * round while staying much finer than the 1/2/4/5/8/10 ladder this replaced:
 * an income stack topping out at 3.200 € used to get an axis to 4.000 € and
 * spend a fifth of the panel on nothing.
 *
 * The comparison is strict, so the chosen maximum is always above the data.
 * A value that lands exactly on a rung — the target line does, since the user
 * types it — would otherwise be drawn along the panel's top edge, where it is
 * indistinguishable from the frame.
 */
const NICE_STEPS = [1.2, 1.6, 2, 2.4, 2.8, 3.2, 3.6, 4, 5, 6, 8, 10] as const

export function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)))
  const normalised = value / magnitude
  const step = NICE_STEPS.find((candidate) => normalised < candidate) ?? 10
  return step * magnitude
}
