import type { ReactNode } from 'react'
import { IconButton } from './ui/IconButton'
import { de } from '../i18n/de'

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
 *
 * A disabled entry dims its name and summary so the list shows at a glance
 * which entries the projection is actually counting.
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
    <li className="rounded-lg border border-hairline">
      <div className="flex items-center gap-2 p-2 pl-3">
        <span
          aria-hidden
          className="inline-block size-3 shrink-0 rounded-sm"
          style={{ background: color, opacity: enabled ? 1 : 0.35 }}
        />
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => onEnabledChange(event.target.checked)}
          aria-label={`${de.enabled}: ${name || namePlaceholder}`}
          className="size-5 shrink-0"
        />
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
          aria-label={namePlaceholder}
          className={`h-10 min-w-0 flex-1 rounded-lg border border-hairline bg-surface px-3
            text-base sm:text-sm ${enabled ? '' : 'text-ink-muted'}`}
        />
        <IconButton
          onClick={onToggle}
          label={expanded ? de.collapseEntry : de.expandEntry}
          expanded={expanded}
        >
          <ChevronIcon expanded={expanded} />
        </IconButton>
      </div>

      {expanded ? (
        <div className="border-t border-hairline px-3 pb-3 pt-3">
          <div className="grid gap-3 sm:grid-cols-2">{children}</div>
          <div className="mt-2 flex justify-end">
            <IconButton onClick={onRemove} label={de.removeEntry} tone="critical">
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      ) : (
        /*
         * A second way to hit the same toggle, so the summary line is tappable
         * too. It stays out of the accessibility tree: the chevron above is
         * already the labelled control, and announcing the row twice would be
         * noise rather than help.
         */
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-hidden
          className={`block w-full truncate rounded-b-lg px-3 pb-3 text-left text-xs tabular-nums
            ${enabled ? 'text-ink-muted' : 'text-ink-muted/60'}`}
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
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="transition-transform duration-150"
      style={{ transform: expanded ? 'rotate(180deg)' : undefined }}
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
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
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
