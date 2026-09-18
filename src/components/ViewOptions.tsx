import type { Scenario, ValueMode } from '../model/types'
import { de } from '../i18n/de'

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
 *
 * The scenario control gets the wider share of the row: its two labels are
 * whole sentences, while "Heutige Kaufkraft / Nominal" is a pair of words.
 */
export function ViewOptions({ scenario, onScenarioChange, valueMode, onValueModeChange }: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
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
          { value: 'nominal', label: de.valueModeNominal },
          { value: 'real', label: de.valueModeReal },
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
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-secondary">{label}</span>
      {/*
       * Two sizing rules for two situations. On a phone the control fills the
       * column and `grid-cols-2` keeps its halves equal, so it can't go ragged
       * when one label wraps. From `sm` it switches to a content-width flex
       * row: "Weiter einzahlen bis Rentenbeginn" is three times the length of
       * "Nominal", and holding them to equal widths there made the pair wider
       * than the panel and pushed the second control onto its own line.
       */}
      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-2 gap-1 rounded-lg border border-hairline bg-surface p-1 sm:flex sm:w-fit"
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`min-h-9 rounded-md px-3 py-1.5 text-xs font-medium leading-snug
                transition-colors sm:whitespace-nowrap ${
                  active
                    ? 'bg-ink text-surface'
                    : 'text-ink-secondary hover:bg-raised hover:text-ink'
                }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
