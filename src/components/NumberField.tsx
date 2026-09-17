import { useEffect, useId, useState } from 'react'
import { chartInk } from '../theme'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Unit shown next to the input, e.g. "€", "%", "Jahre". */
  suffix?: string
  hint?: string
  /** Also render a range input beneath the number field, bound to the same value. */
  slider?: boolean
}

/**
 * One reusable labelled numeric control. While the field is focused, the
 * displayed text is local state rather than a formatting of `value` — so a
 * half-typed value like "1," is never clobbered by a re-render — and both "."
 * and "," are accepted as the decimal separator.
 */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  hint,
  slider = false,
}: Props) {
  const id = useId()
  const [text, setText] = useState(() => String(value))
  const [focused, setFocused] = useState(false)

  // Only follow external changes while the user isn't mid-edit.
  useEffect(() => {
    if (!focused) setText(String(value))
  }, [value, focused])

  function handleChange(raw: string) {
    setText(raw)
    const parsed = parseLocaleNumber(raw)
    if (parsed !== undefined) onChange(clamp(parsed, min, max))
  }

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium" style={{ color: chartInk.secondary }}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          className="w-full rounded-md border px-2 py-1 text-sm"
          style={{ borderColor: 'var(--hairline)', background: chartInk.surface }}
          value={text}
          onFocus={() => setFocused(true)}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => {
            setFocused(false)
            setText(String(value))
          }}
        />
        {suffix ? (
          <span className="shrink-0 text-xs" style={{ color: chartInk.muted }}>
            {suffix}
          </span>
        ) : null}
      </div>
      {slider ? (
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
          className="w-full"
        />
      ) : null}
      {hint ? (
        <p className="text-xs" style={{ color: chartInk.muted }}>
          {hint}
        </p>
      ) : null}
    </div>
  )
}

function parseLocaleNumber(raw: string): number | undefined {
  const normalised = raw.trim().replace(',', '.')
  if (normalised === '' || normalised === '-') return undefined
  const parsed = Number(normalised)
  return Number.isFinite(parsed) ? parsed : undefined
}

function clamp(value: number, min?: number, max?: number): number {
  let result = value
  if (min !== undefined) result = Math.max(min, result)
  if (max !== undefined) result = Math.min(max, result)
  return result
}
