import { describe, expect, it } from 'vitest'
import { deserialisePlan, serialisePlan } from './io'
import { defaultPlan } from './defaultPlan'

describe('serialisePlan / deserialisePlan', () => {
  it('round-trips through JSON', () => {
    const text = serialisePlan(defaultPlan, 'json')
    const result = deserialisePlan(text)
    expect(result.ok).toBe(true)
    expect(result.ok && result.plan).toEqual(defaultPlan)
  })

  it('round-trips through YAML', () => {
    const text = serialisePlan(defaultPlan, 'yaml')
    const result = deserialisePlan(text)
    expect(result.ok).toBe(true)
    expect(result.ok && result.plan).toEqual(defaultPlan)
  })

  it('parses a plan that has an unknown extra key', () => {
    const withExtra = { ...defaultPlan, someFutureField: 'ignored' }
    const result = deserialisePlan(JSON.stringify(withExtra))
    expect(result.ok).toBe(true)
    expect(result.ok && result.plan).toEqual(defaultPlan)
  })

  it('reports a missing required field with its path', () => {
    const { currentAge: _currentAge, ...withoutCurrentAge } = defaultPlan
    const result = deserialisePlan(JSON.stringify(withoutCurrentAge))
    expect(result.ok).toBe(false)
    expect(!result.ok && result.issues).toEqual([{ path: 'currentAge', code: 'missing' }])
  })

  it('reports malformed YAML as ok: false instead of throwing', () => {
    expect(() => deserialisePlan('key: value\n  bad indent: [')).not.toThrow()
    const result = deserialisePlan('key: value\n  bad indent: [')
    expect(result.ok).toBe(false)
  })

  it('serialises neither scenario nor valueMode, which are view options only', () => {
    expect(serialisePlan(defaultPlan, 'json')).not.toMatch(/scenario|valueMode/i)
    expect(serialisePlan(defaultPlan, 'yaml')).not.toMatch(/scenario|valueMode/i)
  })
})
