# GCP VM production deployment

## Hosting decision and status

Production targets the existing GCP VM: its public HTTP endpoint serves the
Next.js frontend, and the FastAPI backend is private on the Compose network.
Render and Vercel are retained for the `dev` backend and preview. This
workspace cannot verify the VM's current billing, external address, firewall,
snapshot schedule, or live app state.

## Existing VM and deployment flow

The instance is `careerops` in `us-central1-a`; the deploy account is
`deploy`. The external address is ephemeral and must be obtained from GCP each
time it changes. Do not copy an old IP from documentation. CI builds and tests
the app, publishes immutable SHA-tagged backend and frontend images to GHCR,
scans them with Trivy, then waits for approval in the GitHub `production`
Environment. After approval, it uses IAP to SSH with strict host-key checking,
checks `/home/deploy/careerops/.env`, installs Docker/Compose and a persistent
2 GiB swap file if missing, pulls the prebuilt images, restarts the app, prunes
unused images, and checks backend and public frontend health. It never builds
images or starts Prometheus/Grafana on the VM.

The backend has a `/metrics` endpoint. Port 8000 is bound to the VM's loopback
interface only, not the public network. The VM's optional Prometheus stack
reaches `backend:8000` over the shared Compose network. For laptop monitoring,
forward VM loopback port 8000 through IAP SSH to local port 18000; the laptop
Prometheus target is `host.docker.internal:18000` over that encrypted tunnel.
The frontend listens on port 80 over HTTP; configure HTTPS termination before
sending sensitive production traffic.

## Required GCP safety checks

Before deploying, use the GCP Console or authenticated `gcloud` to:

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

## Terraform plan, approval, and deployment

The single `.github/workflows/pipeline.yml` workflow has branch-specific
deployment paths. Pull requests run tests, dependency and secret scans,
infrastructure scans, and kind validation. On `dev`, successful checks are
followed by Render and Vercel Dev deploys. On `main`, successful checks build
and push both SHA-tagged GHCR images and scan them with Trivy. App deployment
then waits for the required reviewer in the `production` Environment. Routine
releases do not plan or apply Terraform.

Terraform import and apply are independent manual workflow operations on
`main`. Apply first creates a saved plan, refuses deletions/replacements, then
waits in `gcp-terraform-apply`. It refuses to continue until the VM has been
imported into remote state. The instance resource has `prevent_destroy` and
ignores existing machine type, image, network, tags, SSH metadata, and startup
script so importing the current VM does not silently reconfigure it.

### One-time setup

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
   the deploy account's SSH key works through IAP. Then use **Actions >
   CareerOps Pipeline > Run workflow** on `main` and choose
   `import-existing-vm` only if you intend to manage this VM with Terraform.
   This imports
   `projects/careerops-503307/zones/us-central1-a/instances/careerops` into
   GCS state. Do not run import again after it succeeds. Terraform changes
   are then invoked by selecting `terraform-apply`; normal image releases do
   not require Terraform state.

6. Keep Render automatic deploy-on-push enabled for the development backend
   service connected to the `dev` branch. In GitHub repository **Settings >
   Secrets and variables > Actions**, add:

   | Name | Type | Value |
   | --- | --- | --- |
   | `RENDER_API_KEY` | Secret | API key created in Render account settings; used to trigger and inspect deployments |
   | `RENDER_DEV_SERVICE_ID` | Variable or secret | ID of the dev backend service (`srv-...`) |

7. Keep Vercel automatic Git deployment enabled for the development preview
   branch, with `BACKEND_API_URL` configured for the dev Render backend. Add
   these to the same GitHub Actions settings:

   | Name | Type | Value |
   | --- | --- | --- |
   | `VERCEL_TOKEN` | Secret | Vercel token with access to this project; used to create and inspect deployments |
   | `VERCEL_PROJECT_ID` | Variable or secret | Project ID from Vercel project settings (`prj_...`) |
   | `VERCEL_TEAM_ID` | Variable or secret | Team ID for a team-owned project (`team_...`); omit for a personal project |

After tests pass on `dev`, GitHub Actions first looks for an automatic
deployment of the current commit. If none exists, it explicitly requests a
Render deploy for that SHA and creates a Vercel preview deployment from the
same GitHub commit, targeting the configured project ID in the request body.
The Vercel request skips framework auto-detection confirmation for CI and
prints the API's error message if the request is rejected. This ensures a
deployment is requested even when an automatic branch deploy was skipped
because no tracked app files changed. It then polls each platform every
15 seconds. The Render step succeeds only when the matching deploy is `live`;
the Vercel step succeeds only when the matching preview is `READY`. A reported
failure or a 20-minute timeout fails the corresponding job.

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
