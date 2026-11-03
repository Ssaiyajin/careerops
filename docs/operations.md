# CareerOps operations guide

## Runtime targets and status

The configured production target is the existing GCP VM. Render and Vercel
serve the `dev` path only. The VM's live state and cloud-account safety
settings have not been verified from this repository workspace; consult the
[GCP deployment runbook](../infra/terraform/DEPLOYMENT.md) before operating
the service.

The production workflow builds and publishes immutable backend/frontend
images to GHCR, scans them, then waits for approval in the protected GitHub
`production` Environment before deploying over IAP SSH. It pulls images on
the VM and does not build there. Terraform import/apply are separate
operations and have their own approval Environment.

## Local monitoring of production

Prometheus and Grafana run on the developer laptop, opt-in, not as part of
the normal VM deployment. The local Prometheus configuration uses an IAP SSH
tunnel to scrape the VM's loopback-only `/metrics` endpoint. Follow the
step-by-step [runbook](../infra/terraform/DEPLOYMENT.md#monitoring-and-load-test)
and use the root `.env.example` for the Grafana password variable.
The Prometheus and Grafana web ports bind to `127.0.0.1` and are not published
to the laptop's network interfaces.

The IAP tunnel listener may bind `0.0.0.0` so Docker Desktop containers can
reach it. Keep the laptop firewall closed to inbound TCP/18000, stop the
tunnel when done, and only use this configuration on a trusted host.
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

Before calling a release live, verify the external VM IP, SSH host key,
GitHub environment reviewers and secrets, app health, and actual cloud
billing/firewall/snapshot settings. Those checks require authenticated
provider access and are not established by passing repository tests.
