import type { ReactNode } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Card } from './ui/Card'
import { Button } from './ui/Button'
import { useExpandedEntries } from '../hooks/useExpandedEntries'
import { useFocusOnAdd } from '../hooks/useFocusOnAdd'
import { useReorder } from '../hooks/useReorder'

type Props<T extends { id: string }> = {
  entries: T[]
  title: string
  emptyText: string
  addLabel: string
  onAdd: () => void
  onReorder: (ids: string[]) => void
  renderCard: (entry: T, expansion: { expanded: boolean; onToggle: () => void }) => ReactNode
}

/**
 * Sortable, expandable list shell shared by the pension and asset lists: card
 * title, empty text, drag-and-drop reordering and the add button. The caller
 * supplies the dispatches and renders each entry's `EntryCard`.
 */
export function EntryList<T extends { id: string }>({
  entries,
  title,
  emptyText,
  addLabel,
  onAdd,
  onReorder,
  renderCard,
}: Props<T>) {
  const { listRef, focusAfterAdd } = useFocusOnAdd()
  const ids = entries.map((entry) => entry.id)
  const { isExpanded, toggle, expandAfterAdd } = useExpandedEntries(ids)
  const { sensors, handleDragEnd } = useReorder(ids, onReorder)

  return (
    <Card title={title}>
      {entries.length === 0 ? (
        <p className="text-xs text-ink-muted">{emptyText}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul ref={listRef} className="flex flex-col gap-2">
              {entries.map((entry) =>
                renderCard(entry, {
                  expanded: isExpanded(entry.id),
                  onToggle: () => toggle(entry.id),
                }),
              )}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <div className="mt-3">
        <Button
          onClick={() => {
            focusAfterAdd()
            expandAfterAdd()
            onAdd()
          }}
        >
          {addLabel}
        </Button>
      </div>
    </Card>
  )
}
