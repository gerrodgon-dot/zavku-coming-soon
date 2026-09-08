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
Existing service: `zavku-contact`, 1 shared CPU, 512 MiB, USD 5/month base price; Dockerfile.contact, `/api` ingress. Existing app settings and domain are preserved in `.do/app.yaml`.
Do not create another app, repo, database, bucket or Droplet. Do not deploy this repository root as static files: it contains server code and project documentation.

## Contact

The institutional Contact section links directly to mailto:contact@zavku.com. There is no contact form, message submission API, SMTP dependency or transactional email configuration.

The existing service entry point retains only health responses so infrastructure and deployment definitions remain intact. Its old contact routes return 404. Existing deployed environment settings are not changed by this local source correction and are no longer read by the code.

Privacy and Terms are preserved as explicitly requested. This change has not been deployed.

## Approved assets

Hero and footer are WebP optimizations of supplied PNGs, with 960px variants. No regeneration, replacements, or vector tracing was used. Text and wordmark are HTML; Inter is self-hosted with its license. Original PNGs are retained locally under `assets/` and excluded from Git. To regenerate, supply `assets/hero-original.png` and `assets/footer-original.png`, then run `node scripts/optimize.mjs`. Committed web assets make normal builds independent of originals.

Only Block 00 is implemented. No financial services, authentication, trackers, or analytics.
