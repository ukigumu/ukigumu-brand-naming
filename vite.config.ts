import react from "@vitejs/plugin-react"
import type { IncomingMessage, ServerResponse } from "node:http"
import { defineConfig, type Connect, type PreviewServer, type ViteDevServer } from "vite"
import { lookupRdap, type RdapOutcome } from "./src/rdap-lookup.ts"

function writeStatus(res: ServerResponse, outcome: RdapOutcome): void {
  res.statusCode = outcome.httpStatus
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({ status: outcome.upstreamStatus }))
}

async function handleRdap(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    res.statusCode = 405
    res.end()
    return
  }

  const url = new URL(req.url ?? "", "http://localhost")
  const label = url.searchParams.get("label") ?? ""
  writeStatus(res, await lookupRdap(label))
}

function attachRdap(server: ViteDevServer | PreviewServer): void {
  server.middlewares.use((req, res, next: Connect.NextFunction) => {
    const path = (req.url ?? "").split("?")[0]
    if (path !== "/api/rdap") {
      next()
      return
    }
    void handleRdap(req, res)
  })
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: "rdap-proxy",
      configureServer: attachRdap,
      configurePreviewServer: attachRdap,
    },
  ],
})
