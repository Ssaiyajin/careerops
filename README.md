# careerops

[![CareerOps Pipeline](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml)

CareerOps is a resume analysis and career-support application built with a Next.js frontend, FastAPI backend, and Google Gemini API.

**Production target:** the GCP VM serves both the frontend and API; this
repository configures CI to deploy there. The VM is the production runtime
target; the current live deployment has not been verified from this workspace.

# CareerOps AI Platform

## 🚀 Overview

CareerOps analyzes resumes, compares resume skills with job descriptions, identifies skill gaps, and generates AI-assisted resume content.

It is built as a **real-world engineering system**, not a tutorial project, combining:

- AI Engineering
- Backend Development
- Frontend Development
- DevOps
- Cloud Infrastructure
- External AI service integration

---

## 🎯 Project scope

CareerOps currently combines resume-processing workflows, a Next.js
application, a FastAPI service, and Gemini-backed writing assistance. Its
deployment automation targets a GCP VM. Self-hosted language models and
provider-independent inference are not implemented.

### First-release focus

The first release focuses on resume analysis against a supplied job
description, per-account history, and privacy controls. Interview preparation
and personalized learning plans remain future scope. See
[current state and limitations](#current-state-and-limitations) for important
constraints.

---

### ✨ Features and Status

#### Implemented
- PDF resume upload and text extraction
- Skill and contact extraction
- Resume analysis and job-description skill matching
- Resume rewriting, cover-letter generation, and resume recommendations through Google Gemini
- Resume history and DOCX export

The ATS score is a deterministic heuristic based on extracted skills, contact details, resume length, and a small set of certification keywords. It is not produced by an AI model and does not predict the score from a specific applicant tracking system. Semantic matching is optional and depends on its backend setting.

Gemini requests use the external Google Gemini API with the `gemini-2.5-flash` model and require `GEMINI_API_KEY`. Resume recommendations, rewrites, and cover letters are therefore subject to provider availability, terms, and usage costs.

The provider abstraction in `backend/app/services/ai_provider.py` is currently a stub and is not used by these workflows. Ollama, Mistral, and Phi-3 are not currently supported providers.

#### Planned
- Career guidance chat
- Interview preparation and question generation
- Personalized learning plans and roadmaps
- A working provider abstraction and optional self-hosted model support

---

## 🧱 System Architecture

See the [deployment architecture diagram](./docs/architecture.md) for the
production VM, private API/database flow, optional monitoring, and gated CI
release path.

### High-Level Flow

```mermaid
flowchart LR
    Browser --> VM["GCP VM: Next.js frontend :80"]
    VM --> API["FastAPI backend :8000 (private network)"]
    API --> Database["Neon PostgreSQL"]
    API --> Gemini["Google Gemini API"]
    API --> Metrics["/metrics"]
    Metrics -->|IAP SSH tunnel| Prometheus["Local Prometheus (opt-in)"]
    Prometheus --> Grafana["Grafana dashboard"]
    subgraph Laptop["Developer laptop"]
        Prometheus
        Grafana
    end

    Repo["GitHub repository"] --> Actions["GitHub Actions"]
    Actions --> Checks["Tests, secret/dependency scans, Checkov, kind + k6"]
    Checks --> Images["Backend + frontend images (GHCR)"]
    Images --> Scan["Trivy image scan"]
    Scan --> Approval["Required production environment approval"]
    Approval --> VM
    Actions --> Dev["Render API + Vercel preview (dev only)"]
```

### Tech Stack

#### Frontend

- Next.js
- TypeScript
- TailwindCSS

#### Backend

- FastAPI
- Python
- SpaCy
- PyMuPDF

#### AI

- Google Gemini API (`gemini-2.5-flash`) for resume recommendations, rewriting, and cover letters

---

### Installation

## Backend


```
cd backend 

# Fill in the DEV_ and PROD_ values in the ignored backend/.env file.
# The current dev/main git branch selects the matching profile locally.
# To override it explicitly:
# Windows PowerShell: $env:APP_ENV = "dev"  (or "main")
# macOS/Linux: export APP_ENV=dev           (or main)

python -m venv .venv 

source .venv/bin/activate 

# Windows: 

# .venv\Scripts\activate 

pip install -r requirements.txt 

alembic upgrade head
uvicorn app.main:app --reload

```

## Frontend

```
cd frontend 

npm install 

npm run dev

```

## How to run it

Copy `.env.example` to `.env` and set unique values for `JWT_SECRET_KEY` and
`GRAFANA_ADMIN_PASSWORD` (and `GEMINI_API_KEY` if you want AI generation).
The example contains placeholders only; never commit your populated `.env`.
In PowerShell, use `Copy-Item .env.example .env`; in macOS/Linux, use
`cp .env.example .env`.

From the repository root, start the frontend, backend, and local PostgreSQL:

```sh
docker compose up --build -d
```

Prometheus and Grafana are opt-in so they do not consume laptop resources when
you are not inspecting metrics; their UI ports bind to laptop loopback only.
The backend metrics port on the production VM is loopback-only. For the live
dashboard, authenticate `gcloud` for IAP and
keep this SSH tunnel open:

```powershell
gcloud compute ssh deploy@careerops `
  --project=careerops-503307 --zone=us-central1-a --tunnel-through-iap `
  -- -N -L 0.0.0.0:18000:127.0.0.1:8000
```

The tunnel listener binds all host interfaces so Docker Desktop containers can
reach it. Keep inbound TCP/18000 blocked by the laptop firewall and stop the
tunnel when monitoring is done.

In another terminal, run:

```sh
docker compose --profile monitoring up -d prometheus grafana
```

The workstation Prometheus config scrapes the production `/metrics` endpoint
through the SSH tunnel. After starting the monitoring profile, open
[Prometheus](http://localhost:9090) and check
[its targets](http://localhost:9090/targets) for `careerops-production` with
state `UP`. Open the provisioned
[CareerOps API Overview dashboard](http://localhost:3001/d/careerops-overview/careerops-api-overview)
in Grafana at <http://localhost:3001> (login `admin`; the password is the
`GRAFANA_ADMIN_PASSWORD` value in the root `.env`). Without the SSH tunnel, the
production target will be `DOWN` and the dashboard will not show production
metrics. The dashboard shows request rate, p95 latency (with a 500 ms
threshold), 5xx error rate, status codes, and in-progress requests. The backend
exports metrics at `/metrics`. This is the documented monitoring workflow:
Prometheus and Grafana run locally. A separate VM-side Compose configuration
exists as an optional alternative, but the normal deployment does not start it
and its live operation has not been verified.

Capture screenshots and a two-minute recording once the target is `UP` and the
live panels have data, then stop monitoring with
`docker compose --profile monitoring down` and close the tunnel. Screenshots
and recordings are not checked in.

With k6 installed, run the two-minute load test against the local API after
the app is up:

```sh
k6 run -e BASE_URL=http://localhost:8000 tests/load/health.js
```

It holds 10 virtual users for 90 seconds after ramp-up and fails unless p95
latency is below 500 ms, failed requests stay below 1%, and checks pass at
least 99%. Compare its p95 result with the Grafana latency panel while the test
runs. Stop the whole local stack (including monitoring) when finished:

```sh
docker compose --profile monitoring down
```

### Kubernetes

The manifests in [`k8s/`](./k8s/) deploy the backend and frontend with HTTP
startup, readiness, and liveness probes plus CPU and memory requests/limits.
Set the backend Secret out of band (never commit credentials). The
`k8s/secret.example.yaml` file is a placeholder template and is deliberately
excluded from Kustomize; replace its values locally or use:

```sh
kubectl apply -f k8s/namespace.yaml
kubectl -n careerops create secret generic careerops-backend \
  --from-literal=DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB' \
  --from-literal=JWT_SECRET_KEY='REPLACE_WITH_A_RANDOM_SECRET' \
  --from-literal=GEMINI_API_KEY='YOUR_GEMINI_API_KEY'
kubectl apply -k k8s/
```

The ConfigMap is applied with Kustomize; no frontend Secret is needed because
the frontend consumes no credentials. The CI workflow schema-lints the
manifests, builds and loads both images, deploys to a kind cluster, waits for
rollouts, runs an in-cluster backend health check, checks both HTTP services,
and runs the same k6 thresholds.
For a cluster that cannot access public GHCR packages, configure an image-pull
secret for the package credentials.

On the VM, monitoring is also opt-in: start the production app first, then run
the following from the repository root:

```sh
docker compose --project-name careerops-monitoring \
  --env-file .env -f monitoring/docker-compose.yml up -d
```

Set a strong `GRAFANA_ADMIN_PASSWORD` in the root `.env` on the VM before
starting monitoring. Grafana and Prometheus bind to
loopback; access Grafana through an IAP-backed SSH tunnel. The normal
application deployment does not start monitoring.

The laptop uses the WSL2 resource limits in `%UserProfile%\.wslconfig`
(`memory=5GB`, `processors=2`). Restart WSL with `wsl --shutdown` after changing
that file. Docker Desktop must be installed and running for the compose
commands above.

--- 

### Roadmap

Career chat, interview preparation, and personalized learning plans remain future scope. The current AI provider implementation uses Gemini directly; alternative providers and self-hosted inference are not wired up yet.

### Privacy and Account Lifecycle

Resume text and analysis results are automatically removed from the active database after 90 days (`RESUME_RETENTION_DAYS`, swept daily). The History page also provides immediate account deletion for the account, saved analyses, and usage events. Managed database backups are outside the application; the release policy is a maximum 30-day backup retention, which must be configured and verified with the database provider.

Resume text is sent to Google's Gemini API for recommendations and rewriting. Generating a cover letter also sends resume text and the supplied job description to Gemini. These requests are subject to Google's current service terms and data-handling policies. The upload screen requests consent before analysis.

The browser uses a same-origin Next.js backend-for-frontend. It stores the bearer token in an HttpOnly, SameSite cookie (Secure in production), forwards it to FastAPI server-side, and checks Origin on mutating requests. JavaScript retains only a non-secret UI hint. The frontend server requires `BACKEND_API_URL` to reach FastAPI; the production image uses the private Compose service address, while the Dev Vercel preview uses the Dev Render backend URL.


---

## Deployment

The production target is the **GCP VM**, with the Next.js frontend exposed on
port 80 and FastAPI reachable only on the private Docker network. Render and
Vercel remain the automated Dev backend and preview deployment. The external
IP is ephemeral; retrieve its current value from GCP before configuring the
`VM_HOST` Actions variable or secret. See
[`infra/terraform/DEPLOYMENT.md`](./infra/terraform/DEPLOYMENT.md) for setup,
security prerequisites, operational checks, and shutdown instructions.

Prometheus and Grafana run locally on the developer laptop when needed. Local
Prometheus scrapes production metrics through an IAP SSH tunnel; the normal VM
deployment does not start either service. Kubernetes manifests are validated
in CI by schema linting and a temporary kind deployment with health and load
smoke tests. Kubernetes is a CI validation target, not the production runtime.

### Deployment decisions and pipeline

The hosting path evolved from OCI (initial VM exploration), to GCP (selected
because an existing VM and Terraform setup support a self-managed deployment),
while Render is retained for its existing managed Dev deployment. The current
production design is GCP; Render is not the production target.

Pull requests and branch pushes run backend tests, frontend lint/type-check
and tests, dependency and secret audits, a Trivy filesystem scan, a Checkov
Terraform scan, Kubernetes manifest linting, and a kind deploy/smoke/load test.
On `dev`, successful checks precede the Render and Vercel Dev deployments. On
`main`, successful checks build and push both SHA-tagged images to GHCR, scan
them with Trivy, then pause at the protected `production` Environment before
SSH deployment.
The approved deploy pulls the already-built images, checks app health, and
does not start monitoring. Terraform import and apply are separate,
explicitly-dispatched operations; Terraform apply has its own
`gcp-terraform-apply` reviewer gate. The production approval protects the
live app from unattended releases; the Terraform approval protects
infrastructure changes.

GitHub Actions holds deployment credentials, never the repository: configure
`VM_SSH_KEY`, `VM_KNOWN_HOST`, `GHCR_READ_TOKEN`, and `GCP_WORKLOAD_IDENTITY_PROVIDER`
and `GCP_TERRAFORM_SERVICE_ACCOUNT` as documented in the deployment guide.
Set the current `VM_HOST`, `GCP_PROJECT_ID`, `TF_STATE_BUCKET`, and VM identity
values as Actions variables. On the VM, copy [`.env.example`](./.env.example)
to `/home/deploy/careerops/.env`, fill in the Neon `DATABASE_URL`,
`JWT_SECRET_KEY`, and `GEMINI_API_KEY`, then set mode `600`. Neither `.env`
file belongs in Git. See
[`infra/terraform/DEPLOYMENT.md`](./infra/terraform/DEPLOYMENT.md) for the
one-time setup and manual GCP security checklist.

### Current state and limitations

The application code, workflow, and runbook target the existing GCP VM, but
the current live deployment, billing state, firewall rules, snapshot schedule,
required GitHub secrets, and production approval reviewers have not been
verified from this workspace. Monitoring is an opt-in local laptop stack; its
live connection to the VM has not been verified. Kubernetes deployment is
validated against kind in CI and is not evidence of a production cluster
deployment. The VM must have a private Neon connection and
Gemini key before deployment; app requests that need rewriting or
recommendations depend on Google's API availability and cost. The ATS score
is a heuristic, not a prediction of a specific ATS. The VM is resource
constrained, and the 2 GB swap file is only an OOM safety margin. Monitoring
and k6 load testing are opt-in and should not be treated as evidence of
production capacity until run against the live service.

### Documentation and delivery status

**Documentation status: complete for the current checked-in configuration.**
See the [`docs/` index](./docs/README.md) for development, architecture, and
operations guides covering the configured GCP target, local opt-in monitoring,
and Kubernetes CI validation. This does not claim that a live deployment,
production monitoring session, or production Kubernetes cluster has been
verified.

For the API's interactive OpenAPI page, run the backend and open
`http://localhost:8000/docs`; health and Prometheus metrics are available at
`/health` and `/metrics`.


## Author ✨

**Nihar Sawant** – DevOps & Software Engineer, interested in **automation, cloud, and machine learning**.