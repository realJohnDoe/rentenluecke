import { z } from 'zod'
import type { Plan } from './types'

/**
 * A validation problem found while parsing an imported plan. English, like the
 * rest of this module — `Toolbar` turns it into German via `de.importError`.
 */
export type PlanIssue = {
  path: string
  code: 'missing' | 'wrong_type' | 'out_of_range' | 'bad_version'
}

export type ParseResult = { ok: true; plan: Plan } | { ok: false; issues: PlanIssue[] }

// Bounds mirror the `min`/`max` already enforced on the number inputs (see
// plan.md, PR 2 notes): age 0-100, inflation/returns -10 % to 15 %, except
// inflation which the UI additionally floors at -5 %.
const age = z.number().min(0).max(100)
const rate = z.number().min(-0.1).max(0.15)

const pensionSchemaV1 = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  monthlyIfStopped: z.number().min(0),
  monthlyIfContinued: z.number().min(0),
  startAge: age.optional(),
  annualIncrease: rate,
})

const assetSchemaV1 = z.object({
  id: z.string(),
  name: z.string(),
  enabled: z.boolean(),
  currentValue: z.number().min(0),
  annualReturn: rate,
  monthlyContribution: z.number().min(0),
  annualReturnInRetirement: rate,
})

const planSchemaV1 = z.object({
  version: z.literal(1),
  currentAge: age,
  retirementAge: age,
  endAge: age,
  inflationRate: z.number().min(-0.05).max(0.15),
  targetMonthlyIncome: z.number().min(0),
  pensions: z.array(pensionSchemaV1),
  assets: z.array(assetSchemaV1),
})

/**
 * Parses and validates an imported plan. Never throws — malformed input comes
 * back as `{ ok: false, issues }`.
 */
export function parsePlan(input: unknown): ParseResult {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    return { ok: false, issues: [{ path: '', code: 'wrong_type' }] }
  }

  const version = (input as { version?: unknown }).version
  switch (version) {
    case 1:
      break
    // Future format versions: migrate `input` to the current shape here, then
    // fall through to validation below. There is only one version so far.
    default:
      return { ok: false, issues: [{ path: 'version', code: 'bad_version' }] }
  }

  const result = planSchemaV1.safeParse(input)
  if (result.success) {
    return { ok: true, plan: result.data }
  }
  return { ok: false, issues: result.error.issues.map((issue) => toPlanIssue(issue, input)) }
}

function toPlanIssue(issue: z.ZodIssue, input: unknown): PlanIssue {
  const path = issue.path.map(String).join('.')
  switch (issue.code) {
    case 'invalid_type':
      return { path, code: valueAtPath(input, issue.path) === undefined ? 'missing' : 'wrong_type' }
    case 'too_small':
    case 'too_big':
      return { path, code: 'out_of_range' }
    default:
      return { path, code: 'wrong_type' }
  }
}

function valueAtPath(input: unknown, path: readonly PropertyKey[]): unknown {
  let current = input
  for (const key of path) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<PropertyKey, unknown>)[key]
  }
  return current
}
