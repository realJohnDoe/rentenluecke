import type {
  Asset,
  Pension,
  Plan,
  Projection,
  ProjectionPoint,
  ProjectionSummary,
  Scenario,
  ValueMode,
} from './types'

const MONTHS_PER_YEAR = 12

/**
 * Effective monthly rate belonging to a yearly rate — `(1+r)^(1/12) - 1`, not
 * the `r/12` shortcut, so that twelve months of compounding reproduce exactly
 * the yearly rate the user entered.
 */
export function monthlyRate(annualRate: number): number {
  if (annualRate <= -1) return -1
  return Math.pow(1 + annualRate, 1 / MONTHS_PER_YEAR) - 1
}

/**
 * Constant payment that depletes `presentValue` over `periods` periods while the
 * remainder keeps earning `rate` per period (annuity-immediate: the payment
 * happens at the end of each period).
 */
export function annuityPayment(presentValue: number, rate: number, periods: number): number {
  if (periods <= 0) return 0
  if (Math.abs(rate) < 1e-12) return presentValue / periods
  return (presentValue * rate) / (1 - Math.pow(1 + rate, -periods))
}

export type Timeline = {
  currentAge: number
  retirementAge: number
  endAge: number
  /** Length of the projection in months. */
  totalMonths: number
  /** Month index at which retirement begins. */
  retirementMonth: number
}

/**
 * Turn the three configured ages into a month grid, tolerating nonsensical input
 * (ages out of order, negative values) so the UI never has to guard the charts.
 */
export function resolveTimeline(plan: Plan): Timeline {
  const currentAge = Math.max(0, plan.currentAge)
  const endAge = Math.max(currentAge, plan.endAge)
  const retirementAge = Math.min(Math.max(plan.retirementAge, currentAge), endAge)
  const totalMonths = Math.round((endAge - currentAge) * MONTHS_PER_YEAR)
  const retirementMonth = Math.min(
    Math.round((retirementAge - currentAge) * MONTHS_PER_YEAR),
    totalMonths,
  )
  return { currentAge, retirementAge, endAge, totalMonths, retirementMonth }
}

type AssetSeries = {
  /** Balance at the start of each month, index 0 … totalMonths. */
  values: number[]
  /** Constant nominal monthly withdrawal during retirement. */
  withdrawal: number
}

/**
 * Accumulate until retirement, then draw the pot down to zero at the planning end.
 * Contributions and withdrawals are both treated as end-of-month events.
 */
function assetSeries(asset: Asset, timeline: Timeline, scenario: Scenario): AssetSeries {
  const accumulationRate = monthlyRate(asset.annualReturn)
  const withdrawalRate = monthlyRate(asset.annualReturnInRetirement)
  const contribution = scenario === 'continue' ? asset.monthlyContribution : 0

  const values: number[] = [asset.currentValue]
  let value = asset.currentValue

  for (let month = 0; month < timeline.retirementMonth; month++) {
    value = value * (1 + accumulationRate) + contribution
    values.push(value)
  }

  const withdrawalMonths = timeline.totalMonths - timeline.retirementMonth
  const withdrawal = annuityPayment(value, withdrawalRate, withdrawalMonths)

  for (let month = timeline.retirementMonth; month < timeline.totalMonths; month++) {
    value = value * (1 + withdrawalRate) - withdrawal
    values.push(value)
  }

  // The annuity is built to land on zero; anything left is floating point noise.
  const last = values.length - 1
  if (Math.abs(values[last] ?? 0) < 1e-6) values[last] = 0

  return { values, withdrawal }
}

/**
 * Monthly payment of a pension at a given month. The entered amount is a value
 * as of today, so `annualIncrease` compounds from today on — by the time
 * payments start, the claim has grown along with it.
 */
function pensionIncomeAt(
  pension: Pension,
  timeline: Timeline,
  scenario: Scenario,
  month: number,
): number {
  const startAge = pension.startAge ?? timeline.retirementAge
  const startMonth = Math.round((startAge - timeline.currentAge) * MONTHS_PER_YEAR)
  if (month < startMonth) return 0
  const base = scenario === 'continue' ? pension.monthlyIfContinued : pension.monthlyIfStopped
  return base * Math.pow(1 + pension.annualIncrease, month / MONTHS_PER_YEAR)
}

/**
 * Project a plan month by month.
 *
 * Everything is computed in nominal euros first and then divided by the
 * inflation factor when `valueMode` is `real`, which also flattens the target
 * line to the amount the user entered.
 */
export function project(plan: Plan, scenario: Scenario, valueMode: ValueMode): Projection {
  const timeline = resolveTimeline(plan)
  const pensions = plan.pensions.filter((pension) => pension.enabled)
  const assets = plan.assets.filter((asset) => asset.enabled)
  const series = assets.map((asset) => ({ asset, ...assetSeries(asset, timeline, scenario) }))
  const inflationMonthly = monthlyRate(plan.inflationRate)

  const points: ProjectionPoint[] = []

  for (let month = 0; month <= timeline.totalMonths; month++) {
    const inflationFactor = Math.pow(1 + inflationMonthly, month)
    const deflator = valueMode === 'real' ? 1 / inflationFactor : 1
    const retired = month >= timeline.retirementMonth

    const assetValues: Record<string, number> = {}
    const withdrawalIncome: Record<string, number> = {}
    let totalAssetValue = 0
    let totalMonthlyIncome = 0

    for (const { asset, values, withdrawal } of series) {
      const value = (values[month] ?? 0) * deflator
      assetValues[asset.id] = value
      totalAssetValue += value

      const income = retired ? withdrawal * deflator : 0
      withdrawalIncome[asset.id] = income
      totalMonthlyIncome += income
    }

    const pensionIncome: Record<string, number> = {}
    for (const pension of pensions) {
      const income = pensionIncomeAt(pension, timeline, scenario, month) * deflator
      pensionIncome[pension.id] = income
      totalMonthlyIncome += income
    }

    const target = plan.targetMonthlyIncome * inflationFactor * deflator

    points.push({
      age: timeline.currentAge + month / MONTHS_PER_YEAR,
      month,
      assetValues,
      totalAssetValue,
      pensionIncome,
      withdrawalIncome,
      totalMonthlyIncome,
      target,
      // Before retirement there is no gap to speak of — the target simply does
      // not apply yet, and shading it would swamp the accumulation phase in red.
      gap: retired ? Math.max(0, target - totalMonthlyIncome) : 0,
    })
  }

  return { points, summary: summarise(points, timeline) }
}

function summarise(points: ProjectionPoint[], timeline: Timeline): ProjectionSummary {
  const atRetirement = points[timeline.retirementMonth] ?? points[points.length - 1]
  const retirementPoints = points.slice(timeline.retirementMonth)
  const count = retirementPoints.length || 1
  const sum = (pick: (point: ProjectionPoint) => number) =>
    retirementPoints.reduce((total, point) => total + pick(point), 0)

  return {
    assetValueAtRetirement: atRetirement?.totalAssetValue ?? 0,
    incomeAtRetirement: atRetirement?.totalMonthlyIncome ?? 0,
    gapAtRetirement: atRetirement?.gap ?? 0,
    averageGap: sum((point) => point.gap) / count,
    averageIncome: sum((point) => point.totalMonthlyIncome) / count,
  }
}
