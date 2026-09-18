import type { ReactNode } from 'react'

type Props = {
  open: boolean
  /** Only needed where a control outside the region points at it with `aria-controls`. */
  id?: string
  children: ReactNode
}

/**
 * A region that grows and shrinks with its content instead of appearing and
 * vanishing between two frames.
 *
 * The height comes from the grid track alone (`0fr` ↔ `1fr`), so nothing has
 * to be measured and the content keeps its natural height at every width — a
 * `max-height` transition would have to guess a value large enough for the
 * widest wrap, and the collapse would then sit still for part of its duration.
 * A browser that cannot interpolate grid tracks simply snaps, which is what
 * the page did everywhere before.
 *
 * The region stays mounted in both states — that is what gives the collapse
 * something to animate, and it lets `aria-controls` point at an id that is
 * always in the document. `inert` is what keeps the collapsed copy out of the
 * tab order and the accessibility tree while it is folded away.
 */
export function Collapsible({ open, id, children }: Props) {
  return (
    <div
      id={id}
      inert={!open}
      className={`grid transition-[grid-template-rows] duration-200 ease-out
        ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}
