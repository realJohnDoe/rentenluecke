import type { ReactNode } from 'react'

type Props = {
  onClick: () => void
  children: ReactNode
  /** `full` stretches to the container — used where a row of buttons stacks on mobile. */
  width?: 'auto' | 'full'
}

/**
 * The one low-emphasis button style on the page: add an entry, export, import.
 * `min-h-10` is what keeps every one of them a comfortable touch target.
 */
export function Button({ onClick, children, width = 'auto' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-10 items-center justify-center rounded-lg border border-hairline
        bg-surface px-3 py-2 text-sm font-medium text-ink-secondary
        transition-colors hover:bg-raised hover:text-ink
        ${width === 'full' ? 'w-full' : ''}`}
    >
      {children}
    </button>
  )
}
