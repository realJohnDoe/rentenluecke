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
import { pensionColor } from '../model/chartRows'
import type { Pension, Plan } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import { de } from '../i18n/de'
import { formatEuro, formatPercent } from '../format'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

export function PensionList({ plan, dispatch }: Props) {
  const { listRef, focusAfterAdd } = useFocusOnAdd()
  const pensionIds = plan.pensions.map((pension) => pension.id)
  const { isExpanded, toggle, expandAfterAdd } = useExpandedEntries(pensionIds)
  const { sensors, handleDragEnd } = useReorder(pensionIds, (ids) =>
    dispatch({ type: 'reorderPensions', ids }),
  )

  return (
    <Card title={de.pensionsTitle}>
      {plan.pensions.length === 0 ? (
        <p className="text-xs text-ink-muted">{de.pensionsEmpty}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pensionIds} strategy={verticalListSortingStrategy}>
            <ul ref={listRef} className="flex flex-col gap-2">
              {plan.pensions.map((pension) => (
                <PensionCard
                  key={pension.id}
                  pension={pension}
                  color={pensionColor(plan, pension.id)}
                  retirementAge={plan.retirementAge}
                  dispatch={dispatch}
                  expanded={isExpanded(pension.id)}
                  onToggle={() => toggle(pension.id)}
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
            dispatch({ type: 'addPension' })
          }}
        >
          {de.addPension}
        </Button>
      </div>
    </Card>
  )
}

function PensionCard({
  pension,
  color,
  retirementAge,
  dispatch,
  expanded,
  onToggle,
}: {
  pension: Pension
  color: string
  retirementAge: number
  dispatch: Dispatch<PlanAction>
  expanded: boolean
  onToggle: () => void
}) {
  const update = (patch: Partial<Omit<Pension, 'id'>>) =>
    dispatch({ type: 'updatePension', id: pension.id, patch })

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: pension.id })
  const handleLabel = de.reorderEntry(pension.name || de.pensionNamePlaceholder)

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
      enabled={pension.enabled}
      onEnabledChange={(enabled) => update({ enabled })}
      name={pension.name}
      onNameChange={(name) => update({ name })}
      namePlaceholder={de.pensionNamePlaceholder}
      onRemove={() => dispatch({ type: 'removePension', id: pension.id })}
      expanded={expanded}
      onToggle={onToggle}
      summary={pensionSummary(pension, retirementAge)}
    >
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
    </EntryCard>
  )
}

/** Compact, one-line description of a pension's settings for the collapsed row. */
function pensionSummary(pension: Pension, retirementAge: number): string {
  const amounts =
    pension.monthlyIfStopped === pension.monthlyIfContinued
      ? formatEuro(pension.monthlyIfContinued)
      : `${formatEuro(pension.monthlyIfStopped)} / ${formatEuro(pension.monthlyIfContinued)}`
  const startAge = pension.startAge ?? retirementAge
  const parts = [amounts, `ab ${startAge}`]
  if (pension.annualIncrease !== 0) parts.push(`${formatPercent(pension.annualIncrease)} p.a.`)
  return parts.join(' · ')
}
