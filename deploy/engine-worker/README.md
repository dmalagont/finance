# Engine worker (Cloudflare)

Runs `services/engine` as a Cloudflare Container behind a small Worker.

- **Cron** `12 5 * * *` (UTC): POSTs `/run` to the container (sync + ingest + compute).
- **HTTP**: `GET /health` (public), `POST /run[?source=fred]` (needs `Authorization: Bearer <ENGINE_API_TOKEN>`).

## Deploy

Requires Workers Paid and Docker on the machine that deploys (wrangler builds the image).

```bash
npm install
npx wrangler secret put DATABASE_URL
npx wrangler secret put FRED_API_KEY
npx wrangler secret put ENGINE_API_TOKEN
npx wrangler deploy
```

## Status

Typechecked and validated with `wrangler deploy --dry-run` (bindings and container recognised).
**Not deployed, and the Docker image has not been built** in the development sandbox (base
images could not be pulled there). Check the container settings against Cloudflare's current
Containers docs before the first deploy.
