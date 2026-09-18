import type { Scenario } from '../model/types'
import type { PlanIssue } from '../model/schema'

/**
 * Every German string the UI shows. Code, data format and identifiers stay
 * English; this file is the single place where the app speaks German.
 */
export const de = {
  appTitle: 'Rentenlücken-Rechner',
  appSubtitle: 'Was bleibt im Monat übrig — und was fehlt zur Wunschrente?',

  // Chart panels
  assetsPanelTitle: 'Vermögen',
  assetsPanelHint: 'Aufbau bis zum Rentenbeginn, danach Entnahme bis zum Planungsende',
  incomePanelTitle: 'Monatliche Versorgung',
  incomePanelHint: 'Lebenslange Renten und Entnahmen aus dem Vermögen',
  /** Names the empty stretch of the income panel left of the retirement marker. */
  accumulationPhase: 'Ansparphase',

  /*
   * Spoken descriptions of the two chart panels. An SVG chart is silent to a
   * screen reader, so each panel carries one of these as visually hidden text —
   * the same few numbers a sighted reader takes from the shape of the curve.
   */
  assetsChartDescription: (d: {
    startValue: string
    startAge: string
    retirementValue: string
    retirementAge: string
    endValue: string
    endAge: string
  }) =>
    `Flächendiagramm: Das Vermögen wächst von ${d.startValue} im Alter ${d.startAge} auf ` +
    `${d.retirementValue} bei Rentenbeginn mit ${d.retirementAge} und wird bis zum Alter ` +
    `${d.endAge} auf ${d.endValue} abgebaut.`,
  incomeChartDescription: (d: {
    retirementAge: string
    retirementIncome: string
    target: string
    gap: string
    endAge: string
    endIncome: string
  }) =>
    `Flächendiagramm: Ab Rentenbeginn mit ${d.retirementAge} stehen ${d.retirementIncome} ` +
    `pro Monat zur Verfügung, gegenüber einer Wunschrente von ${d.target} — eine Rentenlücke ` +
    `von ${d.gap}. Im Alter ${d.endAge} sind es ${d.endIncome} pro Monat.`,

  // Axes and reference marks
  axisAge: 'Alter',
  /**
   * The unit shown on a chart panel's title row. On a narrow panel the ticks
   * are divided down to two or three digits, and the factor they were divided
   * by is named here rather than repeated on every tick.
   */
  axisUnitEuro: '€',
  axisUnitThousandEuro: 'Tsd. €',
  axisUnitMillionEuro: 'Mio. €',
  axisUnitPerMonth: (unit: string) => `${unit} pro Monat`,
  retirementStart: 'Rentenbeginn',

  // Series
  target: 'Wunschrente',
  gap: 'Rentenlücke',
  totalIncome: 'Gesamtversorgung',
  withdrawalOf: (name: string) => `Entnahme ${name}`,

  // Key figures
  summaryTitle: 'Auf einen Blick',
  /** Names the muted second figure under each key figure, once for all four. */
  ghostComparison: (scenarioName: string) => `Zum Vergleich: ${scenarioName}`,
  assetValueAtRetirement: 'Vermögen bei Rentenbeginn',
  incomeAtRetirement: 'Versorgung bei Rentenbeginn',
  gapAtRetirement: 'Rentenlücke bei Rentenbeginn',
  averageGap: 'Ø Rentenlücke in der Rente',
  perMonth: 'pro Monat',

  // Plan form
  planFormTitle: 'Rahmendaten',
  currentAge: 'Aktuelles Alter',
  currentAgeHint: 'Ihr Alter heute.',
  retirementAge: 'Rentenbeginn (Alter)',
  retirementAgeHint: 'Alter, ab dem Renten beginnen und Vermögen entnommen wird.',
  endAge: 'Planungsende (Alter)',
  endAgeHint: 'Alter, bis zu dem das Vermögen reichen soll.',
  targetMonthlyIncome: 'Wunschrente',
  targetMonthlyIncomeHint: 'Monatlich gewünschte Versorgung in heutiger Kaufkraft.',
  inflationRate: 'Inflation',
  inflationRateHint: 'Angenommene jährliche Inflation.',
  scenarioContinue: 'Weiter einzahlen bis Rentenbeginn',
  scenarioStop: 'Beitragsfrei ab heute',
  valueModeReal: 'Heutige Kaufkraft',
  valueModeNominal: 'Nominal',
  years: 'Jahre',

  // Toolbar
  scenarioToolbarLabel: 'Szenario',
  valueModeToolbarLabel: 'Betrachtung',
  /** Short label for the inactive scenario, used in the ghost legend and Summary. */
  scenarioName: (scenario: Scenario) => (scenario === 'stop' ? 'Beitragsfrei' : 'Weiterzahlung'),
  kaufkrafterhalt: 'Kaufkrafterhalt',

  // Export / import
  planIoLabel: 'Plan sichern',
  exportYaml: 'Als YAML exportieren',
  importPlan: 'Plan importieren',
  resetPlan: 'Zurücksetzen',
  resetPlanPrompt: 'Alle Eingaben durch den Beispielplan ersetzen?',
  resetPlanConfirm: 'Ja, zurücksetzen',
  cancel: 'Abbrechen',
  importErrorTitle: 'Import fehlgeschlagen',
  importError: (issue: PlanIssue) => {
    const field = issue.path || 'Datei'
    switch (issue.code) {
      case 'missing':
        return `Pflichtfeld fehlt: ${field}`
      case 'wrong_type':
        return issue.path
          ? `Ungültiger Wert bei: ${field}`
          : 'Die Datei ist kein gültiger Rentenplan (JSON oder YAML).'
      case 'out_of_range':
        return `Wert außerhalb des gültigen Bereichs: ${field}`
      case 'bad_version':
        return 'Diese Datei stammt aus einer nicht unterstützten Version.'
    }
  },

  // Pension list
  pensionsTitle: 'Renten',
  pensionsEmpty: 'Noch keine Rente erfasst.',
  addPension: 'Rente hinzufügen',
  pensionNamePlaceholder: 'Name der Rente',
  monthlyIfStopped: 'Rente bei Beitragsstopp',
  monthlyIfStoppedHint:
    'Heutiger monatlicher Betrag laut Renteninformation, ohne weitere Einzahlungen.',
  monthlyIfContinued: 'Rente bei Weiterzahlung',
  monthlyIfContinuedHint:
    'Heutiger monatlicher Betrag laut Renteninformation bei Fortführung bis Rentenbeginn.',
  annualIncrease: 'Jährliche Steigerung',
  annualIncreaseHint: 'Erwartete jährliche Anpassung der Rente.',
  pensionStartAge: 'Rentenbeginn (falls abweichend)',
  pensionStartAgeHint:
    'Nur ausfüllen, wenn diese Rente nicht mit dem allgemeinen Rentenbeginn startet.',

  // Asset list
  assetListTitle: 'Vermögenswerte',
  assetsEmpty: 'Noch kein Vermögenswert erfasst.',
  addAsset: 'Vermögenswert hinzufügen',
  assetNamePlaceholder: 'Name des Vermögenswerts',
  currentValue: 'Aktueller Wert',
  currentValueHint: 'Heutiger Wert laut Depot- oder Kontoauszug.',
  annualReturn: 'Rendite (Ansparphase)',
  annualReturnHint: 'Erwartete jährliche Rendite bis zum Rentenbeginn.',
  monthlyContribution: 'Monatliche Sparrate',
  monthlyContributionHint: 'Monatlicher Beitrag bis zum Rentenbeginn.',
  annualReturnInRetirement: 'Rendite (Entnahmephase)',
  annualReturnInRetirementHint: 'Erwartete jährliche Rendite während der Entnahme.',

  // Shared entry-card controls
  enabled: 'Aktiv',
  removeEntry: 'Entfernen',
  expandEntry: 'Details anzeigen',
  collapseEntry: 'Details verbergen',
  reorderEntry: (name: string) => `${name} verschieben`,

  disclaimer: 'Modellrechnung ohne Steuern, Kranken- und Pflegeversicherung. Keine Anlageberatung.',
} as const
