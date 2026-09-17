import type { ReactNode } from 'react'

type Props = {
  title: string
  /** Optional one-line explanation under the title. */
  hint?: string
  /** Rendered on the title row, right-aligned — units, counts, controls. */
  aside?: ReactNode
  children: ReactNode
}

/**
 * The panel shell every top-level section uses: raised surface, hairline
 * border, heading. Every section on the page is one of these, so the padding
 * and radius are decided here once rather than repeated per component.
 */
export function Card({ title, hint, aside, children }: Props) {
  return (
    <section className="rounded-xl border border-hairline bg-surface p-4 sm:p-5">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          {hint ? <p className="mt-0.5 text-xs text-ink-muted">{hint}</p> : null}
        </div>
        {aside ? <div className="shrink-0">{aside}</div> : null}
      </div>
      {children}
    </section>
  )
}
