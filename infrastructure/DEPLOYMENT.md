# Deploying CareerOps

## Environments

| | Dev | Prod |
|---|---|---|
| Backend host | Render | OCI (`VM.Standard.E2.1.Micro`, this doc) |
| Frontend host | Vercel (branch: `dev`) | Vercel (branch: `main`) |
| Database | Neon **`dev`** branch | Neon **`main`**/production branch |
| Git branch | `dev` | `main` |
| Env file | `backend/.env.dev.example` | `backend/.env.prod.example` |

Two separate `JWT_SECRET_KEY` values and two separate Neon branch
connection strings — tokens issued by dev shouldn't validate against
prod, and dev experiments shouldn't be able to touch production data.
CORS already allows any `*.vercel.app` origin plus localhost (see
`backend/app/main.py`), so the same frontend config works against
either backend.

The rest of this doc covers the **OCI/prod** side specifically —
Render's dev setup is just: create the Render service, point it at
`backend/`, and set the env vars from `backend/.env.dev.example`.

---

# Deploying to OCI (prod)

Target: a single **Always Free** `VM.Standard.E2.1.Micro` instance
(x86 AMD EPYC, 1/8 OCPU, **1GB RAM**) running the frontend and backend
as two Docker containers. Postgres, spaCy, and semantic matching are
all kept off this box on purpose — see "Memory budget" below.

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
                    Internet ─┤  VM.Standard.E2.1.Micro (1GB RAM)     │
                       :3000 ─┤  ├─ frontend (Next.js)                │
                       :8000 ─┤  └─ backend  (FastAPI)                │
                              └───────────────────────────────────────┘
                                              │
                                              ▼
                              External managed Postgres
                              (Supabase / Neon / OCI Autonomous DB)
```

The VM never runs `docker build` — building the backend (spacy/
sentence-transformers wheels, even though both are disabled by
default) or the Next.js production bundle risks an OOM kill on a 1GB
box. Images are built in CI and only pulled on the VM.

## 1. Prerequisites

- OCI account with Always Free tier capacity
- [Terraform](https://developer.hashicorp.com/terraform/install)
- OCI CLI configured (`oci setup config`)
- An SSH key pair
- A [Gemini API key](https://aistudio.google.com/apikey)
- A free managed Postgres instance (Supabase or Neon both have free
  tiers) — do not self-host Postgres on this VM, there's no RAM for it
- GitHub Actions + GHCR (Packages) enabled on the repo

## 2. Find the Ubuntu x86 image OCID

```bash
oci compute image list \
  --compartment-id <your-tenancy-ocid> \
  --operating-system "Canonical Ubuntu" \
  --shape "VM.Standard.E2.1.Micro" \
  --sort-by TIMECREATED \
  --sort-order DESC
```

## 3. Provision the infrastructure

The repo's `infrastructure/` module already targets `E2.1.Micro` by
default (`oci_shape` in `variables.tf`). `terraform apply` runs as a
stage inside the main pipeline (`.github/workflows/pipeline.yml`),
but it's gated behind a **manual approval** — the pipeline pauses at
that job until someone approves it, rather than applying
automatically on every push.

**One-time setup**: repo Settings → Environments → New environment →
name it `production-infra` → add yourself (or whoever should approve
infra changes) as a required reviewer. After that, every pipeline run
will pause at the Terraform stage and send a notification to review
before it proceeds.

Set these repo secrets before your first push to `main`:
`OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`,
`OCI_PRIVATE_KEY` (the raw key content, not a path),
`OCI_COMPARTMENT_OCID`, `OCI_IMAGE_ID` (from step 2),
`OCI_SSH_PUBLIC_KEY`, `OCI_REGION`.

Then run the workflow manually (Actions tab → "Provision OCI
Infrastructure" → Run workflow), or locally:

```bash
cd infrastructure
terraform init
terraform apply \
  -var="tenancy_ocid=..." \
  -var="user_ocid=..." \
  -var="fingerprint=..." \
  -var="private_key_path=~/.oci/key.pem" \
  -var="compartment_ocid=..." \
  -var="image_id=..." \
  -var="ssh_public_key=$(cat ~/.ssh/id_rsa.pub)" \
  -var="region=eu-frankfurt-1"
```

This creates a VCN, an Internet Gateway, a **dedicated** route table
with the `0.0.0.0/0 → IGW` rule attached at creation (not an edited
default one — see the note in `modules/oci/network/main.tf`), a
security list opening 22/80/443/3000/8000, a public subnet, and the
E2.1.Micro instance.

## 4. What cloud-init does on first boot

`modules/oci/compute/cloud-init.sh` runs automatically and:

1. Adds a 2GB swapfile (OOM safety margin, not a performance fix)
2. Installs Docker + the Compose plugin
3. Clones the `dev` branch to `/home/ubuntu/careerops`
4. Copies `backend/.env.prod.example` → `backend/.env`
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

Generate a real `JWT_SECRET_KEY`:
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

## 5. Set up the pipeline

Repo secrets needed (in addition to the OCI ones from step 3):
`PUBLIC_API_URL` (`http://<public-ip>:8000`, baked into the frontend
build since Next.js inlines `NEXT_PUBLIC_*` vars), `OCI_HOST` (the
instance's public IP), `OCI_SSH_PRIVATE_KEY`.

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
the shape (A1.Flex, via `oci_is_flex_shape = true` + `ocpus`/
`memory_in_gbs`). `mem_limit` caps in `docker-compose.prod.yml` mean a
runaway container gets OOM-killed by Docker instead of the whole box
going down.

## 7. Tightening security afterwards

- Restrict SSH (port 22) in the security list to your own IP instead of `0.0.0.0/0`
- Put a reverse proxy (Caddy/nginx) with TLS in front instead of
  exposing 3000/8000 directly, then drop those two security list rules
