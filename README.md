# Ukigumu brand naming

Paste names. The page checks whether each matching `.com` is registered, using Verisign RDAP.

No AI. One page. You type a list, it normalizes each token to a DNS label, then asks Verisign if `{label}.com` exists.

**Live test:** [https://ukigumu-brand-naming.pages.dev](https://ukigumu-brand-naming.pages.dev)

## How to run

This repo uses pnpm only. You need Node 20 or newer and [pnpm](https://pnpm.io/).

```
pnpm install
pnpm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`).

## How to build

```
pnpm run build
```

`pnpm run build` writes static files to `dist/`.

## Cloudflare Pages

Connect this GitHub repo in the Cloudflare Pages dashboard.

- Framework preset: none
- Build command: `pnpm run build`
- Output directory: `dist`
- Package manager: pnpm

Pages picks up the `functions/` directory automatically. `functions/api/rdap.ts` serves `/api/rdap`.

Do not buy a domain. The `*.pages.dev` URL is enough.

If `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` are already in the environment, deploy from a machine:

```
pnpm run deploy
```

That runs `pnpm run build` and then `wrangler pages deploy dist --project-name ukigumu-brand-naming --branch main`. Do not paste tokens into the repo or into chat.

## API

Checks use Verisign RDAP at `https://rdap.verisign.com/com/v1/domain/{label}.com`.

Availability is the HTTP status:

- 404 available
- 200 taken
- anything else unknown

An empty DNS answer is not available. A failed fetch is unknown, never available.

## CORS proxy

The browser calls `/api/rdap?label={label}`. Locally, Vite middleware fetches Verisign. That is the supported `pnpm run dev` path. In production, the Pages Function at `functions/api/rdap.ts` fetches Verisign. You do not depend on Verisign sending CORS headers.

The proxy only forwards labels that match `^[a-z0-9]{1,63}$`. Anything else is 400 and is not sent upstream.
