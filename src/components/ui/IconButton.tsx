import type { ReactNode } from 'react'

type Props = {
  onClick: () => void
  label: string
  children: ReactNode
  /** `critical` paints the icon in the gap colour — only the remove action. */
  tone?: 'muted' | 'critical'
  expanded?: boolean
  /** Id of the region this button expands — only meaningful with `expanded`. */
  controls?: string
}

/**
 * A bare icon control sized to a 40px touch target. The icon itself stays
 * small; the padding is what a finger actually hits, which is why the size is
 * set here rather than on each icon.
 */
export function IconButton({
  onClick,
  label,
  children,
  tone = 'muted',
  expanded,
  controls,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      aria-controls={controls}
      className={`inline-flex size-10 shrink-0 items-center justify-center rounded-lg
        transition-colors hover:bg-raised
        ${tone === 'critical' ? 'text-critical' : 'text-ink-muted hover:text-ink'}`}
    >
      {children}
    </button>
  )
}
