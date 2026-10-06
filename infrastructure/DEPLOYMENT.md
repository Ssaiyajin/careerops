# Deploying CareerOps

## Environments

| | Dev | Prod |
|---|---|---|
| Backend host | Render | GCP (`e2-micro`, this doc) |
| Frontend host | Vercel (branch: `dev`) | Vercel (branch: `main`) |
| Database | Neon **`dev`** branch | Neon **`main`**/production branch |
| Git branch | `dev` | `main` |
| Env config | `backend/.env.example` (dev settings) | `backend/.env.example` (prod settings) |

Two separate `JWT_SECRET_KEY` values and two separate Neon branch
connection strings — tokens issued by dev shouldn't validate against
prod, and dev experiments shouldn't be able to touch production data.
Set Vercel's server-side `BACKEND_API_URL` to the matching Render or
production backend URL. The `careerops-ten.vercel.app` dev frontend is
pinned to `https://careerops-api-dev.onrender.com`; all other Vercel
deployments use `BACKEND_API_URL`. In Compose, the frontend uses the private
`http://backend:8000` service URL.

The rest of this doc covers the **GCP/prod** side specifically —
Render's dev setup is just: create the Render service, point it at
`backend/`, and set its variables using the dev-specific values described
at the top of `backend/.env.example`.

## Cloud provider selection

Terraform supports AWS, Azure, and GCP from the same root module. All
three providers are disabled by default. Set `enable_aws`,
`enable_azure`, or `enable_gcp` to `true` to create that provider's
network and VM resources; each can be enabled independently, including
multiple providers in one apply. Disabled providers create no cloud
resources.

Before enabling a provider, supply its normal cloud credentials and
SSH public key. The key settings have deliberate placeholder defaults;
Terraform planning fails if a provider is enabled without replacing
its placeholder. AWS uses `aws_public_key_path`, Azure uses
`azure_admin_ssh_public_key`, and GCP uses `gcp_ssh_public_key` plus
`gcp_project`. The AWS AMI defaults to the latest matching Ubuntu 22.04
image when `aws_ami` is empty.

For example, to provision AWS locally:

```bash
terraform apply \
  -var="enable_aws=true" \
  -var="aws_public_key_path=/home/<user>/.ssh/id_ed25519.pub"
```

To provision Azure, use `-var="enable_azure=true"` and provide
`azure_admin_ssh_public_key`. To provision GCP, use
`-var="enable_gcp=true"` with the project ID and SSH key arguments
shown below. The production GitHub Actions workflow explicitly enables
GCP and leaves AWS/Azure disabled.

---

# Deploying to GCP (prod)

Target: a single **Always Free** `e2-micro` instance (x86, **1GB
RAM**, 30GB pd-standard disk) in a free-tier-eligible region
(`us-west1`, `us-central1`, or `us-east1`) running the frontend and
backend as two Docker containers. Postgres, spaCy, and semantic
matching are all kept off this box on purpose — see "Memory budget"
below.

## Architecture

Everything runs as a single chained pipeline (`.github/workflows/pipeline.yml`)
— one workflow, five sequential jobs. Each stage only runs if the
previous one passed, and Build/Terraform/Deploy are skipped entirely
on PRs or pushes to `dev` (those only run the two test jobs):

```
push to main
     │
     ▼
Backend Tests ──▶ Frontend Tests ──▶ Build & Push Images ──▶ ⏸ manual approval ──▶ Terraform Apply ──▶ Deploy
                                       (pushes to GHCR)         (production-infra      (idempotent)      (SSH in,
                                                                 environment)                            pull, restart)
                                              │
                                              ▼
                              ┌───────────────────────────────────────┐
                    Internet ─┤  e2-micro (1GB RAM)                   │
                       :3000 ─┤  ├─ frontend (Next.js)                │
                       :8000 ─┤  └─ backend  (FastAPI)                │
                              └───────────────────────────────────────┘
                                              │
                                              ▼
                              External managed Postgres
                              (Supabase / Neon)
```

The VM never runs `docker build` — building the backend (spacy/
sentence-transformers wheels, even though both are disabled by
default) or the Next.js production bundle risks an OOM kill on a 1GB
box. Images are built in CI and only pulled on the VM.

## 1. Prerequisites

- GCP account/project with Always Free tier eligibility (new
  accounts also get a separate 90-day/$300 trial credit, but the
  resources below are chosen to stay inside the *permanent* Always
  Free allowance so this keeps working after the trial ends)
- [Terraform](https://developer.hashicorp.com/terraform/install)
- `gcloud` CLI configured (`gcloud init`), or just a service account
  key for CI
- An SSH key pair
- A [Gemini API key](https://aistudio.google.com/apikey)
- A free managed Postgres instance (Supabase or Neon both have free
  tiers) — do not self-host Postgres on this VM, there's no RAM for it
- GitHub Actions + GHCR (Packages) enabled on the repo

## 2. Create a service account for Terraform

```bash
gcloud iam service-accounts create careerops-tf \
  --display-name "CareerOps Terraform"

gcloud projects add-iam-policy-binding <your-project-id> \
  --member="serviceAccount:careerops-tf@<your-project-id>.iam.gserviceaccount.com" \
  --role="roles/compute.admin"

gcloud iam service-accounts keys create careerops-tf-key.json \
  --iam-account=careerops-tf@<your-project-id>.iam.gserviceaccount.com
```

The contents of `careerops-tf-key.json` become the `GCP_SA_KEY` repo
secret in step 3 — keep the file out of git.

## 3. Provision the infrastructure

The repo's `infrastructure/` module already targets `e2-micro` in a
free-tier region by default (`gcp_machine_type` / `gcp_region` in
`variables.tf`). `terraform apply` runs as a stage inside the main
pipeline (`.github/workflows/pipeline.yml`), but it's gated behind a
**manual approval** — the pipeline pauses at that job until someone
approves it, rather than applying automatically on every push.

**One-time setup**: repo Settings → Environments → New environment →
name it `production-infra` → add yourself (or whoever should approve
infra changes) as a required reviewer. After that, every pipeline run
will pause at the Terraform stage and send a notification to review
before it proceeds.

Set these repo secrets before your first push to `main`:
`GCP_SA_KEY` (the raw JSON key content from step 2), `GCP_PROJECT_ID`,
`GCP_REGION` (default `us-central1`), `GCP_ZONE` (default
`us-central1-a`), `GCP_SSH_PUBLIC_KEY`.

Then run the workflow manually (Actions tab → "Provision GCP
Infrastructure" → Run workflow), or locally:

```bash
cd infrastructure
export GOOGLE_APPLICATION_CREDENTIALS=~/careerops-tf-key.json
terraform init
terraform apply \
  -var="enable_gcp=true" \
  -var="gcp_project=<your-project-id>" \
  -var="gcp_region=us-central1" \
  -var="gcp_zone=us-central1-a" \
  -var="gcp_ssh_public_key=$(cat ~/.ssh/id_rsa.pub)"
```

This creates two firewall rules on the default VPC (22 for SSH,
3000/8000 for the app), and the `e2-micro` instance with a 30GB
`pd-standard` boot disk and an ephemeral public IP — all within the
Always Free allowance for a free-tier region.

## 4. What the startup script does on first boot

`modules/gcp/startup.sh` runs automatically (as GCE's
`metadata_startup_script`, root) and:

1. Adds a 2GB swapfile (OOM safety margin, not a performance fix)
2. Installs Docker + the Compose plugin
3. Clones the `main` branch to `/home/ubuntu/careerops`
4. Copies `backend/.env.example` → `backend/.env`
5. Pulls the prebuilt images from GHCR and starts them

**You still need to fill in `backend/.env` for real** — this can't be
baked into cloud-init safely:

```bash
ssh ubuntu@<public-ip>
nano ~/careerops/backend/.env
# set DATABASE_URL, JWT_SECRET_KEY, GEMINI_API_KEY
cd ~/careerops
docker compose -f docker-compose.prod.yml up -d
```

The public IP is also in the Terraform output (`gcp_instance_public_ip`)
after `terraform apply`.

Generate a real `JWT_SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 5. Set up the pipeline

Repo secrets needed (in addition to the GCP ones from step 3):
`GCP_HOST` (the instance's public IP), `GCP_SSH_PRIVATE_KEY`. The
frontend proxies API requests server-side to `http://backend:8000` on
the private Compose network; no public API URL is baked into browser code.

Push to `main` → `.github/workflows/pipeline.yml` runs backend tests
→ frontend tests → builds + pushes both images to GHCR → **pauses for
manual approval** → applies Terraform once approved → SSHes in and
does `git pull && docker compose pull && up -d`. Any stage failing
stops the ones after it. Pushes to `dev` or PRs only run the two test
jobs.

## 6. Memory budget on 1GB

With `ENABLE_SPACY=false` and `ENABLE_SEMANTIC_MATCHING=false` (the
defaults), the backend stays fairly light:

| Container | Approx. RAM |
|---|---|
| backend (FastAPI, PyMuPDF, sklearn, google-genai — no spaCy/torch loaded) | 150-250MB |
| frontend (Next.js, production mode) | 150-250MB |
| OS + Docker daemon | ~150-200MB |

That leaves some headroom, unlike a config with spaCy/semantic
matching enabled — don't turn those on on this box without upgrading
the machine type (e.g. `e2-small`/`e2-medium` via `gcp_machine_type`),
which moves the instance outside the Always Free allowance.
`mem_limit` caps in `docker-compose.prod.yml` mean a runaway container
gets OOM-killed by Docker instead of the whole box going down.

## 7. Tightening security afterwards

- Restrict SSH (port 22) in the `careerops-allow-ssh` firewall rule to
  your own IP instead of `0.0.0.0/0`
- Put a reverse proxy (Caddy/nginx) with TLS in front instead of
  exposing 3000/8000 directly, then drop the `careerops-allow-app`
  firewall rule

## Database schema migrations

The backend image applies `alembic upgrade head` before starting FastAPI. New databases are initialized by the checked-in migrations. The initial revision recognizes the existing `users` and `resume_analysis` tables created by the former `Base.metadata.create_all()` startup, preserves their data, and creates any missing tables and the migration version record. Back up production data before deploying the migration-enabled image. After this baseline, commit schema changes as new Alembic revisions; do not use `create_all()` as a production schema update mechanism.

## Resume and backup retention

The app purges resume analyses older than 90 days once per day (`RESUME_RETENTION_DAYS=90`). Account deletion removes the account's active rows immediately. Managed database backups are controlled by the provider; the release policy is a maximum 30-day backup retention. Configure the Neon/Supabase project to that limit and verify the effective setting before production launch. App-side deletion cannot remove data from an unexpired provider snapshot.

## Staging migration and restore rehearsal

Before production, create an isolated staging database from a recent backup. Keep the source and restore URLs separate and never use the production URL for this rehearsal:

```bash
pg_dump --format=custom --file=careerops-staging.dump "$SOURCE_DATABASE_URL"
pg_restore --clean --if-exists --no-owner --dbname="$STAGING_DATABASE_URL" careerops-staging.dump
psql "$STAGING_DATABASE_URL" -c 'select count(*) from users; select count(*) from resume_analysis;'
DATABASE_URL="$STAGING_DATABASE_URL" alembic upgrade head
```

Compare restored counts with the backup source, then run the backend tests and an authenticated PDF upload/history smoke test against staging. Verify the provider can restore the backup and that its configured expiry is at most 30 days. Do not promote until restore and migration results are recorded. This workspace has no staging database credentials, so the live-provider rehearsal remains an operator release gate.
