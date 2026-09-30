# Spikeward

Open-source bot-spike mitigation for Cloudflare, powered by Jev.

Spikeward watches your zone's traffic once a minute, asks Jev to judge the suspicious
clusters in a spike, and writes short-lived WAF challenges or blocks. Jev never sits in
the request path, so real visitors see zero added latency.

Website: https://spikeward.habitnetworks.com

> Status: in development. The design is in [spikeward/docs/PLAN.md](spikeward/docs/PLAN.md).
> The Deploy to Cloudflare button ships with the first release.

## Layout

```
spikeward/   the product: the Worker people deploy into their own Cloudflare account
  docs/PLAN.md   architecture, pipeline, data model, risks
web/         the marketing site (static HTML, no build step)
wrangler.jsonc   serves web/ at spikeward.habitnetworks.com
```

## Marketing site

```sh
npx serve web        # preview locally
npx wrangler deploy  # deploy (from the repo root)
```

When `spikeward/` contains a deployable Worker, set `DEPLOY_READY: true` in
`web/config.js` to show the Deploy to Cloudflare buttons.

## License

[Apache-2.0](LICENSE)
