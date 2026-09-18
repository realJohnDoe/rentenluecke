import { useId } from 'react'
import type { CSSProperties, ReactNode, Ref } from 'react'
import { IconButton } from './ui/IconButton'
import { Collapsible } from './ui/Collapsible'
import { Switch } from './ui/Switch'
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
  /**
   * The drag handle button, already wired to whatever drag-and-drop library
   * the list uses (see `PensionCard`/`AssetCard`) — a fully-built element
   * rather than a prop bag, so this component stays library-agnostic.
   */
  dragHandle: ReactNode
  /** Ref for the `<li>` itself, so the drag library can measure and move it. */
  itemRef: Ref<HTMLLIElement>
  /** Live transform/transition while a drag is in progress. */
  itemStyle?: CSSProperties
  isDragging?: boolean
  children: ReactNode
}

/**
 * Row shell shared by pension and asset cards: a header (swatch, enable
 * toggle, name, expand) plus either a one-line summary or the full field
 * grid passed as `children` with a remove icon below it, depending on
 * `expanded`. Remove lives only in the expanded view so it can't be hit
 * by accident while scanning the collapsed list.
 *
 * Both halves are always rendered, each in its own `Collapsible`, and the two
 * trade places by unfolding rather than by swapping between frames: a card
 * opens into its fields instead of the rest of the list jumping down the page
 * to make room for them. `Collapsible` keeps the folded half inert, so only
 * the visible one is reachable.
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
  dragHandle,
  itemRef,
  itemStyle,
  isDragging = false,
  children,
}: Props) {
  const detailsId = useId()

  return (
    /*
     * `@container`: the field grid below pairs up on the card's own width, not
     * the viewport's. On a wide screen this card sits in a 22rem sidebar, where
     * a viewport-driven `sm:grid-cols-2` gave two 136px columns and wrapped
     * every hint over six lines.
     *
     * `bg-surface` matches the card's parent (see `ui/Card.tsx`) so it is
     * invisible at rest, but keeps the row opaque while it is lifted above its
     * siblings during a drag — without it the translated card would show
     * whatever sits behind it through its gaps.
     */
    <li
      ref={itemRef}
      style={itemStyle}
      className={`@container rounded-lg border border-hairline bg-surface
        ${isDragging ? 'relative z-10 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-2 p-2 pl-3">
        {dragHandle}
        <span
          aria-hidden
          className="inline-block size-3 shrink-0 rounded-sm transition-opacity"
          style={{ background: color, opacity: enabled ? 1 : 0.35 }}
        />
        <Switch
          checked={enabled}
          onChange={onEnabledChange}
          label={`${de.enabled}: ${name || namePlaceholder}`}
        />
        <input
          type="text"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder={namePlaceholder}
          aria-label={namePlaceholder}
          className={`h-10 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-3
            text-base font-medium transition-colors hover:border-hairline hover:bg-surface
            focus-visible:border-hairline focus-visible:bg-surface sm:text-sm
            ${enabled ? '' : 'text-ink-muted font-normal'}`}
        />
        <IconButton
          onClick={onToggle}
          label={expanded ? de.collapseEntry : de.expandEntry}
          expanded={expanded}
          controls={detailsId}
        >
          <ChevronIcon expanded={expanded} />
        </IconButton>
      </div>

      <Collapsible open={expanded} id={detailsId}>
        <div className="border-t border-hairline px-3 pb-3 pt-3">
          <div className="grid gap-3 @md:grid-cols-2">{children}</div>
          <div className="mt-2 flex justify-end">
            <IconButton onClick={onRemove} label={de.removeEntry} tone="critical">
              <TrashIcon />
            </IconButton>
          </div>
        </div>
      </Collapsible>

      {/*
       * A second way to hit the same toggle, so the summary line is tappable
       * too. It stays out of the accessibility tree: the chevron above is
       * already the labelled control, and announcing the row twice would be
       * noise rather than help.
       */}
      <Collapsible open={!expanded}>
        <button
          type="button"
          onClick={onToggle}
          tabIndex={-1}
          aria-hidden
          className={`block w-full truncate rounded-b-lg px-3 pb-3 text-left text-xs tabular-nums
            transition-colors ${enabled ? 'text-ink-muted' : 'text-ink-muted/60'}`}
        >
          {summary}
        </button>
      </Collapsible>
    </li>
  )
}

/** Six-dot grip, the drag handle's icon — shared by `PensionCard` and `AssetCard`. */
export function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="5" cy="3" r="1.3" fill="currentColor" />
      <circle cx="11" cy="3" r="1.3" fill="currentColor" />
      <circle cx="5" cy="8" r="1.3" fill="currentColor" />
      <circle cx="11" cy="8" r="1.3" fill="currentColor" />
      <circle cx="5" cy="13" r="1.3" fill="currentColor" />
      <circle cx="11" cy="13" r="1.3" fill="currentColor" />
    </svg>
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
      className="transition-transform duration-200"
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
