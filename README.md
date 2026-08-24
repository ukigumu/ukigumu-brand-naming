# .com availability checker

Paste names. The page checks whether each matching .com is registered.

## How to run

```
npm i
npm run dev
```

Open the URL Vite prints.

## How to build

```
npm run build
```

`npm run build` writes static files to `dist/`.

## How to put this on Cloudflare Pages

Connect the GitHub repo in the Cloudflare Pages dashboard. Set the build command to `npm run build`. Set the output directory to `dist`. Pages picks up the `functions/` directory automatically. `functions/api/rdap.ts` serves `/api/rdap`.

Do not buy a domain. The `*.pages.dev` URL is enough.

If you are already logged in on a machine, run `npm run build`. Then run `npx wrangler pages deploy dist`.

## API

Checks use Verisign RDAP at `https://rdap.verisign.com/com/v1/domain/{label}.com`.

Availability is the HTTP status:

- 404 available
- 200 taken
- anything else unknown

An empty DNS answer is not available. A failed fetch is unknown, never available.

## CORS proxy

The browser calls `/api/rdap?label={label}`. Locally, Vite middleware fetches Verisign. That is the supported `npm run dev` path. In production, the Pages Function at `functions/api/rdap.ts` fetches Verisign. You do not depend on Verisign sending CORS headers.

The proxy only forwards labels that match `^[a-z0-9]{1,63}$`. Anything else is 400 and is not sent upstream.
