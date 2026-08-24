import { lookupRdap, rdapJson } from "../../src/rdap-lookup.ts"

export async function onRequestGet(ctx: { request: Request }): Promise<Response> {
  const url = new URL(ctx.request.url)
  const label = url.searchParams.get("label") ?? ""
  return rdapJson(await lookupRdap(label))
}
