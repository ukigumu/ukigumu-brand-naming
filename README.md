# .com availability checker

Paste names. The page checks whether each matching .com is registered.

## How to run

```
npm i
npm run dev
```

Open the URL Vite prints.

## API

Checks use Verisign RDAP at `https://rdap.verisign.com/com/v1/domain/{label}.com`.

Availability is the HTTP status:

- 404 available
- 200 taken
- anything else unknown

An empty DNS answer is not available. A failed fetch is unknown, never available.

## CORS proxy

The browser calls `/api/rdap?label={label}`. Vite middleware fetches Verisign. That is the supported `npm run dev` path, so you do not depend on Verisign sending CORS headers.

The proxy only forwards labels that match `^[a-z0-9]{1,63}$`. Anything else is 400 and is not sent upstream.
