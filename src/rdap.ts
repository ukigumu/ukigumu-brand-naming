import type { Availability, Label } from "./names.ts"

function readStatus(data: unknown): number | null {
  if (typeof data !== "object" || data === null) return null
  if (!("status" in data)) return null
  const status = data.status
  if (typeof status !== "number" || !Number.isFinite(status)) return null
  return status
}

export async function checkDomain(label: Label): Promise<Availability> {
  try {
    const response = await fetch(`/api/rdap?label=${encodeURIComponent(label)}`)
    const body: unknown = await response.json()
    const reported = readStatus(body)
    if (reported === null) return "unknown"
    if (response.status === 404 && reported === 404) return "available"
    if (response.status === 200 && reported === 200) return "taken"
    return "unknown"
  } catch {
    return "unknown"
  }
}
