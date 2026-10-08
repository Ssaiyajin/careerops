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
3. A successful push to `main` runs backend/frontend checks, publishes both
   images, then SSHes to the VM to deploy the app and monitoring. You can also
   run the workflow manually from `main`. The frontend is published on port
   80, matching the VM's `http-server` network tag. The GCP backend's
   `/metrics` endpoint is reachable by Prometheus only over the private Docker
   network; Prometheus also scrapes the Render backend over HTTPS.
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

## Provisioning a separate VM with Terraform

The Terraform example targets a new VM only. Set project and SSH values in an
untracked `infrastructure/terraform.tfvars`, inspect the plan, and review
estimated charges before applying. Do not apply it to manage the existing
`careerops` instance.
