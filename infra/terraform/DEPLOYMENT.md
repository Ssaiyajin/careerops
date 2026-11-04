# Deployment guide and legacy GCP VM runbook

## Hosting decision and status

GCP application deployment is paused. The `main` branch now targets Render
for the API and Vercel for the frontend; `dev` targets their development and
preview services. The GCP Terraform import/apply operations remain separate
manual workflow operations and require an active billing account to access
their GCS remote state. Do not run them while billing is disabled.

Pausing CI does not stop or delete any existing GCP VM, disk, snapshot, or
other resource. Their current state and charges have not been verified from
this workspace. Inspect the Cloud Console and stop/delete resources separately
if you do not want them running or accruing charges.

Render and Vercel plans and usage can also incur charges; confirm their pricing
and limits before enabling the deployments.

## Legacy VM deployment details (historical)

The instance is `careerops` in `us-central1-a`; the deploy account is
`deploy`. The external address is ephemeral and must be obtained from GCP each
time it changes. Do not copy an old IP from documentation. The former CI
deployment built images, published them to GHCR, and used IAP SSH to update
the VM. Those application deployment jobs are now paused and must not be used
while GCP billing is disabled.

The backend has a `/metrics` endpoint. Port 8000 is bound to the VM's loopback
interface only, not the public network. The VM's optional Prometheus stack
reaches `backend:8000` over the shared Compose network. For laptop monitoring,
forward VM loopback port 8000 through IAP SSH to local port 18000; the laptop
Prometheus target is `host.docker.internal:18000` over that encrypted tunnel.
The frontend listens on port 80 over HTTP; configure HTTPS termination before
sending sensitive production traffic.

## Legacy GCP safety checks

Before operating or shutting down the legacy VM, use the GCP Console or
authenticated `gcloud` to:

1. Inspect **Billing > Reports** and confirm actual charges, including VM,
   disk, snapshots, IP, network egress, and any managed database. Stop/delete
   resources only after confirming what they are used for.
2. Identify and disable the daily snapshot schedule attached to this VM's
   disk if it is not required. Confirm retention and backup requirements
   first.
3. Identify and delete the RDP firewall rule if it is not required.
4. Ensure TCP/22 ingress is allowed only from IAP's
   `35.235.240.0/20` range and targeted to the VM. Verify IAP access and the
   `roles/iap.tunnelResourceAccessor` grant before deleting any public SSH
   rule. Do not leave an unrestricted `0.0.0.0/0` SSH rule.
5. Keep the external IP ephemeral; do not reserve a static address just for
   deploys. Update the `VM_HOST` GitHub setting and its known-host entry after
   an IP change.

These are manual checks; they have not been performed from this workspace.

## Free Tier configuration guardrails

The GCP Terraform module rejects configurations outside the Compute Engine
Free Tier's eligible VM shape: `e2-micro` in `us-west1`, `us-central1`, or
`us-east1`, with a `pd-standard` boot disk no larger than 30 GB. It also checks
that the selected zone belongs to the selected region. A Terraform plan with
ineligible values fails before it can be applied.

These are configuration checks, not a usage meter or a spend cap. Google's
Compute Engine allowance is shared across the billing account: eligible
`e2-micro` hours are free only up to the number of hours in the month, and
disk and outbound-transfer limits are pooled too. This module cannot see usage
from other projects or resources, enforce the account-wide 90% threshold, or
stop the VM based on billing data. Check Billing reports and the linked
[Free Tier limits](https://docs.cloud.google.com/free/docs/free-cloud-features#free-tier-usage-limits)
for actual usage and charges; other resources such as snapshots and networking
can also incur charges.

## VM application configuration

Create `/home/deploy/careerops/.env` on the VM from the tracked root
[`.env.example`](../../.env.example). Set `DATABASE_URL` to the Neon
PostgreSQL connection string ending in `?sslmode=require`, `JWT_SECRET_KEY`
to a unique random value of at least 32 characters, and `GEMINI_API_KEY` to
the key used by the app. Set `GRAFANA_ADMIN_PASSWORD` before starting
monitoring. Use `chmod 600 .env`; never commit or paste the real values into
issues or logs. The deploy job fails explicitly if required app values are
missing. Compose passes only app credentials into the backend container; the
Grafana password is provided only to Grafana when that optional stack starts.

The deploy account must have non-interactive `sudo` access for Docker,
systemd, package installation, and swap setup (`sudo -n true` should succeed).
Confirm the current VM OS supports the Docker packages in the workflow before
enabling production deploys.

## GitHub Actions settings

Create a GitHub Actions Environment named `production` with required
reviewers. Keep the separate `gcp-terraform-apply` Environment for explicit
Terraform changes. Configure repository Actions variables:

| Name | Purpose |
| --- | --- |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Federation provider resource |
| `GCP_TERRAFORM_SERVICE_ACCOUNT` | Service account for IAP and Terraform workflows |
| `GCP_PROJECT_ID` | `careerops-503307` |
| `GCP_VM_INSTANCE` | `careerops` |
| `GCP_VM_ZONE` | `us-central1-a` |
| `VM_HOST` | Current ephemeral public IP of the VM |
| `VM_USER` | `deploy` (optional; this is the default) |
| `GHCR_USERNAME` | Owner of the read-only package token (optional) |
| `TF_STATE_BUCKET` | Private GCS bucket for Terraform state |

Configure these Actions secrets, preferably scoped to the `production`
Environment where possible:

| Name | Purpose |
| --- | --- |
| `VM_SSH_KEY` | Private key for the `deploy` account |
| `VM_KNOWN_HOST` | Verified known-hosts entry matching `VM_HOST` |
| `GHCR_READ_TOKEN` | Fine-grained/revocable token with `read:packages` only |

Grant the federated service account IAP tunnel access and the minimum
permissions to inspect the VM; Terraform state permissions are needed only
for Terraform operations. Verify the VM's SSH host-key fingerprint out of
band before saving a known-hosts entry. Do not use `ssh-keyscan` output
without comparing its fingerprint to a trusted value.

For private GHCR packages, the VM stores the `GHCR_READ_TOKEN` credentials in
root's Docker config so Docker Compose can pull on later releases. Revoke and
replace that token if the VM is retired or compromised.

## Paused GCP Terraform operations

The workflow's GCP image publishing and VM deployment jobs are disabled.
Application releases do not build/push GCP images or connect to the VM.
Separate manual import and Terraform apply operations remain in the workflow
for possible future use, but cannot access the remote state while the GCP
project's billing account is closed. Do not enable billing solely to run these
operations unless you have decided to accept any charges.

If GCP Terraform is deliberately resumed later, the prior setup and approval
instructions below describe the required state bucket, credentials, and
review gate. The VM resource has `prevent_destroy`; review any future plan
carefully and do not delete or recreate the state bucket, which may contain
Terraform state.

### Legacy GCP setup reference

Steps 1-5 are legacy GCP setup and are not needed for Render/Vercel application
deployments. Do not execute them while you want GCP billing to remain disabled.
Creating or using GCP resources can incur charges.

1. Choose a globally unique GCS bucket name and run
   `bash infra/terraform/bootstrap-gcp-state.sh` in a shell with `gcloud`
   authenticated to `careerops-503307`, setting `TF_STATE_BUCKET` to that
   name. The script creates a private, uniform-access bucket in `us-central1`
   and enables object versioning. Do not delete this bucket; it stores the
   Terraform state.
2. In **Settings > Secrets and variables > Actions > Variables**, create the
   repository-level GCP variables listed above, including `TF_STATE_BUCKET`,
   `GCP_PROJECT_ID`, `GCP_VM_INSTANCE`, and `GCP_VM_ZONE`.
   `GCP_WORKLOAD_IDENTITY_PROVIDER` must be the full provider resource name
   (`projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/POOL_ID/providers/PROVIDER_ID`);
   `GCP_TERRAFORM_SERVICE_ACCOUNT` must be the service-account email. Configure
   Workload Identity Federation and grant the account IAP tunnel access,
   VM-view permissions, and state-bucket access. Variables used before an
   environment gate must be repository-level.
3. Configure `VM_HOST` with the current public ephemeral IP, `VM_USER` as
   `deploy`, and `VM_KNOWN_HOST` with the verified SSH host key. Add the
   `VM_SSH_KEY` and `GHCR_READ_TOKEN` secrets. Create a fine-grained GitHub
   token limited to `read:packages`; `GITHUB_TOKEN` is not used as the VM's
   persistent registry credential.
4. Create the GitHub Actions Environments `production` and
   `gcp-terraform-apply`. Add required reviewers to both; keep production
   secrets scoped to `production` where possible.
5. Before removing public SSH ingress, verify IAP firewall access and that
   the deploy account's SSH key works through IAP. The manual
   `import-existing-vm` and `terraform-apply` workflow options are for future
   use only; do not run them while billing is disabled.

### Render and Vercel deployment setup

The following steps configure application deployments on managed providers;
they do not require GCP billing. Render and Vercel plans and usage can still
incur charges, so check provider pricing first.

1. Configure separate Render backend services connected to `dev` and `main`.
   Set each service to the appropriate branch, use the backend Dockerfile
   (`backend/Dockerfile`), set `APP_ENV=dev` on the dev service and
   `APP_ENV=main` on the production service, and configure `DATABASE_URL`,
   `JWT_SECRET_KEY`, and `GEMINI_API_KEY` in each Render service environment.
   Set the health check path to `/health` if configuring one. The GitHub workflow explicitly
   triggers the matching commit. In GitHub repository **Settings > Secrets and
   variables > Actions**,
   add:

   | Name | Type | Value |
   | --- | --- | --- |
   | `RENDER_API_KEY` | Secret | API key created in Render account settings; available to both `production` and `development` deployment jobs |
   | `RENDER_DEV_SERVICE_ID` | Variable or secret | ID of the Render backend connected to `dev` (`srv-...`); repository or `development` environment |
   | `RENDER_PROD_SERVICE_ID` | Variable or secret | ID of the Render backend connected to `main` (`srv-...`); repository or `production` environment |

2. Configure the Vercel project to deploy `main` to Production and `dev` as
   Preview. Set `BACKEND_API_URL` in the Vercel Production environment to the
   Render `main` backend URL, and in Preview to the Render `dev` backend URL.
   The Next.js server-side API route uses this value to proxy requests. Add
   these to the same GitHub Actions settings:

   | Name | Type | Value |
   | --- | --- | --- |
   | `VERCEL_TOKEN` | Secret | Vercel token with access to this project; used to create and inspect deployments |
   | `VERCEL_PROJECT_ID` | Variable or secret | Project ID from Vercel project settings (`prj_...`) |
   | `VERCEL_TEAM_ID` | Variable or secret | Team ID for a team-owned project (`team_...`); omit for a personal project |

Create a GitHub Actions Environment named `development` without required
reviewers for the Dev Render deployment job. Put `RENDER_API_KEY` in both the
`development` and `production` environments if it is not configured as a
repository secret. Keep required reviewers on the `production` Environment;
approval there gates both production deployments. Configure the Vercel
credentials as repository-level secrets/variables because the Vercel job
runs after the Render approval without a second environment gate.

After checks pass on `dev`, GitHub Actions deploys the current commit to the
Render development backend and Vercel Preview. On `main`, it waits for
approval in the protected `production` Environment, then deploys to the
Render production backend and Vercel Production. For each platform it reuses
an existing deployment for the same commit when possible; otherwise, it
explicitly triggers/creates the deployment. It polls every 15 seconds and
fails if the matching Render deploy is not `live`, the matching Vercel deploy
is not `READY`, or either operation times out after 20 minutes.

The API credential and app settings are held by Render; do not put production
values in the repository. Confirm your Render plan and usage limits before
deploying because plans and usage can incur charges.

The workflow uses Render's
[Trigger deploy](https://api-docs.render.com/reference/create-deploy) and
[List deploys](https://api-docs.render.com/reference/list-deploys) APIs, plus
Vercel's [Create deployment](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment)
and [List deployments](https://vercel.com/docs/rest-api/deployments/list-deployments)
APIs. Existing automatic deployments are reused when found for the same
commit, avoiding duplicate builds.

### Monitoring and load test

The production deployment leaves Prometheus and Grafana stopped. After the
app is running and the root `.env` contains a unique
`GRAFANA_ADMIN_PASSWORD`, start monitoring from the repository root:

```sh
sudo docker compose --project-name careerops-monitoring \
  --env-file .env -f monitoring/docker-compose.yml up -d
```

The provisioned **CareerOps API Overview** dashboard contains request rate,
p95 latency, 5xx errors, status codes, and in-progress requests. Prometheus
scrapes the live backend over the private Docker network. Forward port 3001
through IAP to open the VM-hosted Grafana locally, record the requested
dashboard demo, and capture screenshots while the dashboard is populated. To
view the VM's Grafana, create this separate local tunnel (stop any workstation
Grafana using port 3001 first):

```sh
gcloud compute ssh deploy@careerops \
  --project=careerops-503307 --zone=us-central1-a --tunnel-through-iap \
  -- -N -L 127.0.0.1:3001:127.0.0.1:3001
```

Run the existing two-minute k6 test from the laptop through the backend IAP
tunnel documented below; it does not expose backend port 8000 publicly. Its
thresholds are p95 below 500 ms, failed requests below 1%, and checks at least
99%:

```sh
k6 run -e BASE_URL=http://127.0.0.1:18000 tests/load/health.js
```

When finished, stop the monitoring stack:

```sh
sudo docker compose --project-name careerops-monitoring \
  --env-file .env -f monitoring/docker-compose.yml down
```

For the laptop dashboard, first authenticate `gcloud` for IAP and start the
SSH tunnel in a terminal:

```sh
gcloud compute ssh deploy@careerops \
  --project=careerops-503307 --zone=us-central1-a --tunnel-through-iap \
  -- -N -L 0.0.0.0:18000:127.0.0.1:8000
```

In another terminal, copy `.env.example` to `.env`, set a unique
`GRAFANA_ADMIN_PASSWORD`, and start only the monitoring services:

```sh
docker compose --profile monitoring up -d prometheus grafana
```

The tunnel binds all host interfaces so Docker Desktop containers can reach
it. Keep inbound TCP/18000 blocked by the laptop firewall and stop the tunnel
when monitoring is done.

The workstation Prometheus config scrapes the production `/metrics` endpoint
through this SSH tunnel. Check **Status > Targets** at
`http://localhost:9090` and open Grafana at `http://localhost:3001`. Capture
screenshots and a two-minute recording after the panels have data; no
recording or screenshots are included until that live check is completed.
Stop monitoring when done with `docker compose --profile monitoring down` and
close the SSH tunnel with Ctrl+C.

Every `dev` push runs checks and waits for Render and Vercel to report success.
Every `main` push runs checks, builds both images, scans them, then pauses for
the production reviewer. After approval, the VM deploy uses the immutable SHA
images over IAP SSH, verifies backend and frontend health, and does not apply
Terraform or start monitoring.
