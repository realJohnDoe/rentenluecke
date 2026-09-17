import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { parsePlan } from './schema'
import type { ParseResult } from './schema'
import type { Plan } from './types'

export type PlanFormat = 'json' | 'yaml'

export function serialisePlan(plan: Plan, format: PlanFormat): string {
  return format === 'json' ? JSON.stringify(plan, null, 2) : stringifyYaml(plan)
}

/** Tries JSON first, then YAML. Never throws — a syntax error in either becomes `ok: false`. */
export function deserialisePlan(text: string): ParseResult {
  try {
    return parsePlan(JSON.parse(text))
  } catch {
    // Not JSON — fall through to YAML below.
  }
  try {
    return parsePlan(parseYaml(text))
  } catch {
    return { ok: false, issues: [{ path: '', code: 'wrong_type' }] }
  }
}

const MIME_TYPES: Record<PlanFormat, string> = {
  json: 'application/json',
  yaml: 'application/yaml',
}

/** Triggers a browser download of the plan. DOM access is confined to this function. */
export function downloadPlan(plan: Plan, format: PlanFormat): void {
  const text = serialisePlan(plan, format)
  const url = URL.createObjectURL(new Blob([text], { type: MIME_TYPES[format] }))
  const link = document.createElement('a')
  link.href = url
  link.download = `rentenplan-${new Date().toISOString().slice(0, 10)}.${format}`
  link.click()
  URL.revokeObjectURL(url)
}

/** Reads and parses a plan file chosen via a file input. DOM access confined to this function. */
export async function readPlanFile(file: File): Promise<ParseResult> {
  return deserialisePlan(await file.text())
}
