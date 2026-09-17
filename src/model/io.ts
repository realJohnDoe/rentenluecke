import { parse as parseYaml, stringify as stringifyYaml } from 'yaml'
import { parsePlan } from './schema'
import type { ParseResult } from './schema'
import type { Plan } from './types'

export function serialisePlan(plan: Plan): string {
  return stringifyYaml(plan)
}

/** Never throws — a YAML syntax error becomes `ok: false` instead. */
export function deserialisePlan(text: string): ParseResult {
  try {
    return parsePlan(parseYaml(text))
  } catch {
    return { ok: false, issues: [{ path: '', code: 'wrong_type' }] }
  }
}

/** Triggers a browser download of the plan. DOM access is confined to this function. */
export function downloadPlan(plan: Plan): void {
  const text = serialisePlan(plan)
  const url = URL.createObjectURL(new Blob([text], { type: 'application/yaml' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `rentenplan-${new Date().toISOString().slice(0, 10)}.yaml`
  link.click()
  URL.revokeObjectURL(url)
}

/** Reads and parses a plan file chosen via a file input. DOM access confined to this function. */
export async function readPlanFile(file: File): Promise<ParseResult> {
  return deserialisePlan(await file.text())
}
