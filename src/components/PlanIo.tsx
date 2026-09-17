import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, Dispatch } from 'react'
import { Button } from './ui/Button'
import type { Plan } from '../model/types'
import type { PlanAction } from '../state/planReducer'
import type { PlanIssue } from '../model/schema'
import { downloadPlan, readPlanFile } from '../model/io'
import { de } from '../i18n/de'

type Props = {
  plan: Plan
  dispatch: Dispatch<PlanAction>
}

/**
 * Export, import and reset for the plan file. Low-frequency, whole-page actions
 * — unlike the view options — so they live at the bottom of the page next to
 * the disclaimer rather than competing with the input cards and charts for the
 * first screenful on mobile.
 *
 * Reset is two steps. The plan is autosaved, so there is no undo behind it: one
 * stray tap would otherwise throw away everything the user typed.
 */
export function PlanIo({ plan, dispatch }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const resetButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const [importIssues, setImportIssues] = useState<PlanIssue[]>([])
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Focus follows the confirmation, and lands on the harmless half of it.
  // Without this the keyboard user who opened the prompt would have to tab
  // back into it from wherever focus happened to stay.
  useEffect(() => {
    if (confirmingReset) cancelButtonRef.current?.focus()
  }, [confirmingReset])

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

  function cancelReset() {
    setConfirmingReset(false)
    resetButtonRef.current?.focus()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="basis-full text-xs font-medium text-ink-secondary sm:basis-auto">
          {de.planIoLabel}
        </span>
        <Button onClick={() => downloadPlan(plan)}>{de.exportYaml}</Button>
        <Button onClick={() => fileInputRef.current?.click()}>{de.importPlan}</Button>
        <Button ref={resetButtonRef} onClick={() => setConfirmingReset(true)}>
          {de.resetPlan}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>

      {confirmingReset ? (
        <div
          role="group"
          aria-label={de.resetPlanPrompt}
          className="flex flex-wrap items-center gap-2 rounded-lg border border-hairline
            bg-surface px-3 py-2 sm:gap-3"
        >
          <span className="basis-full text-xs text-ink-secondary sm:basis-auto">
            {de.resetPlanPrompt}
          </span>
          <Button
            tone="critical"
            onClick={() => {
              dispatch({ type: 'resetPlan' })
              setImportIssues([])
              cancelReset()
            }}
          >
            {de.resetPlanConfirm}
          </Button>
          <Button ref={cancelButtonRef} onClick={cancelReset}>
            {de.cancel}
          </Button>
        </div>
      ) : null}

      {importIssues.length > 0 ? (
        <div
          className="rounded-lg border border-critical bg-surface px-3 py-2 text-xs text-critical"
          role="alert"
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
