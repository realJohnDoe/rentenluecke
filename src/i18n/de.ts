import type { Scenario } from '../model/types'

/**
 * Every German string the UI shows. Code, data format and identifiers stay
 * English; this file is the single place where the app speaks German.
 */
export const de = {
  appTitle: 'Rentenlücken-Rechner',
  appSubtitle:
    'Was bleibt im Monat übrig — und was fehlt zur Wunschrente?',

  // Chart panels
  assetsPanelTitle: 'Vermögen',
  assetsPanelHint: 'Aufbau bis zum Rentenbeginn, danach Entnahme bis zum Planungsende',
  incomePanelTitle: 'Monatliche Versorgung',
  incomePanelHint: 'Lebenslange Renten und Entnahmen aus dem Vermögen',

  // Axes and reference marks
  axisAge: 'Alter',
  axisEuroTotal: 'Vermögen in €',
  axisEuroPerMonth: '€ pro Monat',
  retirementStart: 'Rentenbeginn',

  // Series
  target: 'Wunschrente',
  gap: 'Rentenlücke',
  totalIncome: 'Gesamtversorgung',
  withdrawalOf: (name: string) => `Entnahme ${name}`,

  // Key figures
  summaryTitle: 'Auf einen Blick',
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

  // Pension list
  pensionsTitle: 'Renten',
  pensionsEmpty: 'Noch keine Rente erfasst.',
  addPension: 'Rente hinzufügen',
  pensionNamePlaceholder: 'Name der Rente',
  monthlyIfStopped: 'Rente bei Beitragsstopp',
  monthlyIfStoppedHint: 'Heutiger monatlicher Betrag laut Renteninformation, ohne weitere Einzahlungen.',
  monthlyIfContinued: 'Rente bei Weiterzahlung',
  monthlyIfContinuedHint: 'Heutiger monatlicher Betrag laut Renteninformation bei Fortführung bis Rentenbeginn.',
  annualIncrease: 'Jährliche Steigerung',
  annualIncreaseHint: 'Erwartete jährliche Anpassung der Rente.',
  pensionStartAge: 'Rentenbeginn (falls abweichend)',
  pensionStartAgeHint: 'Nur ausfüllen, wenn diese Rente nicht mit dem allgemeinen Rentenbeginn startet.',

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

  disclaimer:
    'Modellrechnung ohne Steuern, Kranken- und Pflegeversicherung. Keine Anlageberatung.',
} as const
