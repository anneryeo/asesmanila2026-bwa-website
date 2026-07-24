# ☁️ Cloudflare Deployment (Next.js + OpenNext)

The **Build with ASES** site deploys to **Cloudflare Workers** via the OpenNext
adapter (`@opennextjs/cloudflare`). Worker name: **`asesmanila-bwa`**.

---

## Option A — Git-connected build (recommended)

Let Cloudflare build and deploy on every push.

1. Cloudflare Dashboard → **Workers & Pages → Create → Workers → Connect to Git**.
2. Pick this repository and branch (`main`).
3. Build settings:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx wrangler deploy`
   - (Root directory: repo root, where `wrangler.jsonc` lives.)
4. Add **Build variables** (needed at build time — `NEXT_PUBLIC_*` are inlined
   into the bundle during build, so they must be set here, not only at runtime):
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET` (`production`)
   - `NEXT_PUBLIC_SITE_URL` (optional — defaults to
     `https://buildwithases.asesmanila.com`)
5. Add runtime **secrets** (server-only, not `NEXT_PUBLIC_`) under
   Settings → Variables:
   - `SANITY_API_WRITE_TOKEN` — required for the ship-ticket API routes to
     write pledges back to Sanity.

Every push to the connected branch then builds and deploys automatically.

---

## Option B — Deploy from your machine

```bash
npm install
npx wrangler login      # once, to authorize this machine
npm run deploy          # builds with OpenNext, then wrangler deploy
```

Preview the production build locally in the Workers runtime:

```bash
npm run preview
```

For runtime secrets when deploying by hand:

```bash
npx wrangler secret put SANITY_API_WRITE_TOKEN
```

For local dev, keep `NEXT_PUBLIC_*` values in `.env.local` (see `.env.example`).

---

## Scripts

| Script | What it does |
| --- | --- |
| `npm run cf:build` | OpenNext build → `.open-next/` (Worker + assets) |
| `npm run preview` | Build, then serve locally in the Workers runtime |
| `npm run deploy` | Build, then `wrangler deploy` to Cloudflare |
| `npm run cf:typegen` | Regenerate Cloudflare binding types |

Config lives in `wrangler.jsonc` and `open-next.config.ts`. Build artifacts
(`.open-next/`, `.wrangler/`) are git-ignored.

> **Note:** This site and the main `asesmanila` site are separate Workers with
> separate `wrangler.jsonc` names, so they deploy independently.
