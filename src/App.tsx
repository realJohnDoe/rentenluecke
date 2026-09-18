import { useEffect, useMemo, useReducer, useState } from 'react'
import { Charts } from './components/Charts'
import { Summary } from './components/Summary'
import { PlanForm } from './components/PlanForm'
import { PensionList } from './components/PensionList'
import { AssetList } from './components/AssetList'
import { ViewOptions } from './components/ViewOptions'
import { GapBar } from './components/GapBar'
import { PlanIo } from './components/PlanIo'
import { defaultPlan } from './model/defaultPlan'
import { buildSeries, toChartRows } from './model/chartRows'
import { project, resolveTimeline } from './model/finance'
import { parsePlan } from './model/schema'
import { planReducer } from './state/planReducer'
import type { Plan, Scenario, ValueMode } from './model/types'
import { de } from './i18n/de'

const STORAGE_KEY = 'rentenluecke:plan:v1'

/** A corrupt or outdated stored value is silently ignored in favour of `defaultPlan`. */
function loadStoredPlan(): Plan {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return defaultPlan
    const result = parsePlan(JSON.parse(raw))
    return result.ok ? result.plan : defaultPlan
  } catch {
    return defaultPlan
  }
}

export function App() {
  const [plan, dispatch] = useReducer(planReducer, undefined, loadStoredPlan)
  // Both are view options, never part of the plan — see the "What is a Plan"
  // convention.
  const [scenario, setScenario] = useState<Scenario>('continue')
  const [valueMode, setValueMode] = useState<ValueMode>('nominal')

  // Autosave the plan only — never the view options above — debounced so
  // rapid edits (e.g. dragging a slider) don't hit localStorage every tick.
  useEffect(() => {
    const timeout = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plan))
      } catch {
        // localStorage can throw (e.g. private browsing); autosave is best-effort.
      }
    }, 300)
    return () => clearTimeout(timeout)
  }, [plan])

  // Both scenarios are always projected, keyed only on what actually changes
  // their result, so flipping the active scenario never recomputes either one.
  const continueProjection = useMemo(() => project(plan, 'continue', valueMode), [plan, valueMode])
  const stopProjection = useMemo(() => project(plan, 'stop', valueMode), [plan, valueMode])

  const projection = scenario === 'continue' ? continueProjection : stopProjection
  const ghostScenario: Scenario = scenario === 'continue' ? 'stop' : 'continue'
  const ghostProjection = scenario === 'continue' ? stopProjection : continueProjection

  const rows = useMemo(
    () => toChartRows(projection, ghostProjection),
    [projection, ghostProjection],
  )
  const series = useMemo(() => buildSeries(plan), [plan])
  const timeline = useMemo(() => resolveTimeline(plan), [plan])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{de.appTitle}</h1>
        <p className="mt-1 text-sm text-ink-secondary">{de.appSubtitle}</p>
      </header>

      <main className="flex flex-col gap-4">
        {/*
         * Results first, inputs second — in the DOM, and so on a phone, where the
         * page is one column. The input cards are well over a screenful, and with
         * them on top every edit meant a long scroll to see what it changed.
         * From `lg` the two are side by side and the order stops mattering, so
         * the inputs are placed back into the left column explicitly.
         */}
        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="flex min-w-0 flex-col gap-4 lg:col-start-2 lg:row-start-1">
            <ViewOptions
              scenario={scenario}
              onScenarioChange={setScenario}
              valueMode={valueMode}
              onValueModeChange={setValueMode}
            />
            <Summary
              summary={projection.summary}
              ghostSummary={ghostProjection.summary}
              ghostScenarioName={de.scenarioName(ghostScenario)}
            />
            <Charts
              rows={rows}
              assetSeries={series.assets}
              incomeSeries={series.income}
              timeline={timeline}
              valueMode={valueMode}
              ghostScenarioName={de.scenarioName(ghostScenario)}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-4 lg:col-start-1 lg:row-start-1">
            <GapBar summary={projection.summary} />
            <PlanForm plan={plan} dispatch={dispatch} />
            <PensionList plan={plan} dispatch={dispatch} />
            <AssetList plan={plan} dispatch={dispatch} />
          </div>
        </div>
      </main>

      <footer className="mt-2 flex flex-col gap-3 border-t border-hairline pt-4">
        <PlanIo plan={plan} dispatch={dispatch} />
        <p className="text-xs text-ink-muted">{de.disclaimer}</p>
      </footer>
    </div>
  )
}
