import type { ReactNode, Ref } from 'react'

type Props = {
  onClick: () => void
  /** Only needed where focus has to be moved back to the button by hand. */
  ref?: Ref<HTMLButtonElement>
  children: ReactNode
  /** `full` stretches to the container — used where a row of buttons stacks on mobile. */
  width?: 'auto' | 'full'
  /** `critical` marks the one button that confirms a destructive action. */
  tone?: 'default' | 'critical'
}

/**
 * The one low-emphasis button style on the page: add an entry, export, import,
 * reset. `min-h-10` is what keeps every one of them a comfortable touch target.
 *
 * `tone="critical"` is the single exception to "one style": it colours the
 * button that actually discards the plan, so the confirmation step does not
 * look identical to the step that asked for it.
 */
export function Button({ onClick, children, width = 'auto', tone = 'default', ref }: Props) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg border
        bg-surface px-3 py-2 text-sm font-medium transition duration-150 hover:bg-raised
        active:scale-[0.98]
        ${
          tone === 'critical'
            ? 'border-critical text-critical'
            : 'border-hairline text-ink-secondary hover:text-ink'
        }
        ${width === 'full' ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}
