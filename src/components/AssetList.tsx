import type { Dispatch } from 'react'
import { NumberField } from './NumberField'
import { EntryCard } from './EntryCard'
import { EntryList } from './EntryList'
import { assetColor } from '../model/chartRows'
import type { Asset, Plan } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import { de } from '../i18n/de'
import { formatEuro, formatPercent } from '../format'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

export function AssetList({ plan, dispatch }: Props) {
  return (
    <EntryList
      entries={plan.assets}
      title={de.assetListTitle}
      emptyText={de.assetsEmpty}
      addLabel={de.addAsset}
      onAdd={() => dispatch({ type: 'addAsset' })}
      onReorder={(ids) => dispatch({ type: 'reorderAssets', ids })}
      renderCard={(asset, { expanded, onToggle }) => (
        <AssetCard
          key={asset.id}
          asset={asset}
          color={assetColor(plan, asset.id)}
          dispatch={dispatch}
          expanded={expanded}
          onToggle={onToggle}
        />
      )}
    />
  )
}

function AssetCard({
  asset,
  color,
  dispatch,
  expanded,
  onToggle,
}: {
  asset: Asset
  color: string
  dispatch: Dispatch<PlanAction>
  expanded: boolean
  onToggle: () => void
}) {
  const update = (patch: Partial<Omit<Asset, 'id'>>) =>
    dispatch({ type: 'updateAsset', id: asset.id, patch })

  return (
    <EntryCard
      id={asset.id}
      color={color}
      enabled={asset.enabled}
      onEnabledChange={(enabled) => update({ enabled })}
      name={asset.name}
      onNameChange={(name) => update({ name })}
      namePlaceholder={de.assetNamePlaceholder}
      onRemove={() => dispatch({ type: 'removeAsset', id: asset.id })}
      expanded={expanded}
      onToggle={onToggle}
      summary={assetSummary(asset)}
    >
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
        suffix="%"
        hint={de.annualReturnHint}
      />
      <NumberField
        label={de.annualReturnInRetirement}
        value={asset.annualReturnInRetirement * 100}
        onChange={(value) => update({ annualReturnInRetirement: value / 100 })}
        min={-10}
        max={15}
        suffix="%"
        hint={de.annualReturnInRetirementHint}
      />
    </EntryCard>
  )
}

/** Compact, one-line description of an asset's settings for the collapsed row. */
function assetSummary(asset: Asset): string {
  const parts = [formatEuro(asset.currentValue)]
  if (asset.monthlyContribution !== 0)
    parts.push(`+${formatEuro(asset.monthlyContribution)}${de.perMonthSuffix}`)
  parts.push(
    `${formatPercent(asset.annualReturn)} / ${formatPercent(asset.annualReturnInRetirement)}`,
  )
  return parts.join(' · ')
}
