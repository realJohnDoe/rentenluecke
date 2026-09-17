# rentenluecke

Ein kleiner statischer Rechner für die **Rentenlücke**: Wie viel Geld steht im
Monat zur Verfügung — und wie viel fehlt zur Wunschrente?

Die Seite zeigt zwei übereinanderliegende Diagramme mit gemeinsamer Altersachse:

- **Vermögen** in € — Aufbau bis zum Rentenbeginn, danach Entnahme bis zum
  Planungsende.
- **Monatliche Versorgung** in € pro Monat — lebenslange Renten und Entnahmen aus
  dem Vermögen, gestapelt, darüber die Wunschrente. Die schraffierte Fläche
  dazwischen ist die Rentenlücke.

Modellrechnung ohne Steuern, Kranken- und Pflegeversicherung. Keine Anlageberatung.

## Entwicklung

```bash
npm install
npm run dev        # Entwicklungsserver
npm test           # Tests der Finanzmathematik
npm run typecheck
npm run build      # statischer Build nach dist/
```

## Aufbau

| Pfad | Inhalt |
|---|---|
| `src/model/` | Datenmodell und Finanzmathematik — reine Funktionen, ohne React |
| `src/components/` | Diagramme und UI |
| `src/i18n/de.ts` | sämtliche deutschen Texte |
| `plan.md` | Umsetzungsplan für die noch offenen Ausbaustufen |

Code, Bezeichner und das JSON/YAML-Format sind englisch; nur die Oberfläche ist
deutsch.

## Deployment

`.github/workflows/deploy.yml` prüft jeden Push und Pull Request (Typecheck,
Tests, Build) und veröffentlicht `main` auf GitHub Pages. Einmalig nötig:
Repository → Settings → Pages → Source auf **GitHub Actions** stellen.
