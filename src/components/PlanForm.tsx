import type { Dispatch } from 'react'
import { NumberField } from './NumberField'
import type { Plan } from '../model/types'
import type { PlanAction, ScalarField } from '../state/planReducer'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

/** The scalar plan fields: ages, target income, inflation. */
export function PlanForm({ plan, dispatch }: Props) {
  const setField = (field: ScalarField) => (value: number) => dispatch({ type: 'setField', field, value })

  return (
    <section
      className="rounded-lg border p-3"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <h2 className="mb-2 text-sm font-semibold">{de.planFormTitle}</h2>
      <div className="flex flex-col gap-3">
        <NumberField
          label={de.currentAge}
          value={plan.currentAge}
          onChange={setField('currentAge')}
          min={0}
          max={100}
          step={1}
          suffix={de.years}
          slider
          hint={de.currentAgeHint}
        />
        <NumberField
          label={de.retirementAge}
          value={plan.retirementAge}
          onChange={setField('retirementAge')}
          min={0}
          max={100}
          step={1}
          suffix={de.years}
          slider
          hint={de.retirementAgeHint}
        />
        <NumberField
          label={de.endAge}
          value={plan.endAge}
          onChange={setField('endAge')}
          min={0}
          max={100}
          step={1}
          suffix={de.years}
          slider
          hint={de.endAgeHint}
        />
        <NumberField
          label={de.targetMonthlyIncome}
          value={plan.targetMonthlyIncome}
          onChange={setField('targetMonthlyIncome')}
          min={0}
          suffix="€"
          hint={de.targetMonthlyIncomeHint}
        />
        <NumberField
          label={de.inflationRate}
          value={plan.inflationRate * 100}
          onChange={(value) => dispatch({ type: 'setField', field: 'inflationRate', value: value / 100 })}
          min={-5}
          max={15}
          step={0.1}
          suffix="%"
          hint={de.inflationRateHint}
        />
      </div>
    </section>
  )
}
