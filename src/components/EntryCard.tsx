import type { ReactNode } from 'react'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  color: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  name: string
  onNameChange: (name: string) => void
  namePlaceholder: string
  onRemove: () => void
  expanded: boolean
  onToggle: () => void
  /** One-line description of the fields hidden in `children`, shown while collapsed. */
  summary: string
  children: ReactNode
}

/**
 * Row shell shared by pension and asset cards: a header (swatch, enable
 * toggle, name, expand) plus either a one-line summary or the full field
 * grid passed as `children` with a remove icon below it, depending on
 * `expanded`. Remove lives only in the expanded view so it can't be hit
 * by accident while scanning the collapsed list.
 */
export function EntryCard({
  color,
  enabled,
  onEnabledChange,
  name,
  onNameChange,
  namePlaceholder,
  onRemove,
  expanded,
  onToggle,
  summary,
  children,
}: Props) {
  return (
    <li className="rounded-md border" style={{ borderColor: 'var(--hairline)' }}>
      <div className="flex items-center gap-2 p-3">
        <span
          aria-hidden
          className="inline-block h-3 w-3 shrink-0 rounded-sm"
          style={{ background: color }}
        />
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          aria-label={de.enabled}
        />
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
          className="min-w-0 flex-1 rounded-md border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--hairline)', background: chartInk.surface }}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-label={expanded ? de.collapseEntry : de.expandEntry}
          className="shrink-0 rounded p-1"
          style={{ color: chartInk.muted }}
        >
          <ChevronIcon expanded={expanded} />
        </button>
      </div>
      {expanded ? (
        <div
          className="border-t px-3 pb-3 pt-3"
          style={{ borderColor: 'var(--hairline)' }}
        >
          <div className="grid gap-2 sm:grid-cols-2">{children}</div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={onRemove}
              aria-label={de.removeEntry}
              title={de.removeEntry}
              className="shrink-0 rounded p-1"
              style={{ color: chartInk.gap }}
            >
              <TrashIcon />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={onToggle}
          className="block w-full truncate px-3 pb-3 text-left text-xs"
          style={{ color: chartInk.muted }}
        >
          {summary}
        </button>
      )}
    </li>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      style={{ transform: expanded ? 'rotate(180deg)' : undefined, transition: 'transform 0.15s ease' }}
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M6.5 7.5v4M9.5 7.5v4M4 4.5l.6 8.1a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.1"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
