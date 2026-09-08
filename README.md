# ZAVKU — Institutional website / Block 00

Independent ZAVKU website. Existing repository and DigitalOcean app are reused.

## Development

Node 22 or 24. `npm ci`, `npm run build`, `npm run dev`.
Preview is isolated on 127.0.0.1:4387. Production public files are exclusively `site/`.
`npm run typecheck`, `npm run lint`, `npm test` validate implementation.
The existing HTML/CSS architecture is retained; TypeScript checks JavaScript with checkJs. There is no React/Next.js runtime or database.

## Deployment

Existing app: `seahorse-app` / `d0c6c6f4-2ea8-4bb8-be4c-27559f052225`, region `atl`.
Existing static component: `zavku-coming-soon`, source `/site`, domain `zavku.com`.
New approved service: `zavku-contact`, 1 shared CPU, 512 MiB, USD 5/month base price; Dockerfile.contact, `/api` ingress. Existing app settings and domain are preserved in `.do/app.yaml`.
Do not create another app, repo, database, bucket or Droplet. Do not deploy this repository root as static files: it contains server code and project documentation.

## Contact delivery — pending

No corporate destination or SMTP credentials were supplied or found in the existing app-level configuration. Delivery is explicitly disabled. Valid requests return HTTP 409 with an honest user message. Invalid submissions return 422; abuse returns 429. A success response is possible only after an SMTP server accepts the mail.

To activate later, configure approved `CONTACT_TO`, `CONTACT_FROM`, `SMTP_HOST`, `SMTP_PORT` (465 or 587), `SMTP_USER`, `SMTP_PASSWORD` as service runtime settings, and set `CONTACT_DELIVERY_ENABLED=true`. Store secrets encrypted in hosting settings, never in Git. No mailbox or mail-provider account is created.

Before activation, update isolated `site/privacy/index.html` and `site/terms/index.html` for actual responsible entity, address, privacy contact and retention practices. The supplied corporate legal name was conditional and remains unpublished pending confirmation. Current legal copy describes the actual disabled-delivery state.

The contact process does not log or persist message bodies. IP hashes for abuse protection expire after 10 minutes. Rate limiting is in memory and appropriate only for the approved single instance; restarts reset it. App Platform's trusted `do-connecting-ip` header is used only when `TRUST_DO_INGRESS=true`. Do not trust that header on other deployments. Hosting operational logs are separate.

## Approved assets

Hero and footer are WebP optimizations of supplied PNGs, with 960px variants. No regeneration, replacements, or vector tracing was used. Text and wordmark are HTML; Inter is self-hosted with its license. Original PNGs are retained locally under `assets/` and excluded from Git. To regenerate, supply `assets/hero-original.png` and `assets/footer-original.png`, then run `node scripts/optimize.mjs`. Committed web assets make normal builds independent of originals.

Only Block 00 is implemented. No financial services, authentication, trackers, or analytics.
