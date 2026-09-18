import type { Dispatch } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { NumberField } from './NumberField'
import { EntryCard, GripIcon } from './EntryCard'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useExpandedEntries } from '../hooks/useExpandedEntries'
import { useFocusOnAdd } from '../hooks/useFocusOnAdd'
import { useReorder } from '../hooks/useReorder'
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
  const { listRef, focusAfterAdd } = useFocusOnAdd()
  const assetIds = plan.assets.map((asset) => asset.id)
  const { isExpanded, toggle, expandAfterAdd } = useExpandedEntries(assetIds)
  const { sensors, handleDragEnd } = useReorder(assetIds, (ids) =>
    dispatch({ type: 'reorderAssets', ids }),
  )

  return (
    <Card title={de.assetListTitle}>
      {plan.assets.length === 0 ? (
        <p className="text-xs text-ink-muted">{de.assetsEmpty}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={assetIds} strategy={verticalListSortingStrategy}>
            <ul ref={listRef} className="flex flex-col gap-2">
              {plan.assets.map((asset) => (
                <AssetCard
                  key={asset.id}
                  asset={asset}
                  color={assetColor(plan, asset.id)}
                  dispatch={dispatch}
                  expanded={isExpanded(asset.id)}
                  onToggle={() => toggle(asset.id)}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <div className="mt-3">
        <Button
          onClick={() => {
            focusAfterAdd()
            expandAfterAdd()
            dispatch({ type: 'addAsset' })
          }}
        >
          {de.addAsset}
        </Button>
      </div>
    </Card>
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

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id })
  const handleLabel = de.reorderEntry(asset.name || de.assetNamePlaceholder)

  return (
    <EntryCard
      itemRef={setNodeRef}
      itemStyle={{ transform: CSS.Transform.toString(transform), transition }}
      isDragging={isDragging}
      dragHandle={
        <button
          type="button"
          ref={setActivatorNodeRef}
          aria-label={handleLabel}
          title={handleLabel}
          className="inline-flex size-10 shrink-0 touch-none items-center justify-center rounded-lg
            text-ink-muted transition duration-150 hover:bg-raised hover:text-ink active:scale-95"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          {...attributes}
          {...listeners}
        >
          <GripIcon />
        </button>
      }
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
    </EntryCard>
  )
}

/** Compact, one-line description of an asset's settings for the collapsed row. */
function assetSummary(asset: Asset): string {
  const parts = [formatEuro(asset.currentValue)]
  if (asset.monthlyContribution !== 0) parts.push(`+${formatEuro(asset.monthlyContribution)}/Monat`)
  parts.push(
    `${formatPercent(asset.annualReturn)} / ${formatPercent(asset.annualReturnInRetirement)}`,
  )
  return parts.join(' · ')
}
