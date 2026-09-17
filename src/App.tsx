import { useMemo, useReducer } from 'react'
import { Charts } from './components/Charts'
import { Summary } from './components/Summary'
import { PlanForm } from './components/PlanForm'
import { PensionList } from './components/PensionList'
import { AssetList } from './components/AssetList'
import { defaultPlan } from './model/defaultPlan'
import { buildSeries, toChartRows } from './model/chartRows'
import { project, resolveTimeline } from './model/finance'
import { planReducer } from './state/planReducer'
import type { Scenario, ValueMode } from './model/types'
import { de } from './i18n/de'
import { chartInk } from './theme'

// Both are view options, not part of the plan. They become UI toggles in a later
// step; until then the chart shows the case most people care about.
const SCENARIO: Scenario = 'continue'
const VALUE_MODE: ValueMode = 'real'

export function App() {
  const [plan, dispatch] = useReducer(planReducer, defaultPlan)

  const { rows, series, summary, timeline } = useMemo(() => {
    const projection = project(plan, SCENARIO, VALUE_MODE)
    return {
      rows: toChartRows(projection),
      series: buildSeries(plan),
      summary: projection.summary,
      timeline: resolveTimeline(plan),
    }
  }, [plan])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6">
      <header>
        <h1 className="text-xl font-semibold">{de.appTitle}</h1>
        <p className="text-sm" style={{ color: chartInk.secondary }}>
          {de.appSubtitle}
        </p>
        <p className="mt-1 text-xs" style={{ color: chartInk.muted }}>
          {de.scenarioContinue} · {de.valueModeReal}
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,360px)_1fr] lg:items-start">
        <div className="flex flex-col gap-3">
          <PlanForm plan={plan} dispatch={dispatch} />
          <PensionList plan={plan} dispatch={dispatch} />
          <AssetList plan={plan} dispatch={dispatch} />
        </div>

        <div className="flex flex-col gap-3">
          <Summary summary={summary} />
          <Charts
            rows={rows}
            assetSeries={series.assets}
            incomeSeries={series.income}
            timeline={timeline}
          />
        </div>
      </div>

      <footer className="text-xs" style={{ color: chartInk.muted }}>
        {de.disclaimer}
      </footer>
    </div>
  )
}
