import { describe, expect, it } from 'vitest'
import { assetColor, buildSeries, pensionColor } from './chartRows'
import type { Asset, Pension, Plan } from './types'

const pension = (overrides: Partial<Pension>): Pension => ({
  id: overrides.id ?? 'p',
  name: overrides.name ?? 'Rente',
  enabled: true,
  monthlyIfStopped: 500,
  monthlyIfContinued: 500,
  annualIncrease: 0,
  colorIndex: 0,
  ...overrides,
})

const asset = (overrides: Partial<Asset>): Asset => ({
  id: overrides.id ?? 'a',
  name: overrides.name ?? 'Vermögenswert',
  enabled: true,
  currentValue: 1000,
  monthlyContribution: 0,
  annualReturn: 0,
  annualReturnInRetirement: 0,
  colorIndex: 0,
  ...overrides,
})

const basePlan: Plan = {
  version: 1,
  currentAge: 35,
  retirementAge: 67,
  endAge: 90,
  inflationRate: 0.02,
  targetMonthlyIncome: 3000,
  pensions: [],
  assets: [],
}

/**
 * PensionList and AssetList render `plan.pensions`/`plan.assets` in plain
 * array order, top to bottom — that array order is the sidebar order this
 * asserts against.
 */
describe('buildSeries', () => {
  it('orders pensions the same as the sidebar, enabled ones only', () => {
    const plan: Plan = {
      ...basePlan,
      pensions: [
        pension({ id: 'p1', name: 'Gesetzliche Rente' }),
        pension({ id: 'p2', name: 'Betriebsrente', enabled: false }),
        pension({ id: 'p3', name: 'Riester' }),
      ],
    }
    const { income } = buildSeries(plan)
    expect(income.pensions.map((s) => s.key)).toEqual(['pension:p1', 'pension:p3'])
  })

  it('orders assets the same as the sidebar, both as balances and as withdrawals', () => {
    const plan: Plan = {
      ...basePlan,
      assets: [
        asset({ id: 'a1', name: 'ETF-Depot' }),
        asset({ id: 'a2', name: 'Tagesgeld', enabled: false }),
        asset({ id: 'a3', name: 'Festgeld' }),
      ],
    }
    const { assets, income } = buildSeries(plan)
    expect(assets.map((s) => s.key)).toEqual(['assetValue:a1', 'assetValue:a3'])
    expect(income.withdrawals.map((s) => s.key)).toEqual(['withdrawal:a1', 'withdrawal:a3'])
  })
})

/**
 * Colour follows the entity, not its rank: reordering `pensions`/`assets` (as
 * a drag-and-drop reorder does) must not change what colour an id resolves
 * to, even though `pensionColor`/`assetColor` are looked up by id.
 */
describe('pensionColor / assetColor', () => {
  it('stays with the entity when the list order changes', () => {
    const plan: Plan = {
      ...basePlan,
      pensions: [pension({ id: 'p1', colorIndex: 0 }), pension({ id: 'p2', colorIndex: 1 })],
      assets: [asset({ id: 'a1', colorIndex: 2 })],
    }
    const reordered: Plan = {
      ...plan,
      pensions: [plan.pensions[1] as Pension, plan.pensions[0] as Pension],
    }
    expect(pensionColor(reordered, 'p1')).toBe(pensionColor(plan, 'p1'))
    expect(pensionColor(reordered, 'p2')).toBe(pensionColor(plan, 'p2'))
    expect(assetColor(reordered, 'a1')).toBe(assetColor(plan, 'a1'))
  })
})
