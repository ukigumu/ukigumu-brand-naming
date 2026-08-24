export type Label = string & { readonly __brand: "Label" }

export type Query = {
  original: string
  label: Label
}

export type Availability = "available" | "taken" | "unknown"

export type Check = Query & {
  domain: string
  status: Availability
}

export type AppState =
  | { kind: "idle" }
  | { kind: "checking"; done: number; total: number; results: Check[] }
  | { kind: "done"; results: Check[] }

function toLabel(value: string): Label {
  return value as Label
}

export function normalizeLabel(token: string): Label | null {
  const strippedCom = token.toLowerCase().endsWith(".com")
    ? token.slice(0, -".com".length)
    : token

  for (let i = 0; i < strippedCom.length; i += 1) {
    if (strippedCom.charCodeAt(i) > 127) return null
  }

  const label = strippedCom.toLowerCase().replace(/[^a-z0-9]/g, "")
  if (label === "" || label.length > 63) return null
  return toLabel(label)
}

export function parseNames(input: string): Query[] {
  const seenRaw = new Set<string>()
  const seenLabel = new Set<string>()
  const queries: Query[] = []

  for (const part of input.split(/[,\n\r]+/)) {
    const original = part.trim()
    if (original === "") continue

    const rawKey = original.toLowerCase()
    if (seenRaw.has(rawKey)) continue
    seenRaw.add(rawKey)

    const label = normalizeLabel(original)
    if (label === null) continue
    if (seenLabel.has(label)) continue
    seenLabel.add(label)

    queries.push({ original, label })
  }

  return queries
}
