import type { Dispatch } from 'react'
import { NumberField } from './NumberField'
import { assetColor } from '../model/chartRows'
import type { Asset, Plan } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

export function AssetList({ plan, dispatch }: Props) {
  return (
    <section
      className="rounded-lg border p-3"
      style={{ background: chartInk.surface, borderColor: 'var(--hairline)' }}
    >
      <h2 className="mb-2 text-sm font-semibold">{de.assetListTitle}</h2>
      {plan.assets.length === 0 ? (
        <p className="text-xs" style={{ color: chartInk.muted }}>
          {de.assetsEmpty}
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {plan.assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              color={assetColor(plan, asset.id)}
              dispatch={dispatch}
            />
          ))}
        </ul>
      )}
      <button
        type="button"
        className="mt-3 rounded-md border px-3 py-1.5 text-xs font-medium"
        style={{ borderColor: 'var(--hairline)', color: chartInk.secondary }}
        onClick={() => dispatch({ type: 'addAsset' })}
      >
        {de.addAsset}
      </button>
    </section>
  )
}

function AssetCard({
  asset,
  color,
  dispatch,
}: {
  asset: Asset
  color: string
  dispatch: Dispatch<PlanAction>
}) {
  const update = (patch: Partial<Omit<Asset, 'id'>>) =>
    dispatch({ type: 'updateAsset', id: asset.id, patch })

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
          checked={asset.enabled}
          onChange={(event) => update({ enabled: event.target.checked })}
          aria-label={de.enabled}
        />
        <input
          type="text"
          value={asset.name}
          onChange={(event) => update({ name: event.target.value })}
          placeholder={de.assetNamePlaceholder}
          className="min-w-0 flex-1 rounded-md border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--hairline)', background: chartInk.surface }}
        />
        <button
          type="button"
          onClick={() => dispatch({ type: 'removeAsset', id: asset.id })}
          className="shrink-0 text-xs"
          style={{ color: chartInk.muted }}
        >
          {de.removeEntry}
        </button>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <NumberField
          label={de.currentValue}
          value={asset.currentValue}
          onChange={(value) => update({ currentValue: value })}
          min={0}
          suffix="€"
          hint={de.currentValueHint}
        />
        <NumberField
          label={de.monthlyContribution}
          value={asset.monthlyContribution}
          onChange={(value) => update({ monthlyContribution: value })}
          min={0}
          suffix="€"
          hint={de.monthlyContributionHint}
        />
        <NumberField
          label={de.annualReturn}
          value={asset.annualReturn * 100}
          onChange={(value) => update({ annualReturn: value / 100 })}
          min={-10}
          max={15}
          step={0.1}
          suffix="%"
          hint={de.annualReturnHint}
        />
        <NumberField
          label={de.annualReturnInRetirement}
          value={asset.annualReturnInRetirement * 100}
          onChange={(value) => update({ annualReturnInRetirement: value / 100 })}
          min={-10}
          max={15}
          step={0.1}
          suffix="%"
          hint={de.annualReturnInRetirementHint}
        />
      </div>
    </li>
  )
}
