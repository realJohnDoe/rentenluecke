type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /**
   * Track color while checked, e.g. an entry's chart color. Doubles as that
   * entry's color swatch, so the row doesn't need a separate one. Defaults to
   * the neutral `--control` token.
   */
  color?: string
}

/**
 * On/off control for state that takes effect immediately (whether an entry
 * counts toward the projection) — a switch, not a checkbox, since nothing is
 * being selected from a set or submitted.
 */
export function Switch({ checked, onChange, label, color }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={checked && color ? { borderColor: color, background: color } : undefined}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border
        transition-colors duration-150
        ${checked ? (color ? '' : 'border-control bg-control') : 'border-hairline bg-raised'}`}
    >
      <span
        aria-hidden
        className={`absolute left-0.5 size-5 rounded-full bg-surface shadow transition-transform
          duration-150 ${checked ? 'translate-x-4' : 'translate-x-0'}`}
      />
    </button>
  )
}
