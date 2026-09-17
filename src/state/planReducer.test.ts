import { describe, expect, it } from 'vitest'
import { planReducer } from './planReducer'
import { defaultPlan } from '../model/defaultPlan'
import type { Plan } from '../model/types'

const basePlan: Plan = {
  version: 1,
  currentAge: 35,
  retirementAge: 67,
  endAge: 90,
  inflationRate: 0.02,
  targetMonthlyIncome: 3000,
  pensions: [
    {
      id: 'p1',
      name: 'Gesetzliche Rente',
      enabled: true,
      monthlyIfStopped: 500,
      monthlyIfContinued: 1200,
      annualIncrease: 0.01,
    },
  ],
  assets: [
    {
      id: 'a1',
      name: 'ETF-Depot',
      enabled: true,
      currentValue: 10000,
      annualReturn: 0.05,
      monthlyContribution: 200,
      annualReturnInRetirement: 0.02,
    },
  ],
}

describe('planReducer / setField', () => {
  it('updates a scalar field and leaves the rest untouched', () => {
    const next = planReducer(basePlan, { type: 'setField', field: 'currentAge', value: 40 })
    expect(next.currentAge).toBe(40)
    expect(next.retirementAge).toBe(basePlan.retirementAge)
    expect(next.pensions).toBe(basePlan.pensions)
  })

  it('does not mutate the original plan', () => {
    planReducer(basePlan, { type: 'setField', field: 'endAge', value: 95 })
    expect(basePlan.endAge).toBe(90)
  })
})

describe('planReducer / pensions', () => {
  it('adds a pension with a generated id and sensible defaults', () => {
    const next = planReducer(basePlan, { type: 'addPension' })
    expect(next.pensions).toHaveLength(2)
    const added = next.pensions[1]
    expect(added).toBeDefined()
    expect(added?.id).toBeTruthy()
    expect(added?.id).not.toBe(basePlan.pensions[0]?.id)
    expect(added?.enabled).toBe(true)
    expect(added?.name).toBe('')
  })

  it('assigns distinct ids across repeated additions', () => {
    const withOne = planReducer(basePlan, { type: 'addPension' })
    const withTwo = planReducer(withOne, { type: 'addPension' })
    const ids = withTwo.pensions.map((pension) => pension.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('updates only the matching pension by id', () => {
    const next = planReducer(basePlan, {
      type: 'updatePension',
      id: 'p1',
      patch: { name: 'Neuer Name', enabled: false },
    })
    expect(next.pensions[0]?.name).toBe('Neuer Name')
    expect(next.pensions[0]?.enabled).toBe(false)
    // untouched fields survive the patch
    expect(next.pensions[0]?.monthlyIfStopped).toBe(500)
  })

  it('leaves other pensions untouched when updating one', () => {
    const withTwo = planReducer(basePlan, { type: 'addPension' })
    const secondId = withTwo.pensions[1]?.id
    expect(secondId).toBeTruthy()
    const next = planReducer(withTwo, {
      type: 'updatePension',
      id: secondId as string,
      patch: { name: 'Zweite Rente' },
    })
    expect(next.pensions[0]).toEqual(withTwo.pensions[0])
    expect(next.pensions[1]?.name).toBe('Zweite Rente')
  })

  it('removes a pension by id', () => {
    const next = planReducer(basePlan, { type: 'removePension', id: 'p1' })
    expect(next.pensions).toHaveLength(0)
  })

  it('removing an unknown id is a no-op', () => {
    const next = planReducer(basePlan, { type: 'removePension', id: 'does-not-exist' })
    expect(next.pensions).toEqual(basePlan.pensions)
  })
})

describe('planReducer / assets', () => {
  it('adds an asset with a generated id and sensible defaults', () => {
    const next = planReducer(basePlan, { type: 'addAsset' })
    expect(next.assets).toHaveLength(2)
    const added = next.assets[1]
    expect(added?.id).toBeTruthy()
    expect(added?.currentValue).toBe(0)
    expect(added?.enabled).toBe(true)
  })

  it('updates only the matching asset by id', () => {
    const next = planReducer(basePlan, {
      type: 'updateAsset',
      id: 'a1',
      patch: { currentValue: 20000 },
    })
    expect(next.assets[0]?.currentValue).toBe(20000)
    expect(next.assets[0]?.annualReturn).toBe(0.05)
  })

  it('removes an asset by id', () => {
    const next = planReducer(basePlan, { type: 'removeAsset', id: 'a1' })
    expect(next.assets).toHaveLength(0)
  })
})

describe('planReducer / replacePlan', () => {
  it('replaces the whole plan wholesale', () => {
    const other: Plan = { ...basePlan, currentAge: 50, pensions: [], assets: [] }
    const next = planReducer(basePlan, { type: 'replacePlan', plan: other })
    expect(next).toBe(other)
  })
})

describe('planReducer / resetPlan', () => {
  it('returns the example plan, whatever was in the old one', () => {
    const next = planReducer(basePlan, { type: 'resetPlan' })
    expect(next).toEqual(defaultPlan)
  })

  it('does not hand out the shared default object itself', () => {
    // Every other branch returns a fresh object, and the reducer's callers
    // mutate nothing — but handing back the module-level constant would make
    // a future slip corrupt the reset target for the rest of the session.
    const next = planReducer(basePlan, { type: 'resetPlan' })
    expect(next).not.toBe(defaultPlan)
    expect(next.pensions).not.toBe(defaultPlan.pensions)
    expect(next.assets).not.toBe(defaultPlan.assets)
  })
})
