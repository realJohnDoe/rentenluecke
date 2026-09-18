import { defaultPlan } from '../model/defaultPlan'
import type { Asset, Pension, Plan } from '../model/types'

/** The scalar (non-list) fields of `Plan` — all numbers, so `setField` stays simple. */
export type ScalarField =
  | 'currentAge'
  | 'retirementAge'
  | 'endAge'
  | 'inflationRate'
  | 'targetMonthlyIncome'

export type PlanAction =
  | { type: 'setField'; field: ScalarField; value: number }
  | { type: 'addPension' }
  | { type: 'updatePension'; id: string; patch: Partial<Omit<Pension, 'id'>> }
  | { type: 'removePension'; id: string }
  | { type: 'reorderPensions'; ids: string[] }
  | { type: 'addAsset' }
  | { type: 'updateAsset'; id: string; patch: Partial<Omit<Asset, 'id'>> }
  | { type: 'removeAsset'; id: string }
  | { type: 'reorderAssets'; ids: string[] }
  | { type: 'replacePlan'; plan: Plan }
  | { type: 'resetPlan' }

/** Next free colour slot, across pensions and assets together — see `Pension.colorIndex`. */
function nextColorIndex(plan: Plan): number {
  const used = [...plan.pensions, ...plan.assets].map((entry) => entry.colorIndex)
  return used.length === 0 ? 0 : Math.max(...used) + 1
}

function newPension(plan: Plan): Pension {
  return {
    id: crypto.randomUUID(),
    name: '',
    enabled: true,
    monthlyIfStopped: 0,
    monthlyIfContinued: 0,
    annualIncrease: 0,
    colorIndex: nextColorIndex(plan),
  }
}

function newAsset(plan: Plan): Asset {
  return {
    id: crypto.randomUUID(),
    name: '',
    enabled: true,
    currentValue: 0,
    annualReturn: 0,
    monthlyContribution: 0,
    annualReturnInRetirement: 0,
    colorIndex: nextColorIndex(plan),
  }
}

/**
 * Reorders `entries` to match `ids` — the shape a drag-and-drop reorder
 * produces. Falls back to the untouched list if `ids` does not name exactly
 * the entries already present, which should not happen in practice.
 */
function reorder<T extends { id: string }>(entries: T[], ids: string[]): T[] {
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  const reordered = ids.map((id) => byId.get(id)).filter((entry): entry is T => entry !== undefined)
  return reordered.length === entries.length ? reordered : entries
}

/**
 * Pure `useReducer` reducer over `Plan`. Every branch returns a new object —
 * nothing is mutated in place — so the plan can be used as a `useMemo`
 * dependency and diffed by identity.
 */
export function planReducer(plan: Plan, action: PlanAction): Plan {
  switch (action.type) {
    case 'setField':
      return { ...plan, [action.field]: action.value }

    case 'addPension':
      return { ...plan, pensions: [...plan.pensions, newPension(plan)] }

    case 'updatePension':
      return {
        ...plan,
        pensions: plan.pensions.map((pension) =>
          pension.id === action.id ? { ...pension, ...action.patch } : pension,
        ),
      }

    case 'removePension':
      return { ...plan, pensions: plan.pensions.filter((pension) => pension.id !== action.id) }

    case 'reorderPensions':
      return { ...plan, pensions: reorder(plan.pensions, action.ids) }

    case 'addAsset':
      return { ...plan, assets: [...plan.assets, newAsset(plan)] }

    case 'updateAsset':
      return {
        ...plan,
        assets: plan.assets.map((asset) =>
          asset.id === action.id ? { ...asset, ...action.patch } : asset,
        ),
      }

    case 'removeAsset':
      return { ...plan, assets: plan.assets.filter((asset) => asset.id !== action.id) }

    case 'reorderAssets':
      return { ...plan, assets: reorder(plan.assets, action.ids) }

    case 'replacePlan':
      return action.plan

    case 'resetPlan':
      // A copy, not the constant itself: every other branch hands back a fresh
      // object, and sharing `defaultPlan`'s arrays with the live plan would
      // make any future in-place edit poison the reset target for good.
      return {
        ...defaultPlan,
        pensions: defaultPlan.pensions.map((pension) => ({ ...pension })),
        assets: defaultPlan.assets.map((asset) => ({ ...asset })),
      }
  }
}
