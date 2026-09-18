import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Wires a drag-and-drop reorder of a flat id list — shared by `PensionList`
 * and `AssetList`, which each hold a `<DndContext>` over their own entries.
 *
 * `PointerSensor` covers mouse, touch and pen alike, so the same drag handle
 * works on desktop and mobile without a separate touch backend. A small
 * activation distance keeps a plain tap on the handle from being read as a
 * (zero-length) drag. `KeyboardSensor` makes the same handle reachable by tab
 * and reorderable with the arrow keys, for anyone who cannot drag.
 */
export function useReorder(ids: string[], onReorder: (ids: string[]) => void) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = ids.indexOf(String(active.id))
    const toIndex = ids.indexOf(String(over.id))
    if (fromIndex === -1 || toIndex === -1) return
    onReorder(arrayMove(ids, fromIndex, toIndex))
  }

  return { sensors, handleDragEnd }
}
