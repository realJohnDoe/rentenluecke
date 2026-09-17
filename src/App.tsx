import { useMemo, useReducer, useState } from 'react'
import { Charts } from './components/Charts'
import { Summary } from './components/Summary'
import { PlanForm } from './components/PlanForm'
import { PensionList } from './components/PensionList'
import { AssetList } from './components/AssetList'
import { Toolbar } from './components/Toolbar'
import { defaultPlan } from './model/defaultPlan'
import { buildSeries, toChartRows } from './model/chartRows'
import { project, resolveTimeline } from './model/finance'
import { planReducer } from './state/planReducer'
import type { Scenario, ValueMode } from './model/types'
import { de } from './i18n/de'
import { chartInk } from './theme'

export function App() {
  const [plan, dispatch] = useReducer(planReducer, defaultPlan)
  // Both are view options, never part of the plan — see the "What is a Plan"
  // convention.
  const [scenario, setScenario] = useState<Scenario>('continue')
  const [valueMode, setValueMode] = useState<ValueMode>('real')

  // Both scenarios are always projected, keyed only on what actually changes
  // their result, so flipping the active scenario never recomputes either one.
  const continueProjection = useMemo(
    () => project(plan, 'continue', valueMode),
    [plan, valueMode],
  )
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
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold">{de.appTitle}</h1>
        <p className="text-sm" style={{ color: chartInk.secondary }}>
          {de.appSubtitle}
        </p>
      </header>

      <Toolbar
        scenario={scenario}
        onScenarioChange={setScenario}
        valueMode={valueMode}
        onValueModeChange={setValueMode}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="flex flex-col gap-3">
          <PlanForm plan={plan} dispatch={dispatch} />
          <PensionList plan={plan} dispatch={dispatch} />
          <AssetList plan={plan} dispatch={dispatch} />
        </div>

        <div className="flex flex-col gap-3">
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
      </div>

      <footer className="text-xs" style={{ color: chartInk.muted }}>
        {de.disclaimer}
      </footer>
    </div>
  )
}
