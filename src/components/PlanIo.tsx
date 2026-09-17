import { useRef, useState } from 'react'
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
 * Export/import for the plan file. A low-frequency, whole-page action — unlike
 * the view options — so it lives at the bottom of the page next to the
 * disclaimer rather than competing with the input cards and charts for the
 * first screenful on mobile.
 */
export function PlanIo({ plan, dispatch }: Props) {
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
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <span className="basis-full text-xs font-medium text-ink-secondary sm:basis-auto">
          {de.planIoLabel}
        </span>
        <Button onClick={() => downloadPlan(plan)}>{de.exportYaml}</Button>
        <Button onClick={() => fileInputRef.current?.click()}>{de.importPlan}</Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".yaml,.yml"
          className="hidden"
          onChange={(event) => void handleFileChange(event)}
        />
      </div>
      {importIssues.length > 0 ? (
        <div className="rounded-lg border border-critical bg-surface px-3 py-2 text-xs text-critical" role="alert">
          <p className="font-medium">{de.importErrorTitle}</p>
          {importIssues.map((issue, index) => (
            <p key={index}>{de.importError(issue)}</p>
          ))}
        </div>
      ) : null}
    </div>
  )
}
