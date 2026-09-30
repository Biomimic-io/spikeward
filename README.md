# Spikeward

Open-source bot-spike mitigation for Cloudflare, powered by Jev.

Spikeward watches your zone's traffic once a minute, asks Jev to judge the suspicious
clusters in a spike, and writes short-lived WAF challenges or blocks. Jev never sits in
the request path, so real visitors see zero added latency.

Website: https://spikeward.habitnetworks.com

> Status: v0.1, early. The design is in [spikeward/docs/PLAN.md](spikeward/docs/PLAN.md).

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Biomimic-io/spikeward/tree/main/spikeward)

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

`DEPLOY_READY` in `web/config.js` controls whether the site shows the Deploy to Cloudflare buttons.

## License

[Apache-2.0](LICENSE)
