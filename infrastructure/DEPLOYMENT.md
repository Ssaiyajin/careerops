# Deployment and Optional GCP VM

## Current deployment

Render hosts the always-on FastAPI backend and Vercel hosts the Next.js
frontend. The existing GCP VM can host a second backend/frontend deployment
and can be stopped when it is not needed. Keep production secrets in platform
settings, not in the repository.

## Existing GCP VM

The existing instance is `careerops` in `us-central1-a`, running Debian 13
with a 30 GB standard disk and external IP `35.222.133.240`. Its SSH account is
`deploy`. Do not apply the sample Terraform configuration to this existing
instance; it is only an example for provisioning a separate VM. GCP charges
depend on the project, region, running time, network egress, and current
pricing, so check Billing before running the instance.

1. Configure GitHub Actions secrets/variables named `VM_SSH_KEY`,
   `VM_KNOWN_HOST`, and `VM_EXTERNAL_IP`. Set the address and SSH known-hosts
   entry for the VM's current external IP. The workflow uses the `deploy` SSH
   account and `GITHUB_TOKEN` to authenticate to GHCR.
2. Ensure `/home/deploy/careerops/backend/.env` exists on the VM and contains
   the managed PostgreSQL URL and a unique `JWT_SECRET_KEY`. Do not commit
   these secrets. On first deployment, the workflow clones the repository but
   stops with an error if app settings are missing or placeholders.
3. A successful push to `main` runs backend/frontend checks, initializes and
   plans Terraform, and waits for approval in the `gcp-terraform-apply`
   environment before applying the saved plan. Only after approval does it
   publish images and SSH to the VM to deploy the app and monitoring. The
   frontend is published on port 80, matching the VM's `http-server` network
   tag. The GCP backend's `/metrics` endpoint is reachable by Prometheus only
   over the private Docker network; Prometheus also scrapes the Render backend
   over HTTPS.
4. Grafana and Prometheus bind to loopback on the VM. Access Grafana through
   `ssh -L 3001:127.0.0.1:3001 deploy@35.222.133.240`.

Stop the VM when it is not needed with
`gcloud compute instances stop careerops --zone us-central1-a --project careerops-503307`.
If the external IP is ephemeral, it can change after stopping/starting; update
`VM_EXTERNAL_IP` and `VM_KNOWN_HOST` in GitHub Actions before the next deploy.

The VM limits the backend to 300 MB and the frontend to 200 MB. Prometheus and
Grafana are each limited to 150 MB. The backend metrics port 8000 is not open
in the GCP firewall; Prometheus reaches it over the private Docker network.
Port 80 is plain HTTP; configure HTTPS termination on port 443 before using
the VM as a public production endpoint.

## Terraform plan, approval, and deployment

The single `.github/workflows/pipeline.yml` workflow has branch-specific
deployment paths. On `dev`, tests are followed by Render and Vercel deploys.
On `main`, tests are followed by Terraform init and plan, a required
`gcp-terraform-apply` environment approval, Terraform apply, image publishing,
and SSH deployment to the VM. Pull requests run tests only. The Terraform
import operation is available as a one-time manual operation on `main`.

The plan refuses to continue until the existing VM is present in remote state.
The instance resource has `prevent_destroy`, and the plan job rejects
deletions and replacements. It ignores existing machine type, image, network,
tags, SSH metadata, and startup script so importing the Debian VM does not
attempt to reconfigure it.

### One-time setup

1. Choose a globally unique GCS bucket name and run
   `bash infrastructure/bootstrap-gcp-state.sh` in a shell with `gcloud`
   authenticated to `careerops-503307`, setting `TF_STATE_BUCKET` to that
   name. The script creates a private, uniform-access bucket in `us-central1`
   and enables object versioning. Do not delete this bucket; it stores the
   Terraform state.
2. Configure these repository Actions variables:
   `TF_STATE_BUCKET`, `GCP_WORKLOAD_IDENTITY_PROVIDER`, and
   `GCP_TERRAFORM_SERVICE_ACCOUNT`. Configure Workload Identity Federation
   between GitHub Actions and that GCP service account and grant the account
   the GCP permissions needed to read the VM and manage the Terraform state.
3. Ensure the existing `VM_SSH_KEY` Actions secret is set. It is used only
   to derive the SSH public key Terraform requires during import/plan; the
   imported VM's SSH metadata is ignored.
4. Create a GitHub Actions Environment named `gcp-terraform-apply` and add
   required reviewers. The apply job will wait at this environment gate after
   publishing the plan.
5. Run **CareerOps Pipeline** from the Actions tab on `main` with
   `operation=import-existing-vm`. This imports
   `projects/careerops-503307/zones/us-central1-a/instances/careerops` into
   GCS state. Do not run import again after it succeeds.

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
   | `VERCEL_PROJECT_ID` | Variable | Project ID from Vercel project settings (`prj_...`) |
   | `VERCEL_TEAM_ID` | Variable | Team ID for a team-owned project (`team_...`); omit for a personal project |

After tests pass on `dev`, GitHub Actions first looks for an automatic
deployment of the current commit. If none exists, it explicitly requests a
Render deploy for that SHA and creates a Vercel preview deployment from the
same GitHub commit. This ensures a deployment is requested even when an
automatic branch deploy was skipped because no tracked app files changed. It
then polls each platform every 15 seconds. The Render
step succeeds only when the matching deploy is `live`; the Vercel step
succeeds only when the matching preview is `READY`. A reported failure or a
20-minute timeout fails the corresponding job.

The workflow uses Render's
[Trigger deploy](https://api-docs.render.com/reference/create-deploy) and
[List deploys](https://api-docs.render.com/reference/list-deploys) APIs, plus
Vercel's [Create deployment](https://vercel.com/docs/rest-api/deployments/create-a-new-deployment)
and [List deployments](https://vercel.com/docs/rest-api/deployments/list-deployments)
APIs. Existing automatic deployments are reused when found for the same
commit, avoiding duplicate builds.

### Normal pipeline runs

Every push to `dev` runs backend and frontend tests, then waits for Render and
Vercel to report successful deployments of the pushed commit. Every push to
`main` runs the tests, creates a
Terraform plan, and pauses before apply until an authorized reviewer approves
it in `gcp-terraform-apply`. After applying the saved plan, the pipeline
publishes images and deploys the application to the VM over SSH. The plan
step requires the existing VM to have been imported first.
