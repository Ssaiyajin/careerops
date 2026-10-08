# Deployment and Optional GCP VM

## Current deployment

Render hosts the always-on FastAPI backend and Vercel hosts the Next.js
frontend. An optional GCP VM can host a second backend/frontend deployment and
can be stopped when it is not needed. Render's `RENDER_GIT_BRANCH` selects the
dev or main profile unless `APP_ENV` is explicitly set. Keep production
secrets in platform settings, not in the repository.

## GCP VM

Terraform defaults to an `e2-micro`, 30 GB `pd-standard` disk in an Always Free
eligible US region. Free-tier eligibility depends on the GCP account, region,
current Google Cloud terms, and usage; network egress, snapshots, and other
resources can still incur charges. Review the Terraform plan and billing
before applying it.

1. For a new VM, set `gcp_project`, `gcp_ssh_public_key`, and
   `enable_gcp = true` in an untracked `infrastructure/terraform.tfvars`.
   Configure Google Application Default Credentials, initialize Terraform,
   inspect `terraform plan`, and apply only after reviewing its cost.
2. On first boot, the startup script clones `main`, creates `backend/.env` from
   its example, and generates a Grafana password in `monitoring/.env`.
   Configure the managed PostgreSQL URL and a unique `JWT_SECRET_KEY` in
   `backend/.env`. Do not put either secret in Terraform variables or commit
   them.
3. Configure GitHub Actions secrets/variables named `VM_SSH_KEY`,
   `VM_KNOWN_HOST`, and `VM_EXTERNAL_IP`. The deploy job uses `ubuntu` as the
   SSH user and `GITHUB_TOKEN` to authenticate to GHCR.
4. A successful push to `main` runs backend/frontend checks, publishes both
   images, then SSHes to the VM to pull the latest repository configuration,
   deploy the app, and start monitoring. You can also run the workflow
   manually from the `main` branch to redeploy. Deployment fails explicitly
   if the database URL or JWT secret is still a placeholder. The GCP
   backend's `/metrics` endpoint is reachable by Prometheus over the private
   Docker network; the Render backend is scraped over HTTPS.
5. Grafana and Prometheus bind to loopback on the VM. Access Grafana through
   `ssh -L 3001:127.0.0.1:3001 ubuntu@<INSTANCE_IP>`.

Stop the VM when it is not needed with
`gcloud compute instances stop careerops-vm --zone us-central1-a --project
<PROJECT_ID>`. To remove the VM and its boot disk/resources instead, run
`terraform destroy` after reviewing its plan. Do not destroy Terraform state
or resources outside this stack.

The VM limits the backend to 300 MB and the frontend to 200 MB. Prometheus and
Grafana are each limited to 150 MB. The backend metrics port 8000 is not open
in the GCP firewall; Prometheus reaches it over the private Docker network.
The frontend currently uses port 3000, so configure HTTPS termination before
using the VM as a public production endpoint.
