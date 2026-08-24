import react from "@vitejs/plugin-react"
import type { IncomingMessage, ServerResponse } from "node:http"
import { defineConfig, type Connect, type PreviewServer, type ViteDevServer } from "vite"

const VERISIGN_PATH_LABEL = /^[a-z0-9]{1,63}$/
const RDAP_URL = "https://rdap.verisign.com/com/v1/domain"

function writeStatus(res: ServerResponse, httpStatus: number, upstreamStatus: number): void {
  res.statusCode = httpStatus
  res.setHeader("Content-Type", "application/json")
  res.end(JSON.stringify({ status: upstreamStatus }))
}

async function handleRdap(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "GET") {
    res.statusCode = 405
    res.end()
    return
  }

  const url = new URL(req.url ?? "", "http://localhost")
  const label = url.searchParams.get("label") ?? ""
  if (!VERISIGN_PATH_LABEL.test(label)) {
    writeStatus(res, 400, 400)
    return
  }

  try {
    const upstream = await fetch(`${RDAP_URL}/${label}.com`)
    const code = upstream.status
    await upstream.body?.cancel()
    if (code === 200 || code === 404) {
      writeStatus(res, code, code)
      return
    }
    writeStatus(res, 502, code)
  } catch {
    writeStatus(res, 502, 0)
  }
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
