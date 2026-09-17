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

  // Plan facts shown while the inputs are not editable yet
  currentAge: 'Aktuelles Alter',
  retirementAge: 'Rentenbeginn (Alter)',
  endAge: 'Planungsende (Alter)',
  inflationRate: 'Inflation',
  scenarioContinue: 'Weiter einzahlen bis Rentenbeginn',
  scenarioStop: 'Beitragsfrei ab heute',
  valueModeReal: 'Heutige Kaufkraft',
  valueModeNominal: 'Nominal',

  disclaimer:
    'Modellrechnung ohne Steuern, Kranken- und Pflegeversicherung. Keine Anlageberatung.',
} as const
