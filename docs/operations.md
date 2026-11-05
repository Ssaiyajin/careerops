# CareerOps operations guide

## Runtime targets and status

The deployment target is Render for the API and Vercel for the frontend.
`dev` uses the development/preview services; `main` uses separate Render and
Vercel production targets. Provider credentials, service settings, plans, and
live availability have not been verified from this workspace. Check both
providers' pricing and limits before enabling deployments.

After CI checks, `main` waits for approval in the protected GitHub
`production` Environment, then triggers the Render backend and Vercel
production frontend deployments. GCP image publishing and VM deployment are
paused. This does not stop or delete existing GCP resources. Terraform
import/apply remain separate manual operations and require active GCP billing
for remote state access.

## Local monitoring of a legacy VM

Prometheus and Grafana run on the developer laptop, opt-in. The local
Prometheus configuration can use an IAP SSH tunnel to scrape a legacy VM's
loopback-only `/metrics` endpoint, but this is unrelated to Render/Vercel
deployments. Follow the step-by-step
[runbook](../infra/terraform/DEPLOYMENT.md#monitoring-and-load-test) and use
the root `.env.example` for the Grafana password variable.
The Prometheus and Grafana web ports bind to `127.0.0.1` and are not published
to the laptop's network interfaces.

If using that legacy tunnel, its listener may bind `0.0.0.0` so Docker
Desktop containers can reach it. Keep the laptop firewall closed to inbound
TCP/18000, stop the tunnel when done, and only use this configuration on a
trusted host.
Dashboards and k6 thresholds are test/observability tools, not evidence of
live availability or production capacity until exercised against the live
service.

## Kubernetes CI validation

The `k8s/` manifests define backend/frontend workloads, configuration,
probes, and resource requests/limits. CI schema-checks them, builds and loads
images in a temporary kind cluster, waits for rollout, checks the services,
and runs health/load smoke tests. This is CI validation; no production
Kubernetes cluster deployment is configured.

## Operational verification checklist

Before calling a release live, verify the Render service IDs and branch
settings, Vercel project and `BACKEND_API_URL` environments, GitHub production
reviewers and credentials, app health, and provider plan/usage billing. Those
checks require authenticated provider access and are not established by
passing repository tests.
