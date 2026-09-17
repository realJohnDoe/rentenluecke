import { useEffect, useId, useState } from 'react'
import { formatFieldValue } from '../format'

type Props = {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  /** Unit shown inside the input's trailing edge, e.g. "€", "%", "Jahre". */
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
 *
 * The input is 16px on phones on purpose: iOS Safari zooms the whole page in
 * when a focused field's text is smaller than that, and the page never zooms
 * back out.
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
  const hintId = `${id}-hint`
  const [text, setText] = useState(() => formatFieldValue(value))
  const [focused, setFocused] = useState(false)

  // Only follow external changes while the user isn't mid-edit.
  useEffect(() => {
    if (!focused) setText(formatFieldValue(value))
  }, [value, focused])

  function handleChange(raw: string) {
    setText(raw)
    const parsed = parseLocaleNumber(raw)
    if (parsed !== undefined) onChange(clamp(parsed, min, max))
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-ink-secondary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          aria-describedby={hint ? hintId : undefined}
          className={`h-10 w-full rounded-lg border border-hairline bg-surface px-3
            text-base tabular-nums sm:text-sm ${suffix ? 'pr-12' : ''}`}
          value={text}
          onFocus={() => setFocused(true)}
          onChange={(event) => handleChange(event.target.value)}
          onBlur={() => {
            setFocused(false)
            setText(formatFieldValue(value))
          }}
        />
        {suffix ? (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-ink-muted"
          >
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
          aria-label={label}
          onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
          className="w-full"
        />
      ) : null}
      {hint ? (
        <p id={hintId} className="text-xs leading-snug text-ink-muted">
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
