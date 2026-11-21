import { describe, expect, it } from 'vitest'
import { AXIS_WIDTH, ageTicks, axisScale, niceMax } from './chartAxes'
import type { Timeline } from './finance'

const timeline = (currentAge: number, endAge: number): Timeline => ({
  currentAge,
  retirementAge: 67,
  endAge,
  totalMonths: (endAge - currentAge) * 12,
  retirementMonth: 0,
})

describe('niceMax', () => {
  it('is strictly above the data, even when it lands on a rung', () => {
    expect(niceMax(3200)).toBeGreaterThan(3200)
    expect(niceMax(3200)).toBe(3600)
    expect(niceMax(100)).toBe(120)
  })

  it('rounds up to the next rung', () => {
    expect(niceMax(3100)).toBe(3200)
    expect(niceMax(85_000)).toBe(100_000)
    expect(niceMax(9)).toBe(10)
  })

  it('falls back to 1 for empty or invalid data', () => {
    expect(niceMax(0)).toBe(1)
    expect(niceMax(-5)).toBe(1)
    expect(niceMax(NaN)).toBe(1)
  })
})

describe('ageTicks', () => {
  it('picks the step from the span', () => {
    expect(ageTicks(timeline(30, 95))).toEqual([30, 40, 50, 60, 70, 80, 90])
    expect(ageTicks(timeline(60, 95))).toEqual([60, 65, 70, 75, 80, 85, 90, 95])
    expect(ageTicks(timeline(60, 75))).toEqual([60, 62, 64, 66, 68, 70, 72, 74])
    expect(ageTicks(timeline(60, 65))).toEqual([60, 61, 62, 63, 64, 65])
  })

  it('starts on a multiple of the step at or after the current age', () => {
    expect(ageTicks(timeline(33, 95))[0]).toBe(40)
  })

  it('takes the next coarser step on a narrow panel', () => {
    expect(ageTicks(timeline(60, 95), true)).toEqual([60, 70, 80, 90])
    expect(ageTicks(timeline(30, 95), true)).toEqual([40, 60, 80])
  })
})

describe('axisScale', () => {
  it('spells ticks out in full on a wide panel', () => {
    const axis = axisScale(400_000, false)
    expect(axis).toMatchObject({ width: AXIS_WIDTH.wide, scaled: false })
  })

  it('divides ticks down by the factor the maximum calls for on a narrow panel', () => {
    const small = axisScale(5000, true)
    const thousands = axisScale(400_000, true)
    const millions = axisScale(2_000_000, true)
    expect([small.scaled, thousands.scaled, millions.scaled]).toEqual([true, true, true])
    expect(thousands.width).toBe(AXIS_WIDTH.narrow)
    expect(thousands.format(400_000)).toBe(small.format(400))
    expect(millions.format(2_000_000)).toBe(small.format(2))
    expect(new Set([small.unit, thousands.unit, millions.unit]).size).toBe(3)
  })
})
