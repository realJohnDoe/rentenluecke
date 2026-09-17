import { describe, expect, it } from 'vitest'
import { annuityPayment, monthlyRate, project, resolveTimeline } from './finance'
import type { Asset, Pension, Plan, ProjectionPoint } from './types'

const basePlan: Plan = {
  version: 1,
  currentAge: 40,
  retirementAge: 50,
  endAge: 70,
  inflationRate: 0,
  targetMonthlyIncome: 2000,
  pensions: [],
  assets: [],
}

function planWith(overrides: Partial<Plan>): Plan {
  return { ...basePlan, ...overrides }
}

function asset(overrides: Partial<Asset>): Asset {
  return {
    id: 'a',
    name: 'Asset',
    enabled: true,
    currentValue: 0,
    annualReturn: 0,
    monthlyContribution: 0,
    annualReturnInRetirement: 0,
    ...overrides,
  }
}

function pension(overrides: Partial<Pension>): Pension {
  return {
    id: 'p',
    name: 'Pension',
    enabled: true,
    monthlyIfStopped: 0,
    monthlyIfContinued: 0,
    annualIncrease: 0,
    ...overrides,
  }
}

/** Indexed access that fails loudly instead of handing back `undefined`. */
function at(points: ProjectionPoint[], index: number): ProjectionPoint {
  const point = points[index]
  if (!point) throw new Error(`no projection point at index ${index}`)
  return point
}

describe('monthlyRate', () => {
  it('compounds back to the yearly rate over twelve months', () => {
    expect(Math.pow(1 + monthlyRate(0.06), 12)).toBeCloseTo(1.06, 12)
    expect(Math.pow(1 + monthlyRate(-0.02), 12)).toBeCloseTo(0.98, 12)
  })

  it('leaves a zero rate at zero', () => {
    expect(monthlyRate(0)).toBe(0)
  })

  it('does not produce NaN for rates at or below -100%', () => {
    expect(monthlyRate(-1)).toBe(-1)
    expect(monthlyRate(-2)).toBe(-1)
  })
})

describe('annuityPayment', () => {
  it('splits the pot evenly when there is no interest', () => {
    expect(annuityPayment(120000, 0, 240)).toBeCloseTo(500, 10)
  })

  it('matches the textbook annuity figure', () => {
    // 100.000 € at 0,5 % per month over 120 months.
    expect(annuityPayment(100000, 0.005, 120)).toBeCloseTo(1110.20502, 5)
  })

  it('pays nothing when there are no periods left', () => {
    expect(annuityPayment(100000, 0.005, 0)).toBe(0)
  })
})

describe('resolveTimeline', () => {
  it('puts retirement on the right month', () => {
    const timeline = resolveTimeline(basePlan)
    expect(timeline.totalMonths).toBe(360)
    expect(timeline.retirementMonth).toBe(120)
  })

  it('clamps ages that are out of order', () => {
    const timeline = resolveTimeline(planWith({ currentAge: 60, retirementAge: 30, endAge: 50 }))
    expect(timeline.retirementAge).toBe(60)
    expect(timeline.endAge).toBe(60)
    expect(timeline.totalMonths).toBe(0)
    expect(timeline.retirementMonth).toBe(0)
  })
})

describe('asset accumulation', () => {
  it('compounds the starting value when contributions stop today', () => {
    const plan = planWith({ assets: [asset({ currentValue: 10000, annualReturn: 0.05 })] })
    const { points } = project(plan, 'stop', 'nominal')
    // Ten years of 5 % on 10.000 €.
    expect(at(points, 120).totalAssetValue).toBeCloseTo(10000 * Math.pow(1.05, 10), 6)
  })

  it('adds contributions only in the continue scenario', () => {
    const plan = planWith({ assets: [asset({ currentValue: 1000, monthlyContribution: 100 })] })
    expect(at(project(plan, 'continue', 'nominal').points, 120).totalAssetValue).toBeCloseTo(
      1000 + 100 * 120,
      6,
    )
    expect(at(project(plan, 'stop', 'nominal').points, 120).totalAssetValue).toBeCloseTo(1000, 6)
  })
})

describe('asset withdrawal', () => {
  it('runs the pot down to exactly zero at the planning end', () => {
    const plan = planWith({
      assets: [
        asset({ currentValue: 200000, annualReturn: 0.06, annualReturnInRetirement: 0.03 }),
      ],
    })
    const { points } = project(plan, 'continue', 'nominal')
    expect(at(points, 360).totalAssetValue).toBe(0)
    expect(at(points, 240).totalAssetValue).toBeGreaterThan(0)
  })

  it('pays out pot divided by months when nothing earns interest', () => {
    const plan = planWith({ assets: [asset({ currentValue: 240000 })] })
    const { points } = project(plan, 'stop', 'nominal')
    // 240.000 € over the 240 months between age 50 and 70.
    expect(at(points, 120).totalMonthlyIncome).toBeCloseTo(1000, 6)
    expect(at(points, 119).totalMonthlyIncome).toBe(0)
  })

  it('keeps the withdrawal constant in nominal terms', () => {
    const plan = planWith({
      assets: [asset({ currentValue: 100000, annualReturnInRetirement: 0.04 })],
    })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 300).totalMonthlyIncome).toBeCloseTo(at(points, 120).totalMonthlyIncome, 9)
  })
})

describe('pensions', () => {
  it('pays nothing before retirement and the scenario amount afterwards', () => {
    const plan = planWith({
      pensions: [pension({ monthlyIfStopped: 800, monthlyIfContinued: 1500 })],
    })
    const stopped = project(plan, 'stop', 'nominal').points
    const continued = project(plan, 'continue', 'nominal').points
    expect(at(stopped, 119).totalMonthlyIncome).toBe(0)
    expect(at(stopped, 120).totalMonthlyIncome).toBeCloseTo(800, 9)
    expect(at(continued, 120).totalMonthlyIncome).toBeCloseTo(1500, 9)
  })

  it('compounds the yearly increase from today, not from retirement', () => {
    const plan = planWith({
      pensions: [pension({ monthlyIfStopped: 1000, annualIncrease: 0.01 })],
    })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 120).totalMonthlyIncome).toBeCloseTo(1000 * Math.pow(1.01, 10), 9)
  })

  it('honours an explicit start age', () => {
    const plan = planWith({
      pensions: [pension({ monthlyIfStopped: 500, startAge: 60 })],
    })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 239).totalMonthlyIncome).toBe(0)
    expect(at(points, 240).totalMonthlyIncome).toBeCloseTo(500, 9)
  })

  it('ignores disabled entries', () => {
    const plan = planWith({
      pensions: [pension({ monthlyIfStopped: 500, enabled: false })],
      assets: [asset({ currentValue: 120000, enabled: false })],
    })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 200).totalMonthlyIncome).toBe(0)
    expect(at(points, 200).totalAssetValue).toBe(0)
  })
})

describe('inflation and value mode', () => {
  it('leaves both modes identical when inflation is zero', () => {
    const plan = planWith({ pensions: [pension({ monthlyIfStopped: 1000 })] })
    const real = project(plan, 'stop', 'real').points
    const nominal = project(plan, 'stop', 'nominal').points
    expect(at(real, 200)).toEqual(at(nominal, 200))
  })

  it('grows the target line in nominal terms and keeps it flat in real terms', () => {
    const plan = planWith({ inflationRate: 0.02, targetMonthlyIncome: 2000 })
    expect(at(project(plan, 'stop', 'nominal').points, 120).target).toBeCloseTo(
      2000 * Math.pow(1.02, 10),
      6,
    )
    expect(at(project(plan, 'stop', 'real').points, 120).target).toBeCloseTo(2000, 6)
  })

  it('deflates income in real terms', () => {
    const plan = planWith({
      inflationRate: 0.02,
      pensions: [pension({ monthlyIfStopped: 1000 })],
    })
    const { points } = project(plan, 'stop', 'real')
    // Ten years of 2 % inflation eat into a pension that never rises.
    expect(at(points, 120).totalMonthlyIncome).toBeCloseTo(1000 / Math.pow(1.02, 10), 6)
  })
})

describe('the gap', () => {
  it('stays at zero before retirement', () => {
    const plan = planWith({ targetMonthlyIncome: 2000 })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 0).gap).toBe(0)
    expect(at(points, 119).gap).toBe(0)
  })

  it('is the shortfall against the target after retirement', () => {
    const plan = planWith({
      targetMonthlyIncome: 2000,
      pensions: [pension({ monthlyIfStopped: 1200 })],
    })
    const { points, summary } = project(plan, 'stop', 'nominal')
    expect(at(points, 120).gap).toBeCloseTo(800, 9)
    expect(summary.gapAtRetirement).toBeCloseTo(800, 9)
    expect(summary.averageGap).toBeCloseTo(800, 9)
    expect(summary.incomeAtRetirement).toBeCloseTo(1200, 9)
  })

  it('never goes negative when income exceeds the target', () => {
    const plan = planWith({
      targetMonthlyIncome: 1000,
      pensions: [pension({ monthlyIfStopped: 3000 })],
    })
    const { points } = project(plan, 'stop', 'nominal')
    expect(at(points, 200).gap).toBe(0)
  })
})

describe('scenario comparison', () => {
  it('differs from stop only by the withheld asset contributions before retirement', () => {
    // Zero return keeps the comparison exact: the only difference is the
    // contributions the "stop" scenario withholds.
    const plan = planWith({ assets: [asset({ currentValue: 10000, monthlyContribution: 200 })] })
    const stopped = project(plan, 'stop', 'nominal').points
    const continued = project(plan, 'continue', 'nominal').points
    expect(at(continued, 60).totalAssetValue - at(stopped, 60).totalAssetValue).toBeCloseTo(
      200 * 60,
      9,
    )
  })

  it('differs from stop only by the withheld contributions after retirement too', () => {
    const plan = planWith({
      pensions: [pension({ monthlyIfStopped: 800, monthlyIfContinued: 1500 })],
      assets: [asset({ currentValue: 10000, monthlyContribution: 200 })],
    })
    const stopped = project(plan, 'stop', 'nominal').points
    const continued = project(plan, 'continue', 'nominal').points

    // The withheld 200 €/month over 120 months of accumulation becomes a
    // 24.000 € gap in the pot, spread evenly over the 240 withdrawal months —
    // plus the flat gap between the two pension amounts. Every rate here is
    // zero, so both gaps are exact.
    const withdrawalGap = (200 * 120) / 240
    const pensionGap = 1500 - 800
    expect(at(continued, 120).totalMonthlyIncome - at(stopped, 120).totalMonthlyIncome).toBeCloseTo(
      withdrawalGap + pensionGap,
      9,
    )
  })
})

describe('degenerate timelines', () => {
  it('handles retiring at the planning end', () => {
    const plan = planWith({
      retirementAge: 70,
      assets: [asset({ currentValue: 50000, monthlyContribution: 100 })],
    })
    const { points, summary } = project(plan, 'continue', 'nominal')
    expect(points).toHaveLength(361)
    expect(at(points, 360).totalMonthlyIncome).toBe(0)
    expect(summary.assetValueAtRetirement).toBeCloseTo(50000 + 100 * 360, 6)
  })

  it('handles retiring today', () => {
    const plan = planWith({
      retirementAge: 40,
      assets: [asset({ currentValue: 360000 })],
    })
    const { points } = project(plan, 'continue', 'nominal')
    expect(at(points, 0).totalMonthlyIncome).toBeCloseTo(1000, 6)
    expect(at(points, 360).totalAssetValue).toBe(0)
  })

  it('produces a single point when the plan has no runway', () => {
    const plan = planWith({ currentAge: 70, retirementAge: 67, endAge: 65 })
    const { points } = project(plan, 'continue', 'nominal')
    expect(points).toHaveLength(1)
    expect(at(points, 0).age).toBe(70)
  })
})
