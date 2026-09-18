import type { Plan } from './types'

/**
 * A plausible starting point so the page shows something meaningful before the
 * user has entered anything. Figures are illustrative, not advice.
 */
export const defaultPlan: Plan = {
  version: 1,
  currentAge: 35,
  retirementAge: 67,
  endAge: 90,
  inflationRate: 0.02,
  targetMonthlyIncome: 3200,
  pensions: [
    {
      id: 'gesetzliche-rente',
      name: 'Gesetzliche Rente',
      enabled: true,
      monthlyIfStopped: 750,
      monthlyIfContinued: 1600,
      annualIncrease: 0.01,
      colorIndex: 0,
    },
    {
      id: 'betriebsrente',
      name: 'Betriebsrente',
      enabled: true,
      monthlyIfStopped: 120,
      monthlyIfContinued: 300,
      annualIncrease: 0,
      colorIndex: 1,
    },
  ],
  assets: [
    {
      id: 'etf-depot',
      name: 'ETF-Depot',
      enabled: true,
      currentValue: 45000,
      annualReturn: 0.06,
      monthlyContribution: 250,
      annualReturnInRetirement: 0.03,
      colorIndex: 2,
    },
    {
      id: 'tagesgeld',
      name: 'Tagesgeld',
      enabled: true,
      currentValue: 15000,
      annualReturn: 0.02,
      monthlyContribution: 50,
      annualReturnInRetirement: 0.02,
      colorIndex: 3,
    },
  ],
}
