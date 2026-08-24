export type RdapOutcome = {
  httpStatus: number
  upstreamStatus: number
}

const VERISIGN_PATH_LABEL = /^[a-z0-9]{1,63}$/
const RDAP_URL = "https://rdap.verisign.com/com/v1/domain"

export async function lookupRdap(label: string): Promise<RdapOutcome> {
  if (!VERISIGN_PATH_LABEL.test(label)) {
    return { httpStatus: 400, upstreamStatus: 400 }
  }

  try {
    const upstream = await fetch(`${RDAP_URL}/${label}.com`)
    const code = upstream.status
    await upstream.body?.cancel()
    if (code === 200 || code === 404) {
      return { httpStatus: code, upstreamStatus: code }
    }
    return { httpStatus: 502, upstreamStatus: code }
  } catch {
    return { httpStatus: 502, upstreamStatus: 0 }
  }
}

export function rdapJson(outcome: RdapOutcome): Response {
  return new Response(JSON.stringify({ status: outcome.upstreamStatus }), {
    status: outcome.httpStatus,
    headers: { "Content-Type": "application/json" },
  })
}
