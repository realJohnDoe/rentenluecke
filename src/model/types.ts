/**
 * The retirement plan. This type — and nothing else — is what gets exported to
 * and imported from JSON/YAML.
 *
 * Money convention: every amount is a *nominal euro amount as of today*, i.e.
 * the number printed on your Renteninformation or Depotauszug. The projection
 * grows those amounts with the explicit rates below; the "real" value mode
 * deflates the result by `inflationRate`. The single exception is
 * `targetMonthlyIncome`, which is always expressed in today's purchasing power.
 *
 * Rates are fractions, not percentages: 0.05 means 5% p.a.
 */
export type Plan = {
  version: 1
  /** Age today. Left edge of the timeline. */
  currentAge: number
  /** Age at which pensions start and assets begin to deplete. */
  retirementAge: number
  /** Planning horizon ("Planungsende"). Right edge of the timeline. */
  endAge: number
  /** Assumed inflation, fraction p.a. */
  inflationRate: number
  /** Desired monthly income, in today's purchasing power. */
  targetMonthlyIncome: number
  pensions: Pension[]
  assets: Asset[]
}

/** A lifelong monthly payment: statutory, occupational or private pension. */
export type Pension = {
  id: string
  name: string
  enabled: boolean
  /** Monthly payout if contributions stop today. */
  monthlyIfStopped: number
  /** Monthly payout if contributions run until `retirementAge`. */
  monthlyIfContinued: number
  /** Payments start at this age. Defaults to the plan's `retirementAge`. */
  startAge?: number
  /** Yearly increase of the payment, fraction p.a. Often 0. */
  annualIncrease: number
}

/** A pot of capital that accumulates until retirement and is then drawn down. */
export type Asset = {
  id: string
  name: string
  enabled: boolean
  /** Value today. */
  currentValue: number
  /** Expected return during accumulation, fraction p.a. */
  annualReturn: number
  /** Contribution per month until retirement. */
  monthlyContribution: number
  /** Expected return during the withdrawal phase, fraction p.a. */
  annualReturnInRetirement: number
}

/**
 * Which contribution behaviour to project. A view option, never stored in a Plan:
 * - `stop`     — no further contributions from today on
 * - `continue` — contributions run until retirement
 */
export type Scenario = 'stop' | 'continue'

/**
 * How amounts are expressed. A view option, never stored in a Plan:
 * - `real`    — deflated to today's purchasing power
 * - `nominal` — euros of the respective year
 */
export type ValueMode = 'real' | 'nominal'

/** One month of the projection. Also the row shape the charts consume. */
export type ProjectionPoint = {
  /** Age in years, fractional (e.g. 42.25). The shared x axis of both charts. */
  age: number
  /** Months since the start of the projection. */
  month: number
  /** Asset value per asset id, in euros. Top chart panel. */
  assetValues: Record<string, number>
  /** Sum of `assetValues`. */
  totalAssetValue: number
  /** Monthly pension payment per pension id. Bottom chart panel. */
  pensionIncome: Record<string, number>
  /** Monthly withdrawal per asset id. Bottom chart panel. */
  withdrawalIncome: Record<string, number>
  /** Sum of all pension and withdrawal income for this month. */
  totalMonthlyIncome: number
  /** The target income at this point in time. */
  target: number
  /** `max(0, target - totalMonthlyIncome)`, only meaningful after retirement. */
  gap: number
}

/** Headline figures for the summary panel. */
export type ProjectionSummary = {
  /** Total asset value at the moment of retirement. */
  assetValueAtRetirement: number
  /** Monthly income in the first month of retirement. */
  incomeAtRetirement: number
  /** Gap in the first month of retirement. */
  gapAtRetirement: number
  /** Mean monthly gap across the whole retirement phase. */
  averageGap: number
  /** Mean monthly income across the whole retirement phase. */
  averageIncome: number
}

export type Projection = {
  points: ProjectionPoint[]
  summary: ProjectionSummary
}
