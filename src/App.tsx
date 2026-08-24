import { useState } from "react"
import {
  parseNames,
  type AppState,
  type Availability,
  type Check,
} from "./names.ts"
import { checkDomain } from "./rdap.ts"

const DELAY_MS = 300

function exhaustive(value: never): never {
  throw new Error(`unhandled ${String(value)}`)
}

function resultsOf(state: AppState): Check[] {
  switch (state.kind) {
    case "idle":
      return []
    case "checking":
    case "done":
      return state.results
    default:
      return exhaustive(state)
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function formatRow(check: Check): string {
  const line = `${check.original} → ${check.domain}`
  switch (check.status) {
    case "available":
    case "taken":
      return line
    case "unknown":
      return `${line} (unknown)`
    default:
      return exhaustive(check.status)
  }
}

function splitResults(results: Check[]): { available: Check[]; rest: Check[] } {
  const available: Check[] = []
  const rest: Check[] = []
  for (const check of results) {
    const status: Availability = check.status
    switch (status) {
      case "available":
        available.push(check)
        break
      case "taken":
      case "unknown":
        rest.push(check)
        break
      default:
        exhaustive(status)
    }
  }
  return { available, rest }
}

export default function App() {
  const [input, setInput] = useState("")
  const [state, setState] = useState<AppState>({ kind: "idle" })

  const results = resultsOf(state)
  const { available, rest } = splitResults(results)
  const checking = state.kind === "checking"

  async function startCheck(): Promise<void> {
    const queries = parseNames(input)
    if (queries.length === 0) {
      setState({ kind: "done", results: [] })
      return
    }

    setState({
      kind: "checking",
      done: 0,
      total: queries.length,
      results: [],
    })

    const collected: Check[] = []
    for (const [index, query] of queries.entries()) {
      if (index > 0) await sleep(DELAY_MS)
      const status = await checkDomain(query.label)
      collected.push({
        original: query.original,
        label: query.label,
        domain: `${query.label}.com`,
        status,
      })
      setState({
        kind: "checking",
        done: collected.length,
        total: queries.length,
        results: [...collected],
      })
    }
    setState({ kind: "done", results: collected })
  }

  return (
    <main>
      <h1>.com availability</h1>
      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder={"acme, globex\ninitech.com"}
        rows={8}
      />
      <div className="actions">
        <button type="button" disabled={checking} onClick={() => void startCheck()}>
          Check
        </button>
        {state.kind === "checking" ? (
          <p className="progress">
            {state.done} / {state.total}
          </p>
        ) : null}
      </div>
      {results.length > 0 ? (
        <>
          <section>
            <h2>Available</h2>
            <ul>
              {available.map((check) => (
                <li key={check.domain}>{formatRow(check)}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2>Taken / unknown</h2>
            <ul>
              {rest.map((check) => (
                <li
                  key={check.domain}
                  className={check.status === "unknown" ? "unknown" : undefined}
                >
                  {formatRow(check)}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </main>
  )
}
