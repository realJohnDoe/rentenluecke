import { useRef, useState } from 'react'
import type { ChangeEvent, Dispatch } from 'react'
import type { Plan, Scenario, ValueMode } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import type { PlanIssue } from '../model/schema'
import { downloadPlan, readPlanFile } from '../model/io'
import { de } from '../i18n/de'
import { chartInk } from '../theme'

type Props = {
  scenario: Scenario
  onScenarioChange: (scenario: Scenario) => void
  valueMode: ValueMode
  onValueModeChange: (valueMode: ValueMode) => void
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

/**
 * The two segmented controls for the view options (`useState` in `App.tsx`,
 * never in the plan — see the "What is a Plan" convention) plus export/import
 * for the plan itself.
 */
export function Toolbar({
  scenario,
  onScenarioChange,
  valueMode,
  onValueModeChange,
  plan,
  dispatch,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importIssues, setImportIssues] = useState<PlanIssue[]>([])

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const result = await readPlanFile(file)
    if (result.ok) {
      setImportIssues([])
      dispatch({ type: 'replacePlan', plan: result.plan })
    } else {
      setImportIssues(result.issues)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-3">
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
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium" style={{ color: chartInk.secondary }}>
            {de.planIoLabel}
          </span>
          <div className="flex flex-wrap gap-2">
            <ToolbarButton onClick={() => downloadPlan(plan)}>{de.exportYaml}</ToolbarButton>
            <ToolbarButton onClick={() => fileInputRef.current?.click()}>{de.importPlan}</ToolbarButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".yaml,.yml"
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
            />
          </div>
        </div>
      </div>
      {importIssues.length > 0 ? (
        <div
          role="alert"
          className="rounded-md border px-3 py-2 text-xs"
          style={{ borderColor: chartInk.gap, color: chartInk.gap, background: chartInk.surface }}
        >
          <p className="font-medium">{de.importErrorTitle}</p>
          {importIssues.map((issue, index) => (
            <p key={index}>{de.importError(issue)}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ToolbarButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      className="rounded-md border px-3 py-1.5 text-xs font-medium"
      style={{ borderColor: 'var(--hairline)', color: chartInk.secondary, background: chartInk.surface }}
      onClick={onClick}
    >
      {children}
    </button>
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
