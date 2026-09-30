# Spikeward

Open-source bot-spike mitigation on Cloudflare Workers, powered by Jev.

Spikeward watches your zone's traffic once a minute, asks Jev to judge the suspicious
clusters in a spike, and writes short-lived WAF challenges or blocks. Jev never sits in
the request path, so real visitors see zero added latency.

> Status: in development. See [docs/PLAN.md](docs/PLAN.md) for the full design.

## Deploy

One button, into your own Cloudflare account. The form asks for one secret,
`SPIKEWARD_SECRET`; everything else is configured in the app afterward.

<!-- Works once this folder contains the Worker -->
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Biomimic-io/spikeward/tree/main/spikeward)

## License

Apache-2.0
