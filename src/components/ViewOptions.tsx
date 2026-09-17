import type { Scenario, ValueMode } from '../model/types'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  scenario: Scenario
  onScenarioChange: (scenario: Scenario) => void
  valueMode: ValueMode
  onValueModeChange: (valueMode: ValueMode) => void
}

/**
 * Two segmented controls for the view options (`useState` in `App.tsx`, never
 * in the plan — see the "What is a Plan" convention). They only affect the
 * projection shown in `Summary` and `Charts`, never the input cards, so they
 * sit directly above those two rather than at the top of the page.
 */
export function ViewOptions({ scenario, onScenarioChange, valueMode, onValueModeChange }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <SegmentedControl
        label={de.scenarioToolbarLabel}
        value={scenario}
        onChange={onScenarioChange}
        options={[
          { value: 'continue', label: de.scenarioContinue },
          { value: 'stop', label: de.scenarioStop },
        ]}
      />
      <SegmentedControl
        label={de.valueModeToolbarLabel}
        value={valueMode}
        onChange={onValueModeChange}
        options={[
          { value: 'real', label: de.valueModeReal },
          { value: 'nominal', label: de.valueModeNominal },
        ]}
      />
    </div>
  )
}

function SegmentedControl<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium" style={{ color: chartInk.secondary }}>
        {label}
      </span>
      <div
        className="inline-flex overflow-hidden rounded-md border"
        style={{ borderColor: 'var(--hairline)' }}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              className="px-3 py-1.5 text-xs font-medium"
              style={{
                background: active ? chartInk.primary : chartInk.surface,
                color: active ? chartInk.surface : chartInk.secondary,
              }}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
