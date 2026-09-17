import type { Dispatch } from 'react'
import { NumberField } from './NumberField'
import { pensionColor } from '../model/chartRows'
import type { Pension, Plan } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

export function PensionList({ plan, dispatch }: Props) {
  return (
    <section
      className="rounded-lg border p-3"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <h2 className="mb-2 text-sm font-semibold">{de.pensionsTitle}</h2>
      {plan.pensions.length === 0 ? (
        <p className="text-xs" style={{ color: chartInk.muted }}>
          {de.pensionsEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {plan.pensions.map((pension) => (
            <PensionCard
              key={pension.id}
              pension={pension}
              color={pensionColor(plan, pension.id)}
              retirementAge={plan.retirementAge}
              dispatch={dispatch}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        className="mt-3 rounded-md border px-3 py-1.5 text-xs font-medium"
        style={{ borderColor: 'var(--hairline)', color: chartInk.secondary }}
        onClick={() => dispatch({ type: 'addPension' })}
      >
        {de.addPension}
      </button>
    </section>
  )
}

function PensionCard({
  pension,
  color,
  retirementAge,
  dispatch,
}: {
  pension: Pension
  color: string
  retirementAge: number
  dispatch: Dispatch<PlanAction>
}) {
  const update = (patch: Partial<Omit<Pension, 'id'>>) =>
    dispatch({ type: 'updatePension', id: pension.id, patch })

  return (
    <li className="rounded-md border p-3" style={{ borderColor: 'var(--hairline)' }}>
      <div className="mb-2 flex items-center gap-2">
        <span
          aria-hidden
          className="inline-block h-3 w-3 shrink-0 rounded-sm"
          style={{ background: color }}
        />
        <input
          type="checkbox"
          checked={pension.enabled}
          onChange={(event) => update({ enabled: event.target.checked })}
          aria-label={de.enabled}
        />
        <input
          type="text"
          value={pension.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder={de.pensionNamePlaceholder}
          className="min-w-0 flex-1 rounded-md border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--hairline)', background: chartInk.surface }}
        />
        <button
          type="button"
          onClick={() => dispatch({ type: 'removePension', id: pension.id })}
          className="shrink-0 text-xs"
          style={{ color: chartInk.muted }}
        >
          {de.removeEntry}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <NumberField
          label={de.monthlyIfStopped}
          value={pension.monthlyIfStopped}
          onChange={(value) => update({ monthlyIfStopped: value })}
          min={0}
          suffix="€"
          hint={de.monthlyIfStoppedHint}
        />
        <NumberField
          label={de.monthlyIfContinued}
          value={pension.monthlyIfContinued}
          onChange={(value) => update({ monthlyIfContinued: value })}
          min={0}
          suffix="€"
          hint={de.monthlyIfContinuedHint}
        />
        <NumberField
          label={de.annualIncrease}
          value={pension.annualIncrease * 100}
          onChange={(value) => update({ annualIncrease: value / 100 })}
          min={-10}
          max={15}
          step={0.1}
          suffix="%"
          hint={de.annualIncreaseHint}
        />
        <NumberField
          label={de.pensionStartAge}
          value={pension.startAge ?? retirementAge}
          onChange={(value) => update({ startAge: value })}
          min={0}
          max={100}
          step={1}
          suffix={de.years}
          hint={de.pensionStartAgeHint}
        />
      </div>
    </li>
  )
}
