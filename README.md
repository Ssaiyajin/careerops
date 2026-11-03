# careerops

[![CareerOps Pipeline](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml)

CareerOps is a resume analysis and career-support application built with a Next.js frontend, FastAPI backend, and Google Gemini API.

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

## 🎯 Vision

To build a production-grade AI platform that demonstrates:

- End-to-end system design
- Scalable cloud architecture
- Self-hosted LLM infrastructure
- Modern DevOps practices
- Real AI/ML pipelines

### First-release focus

The first release prioritizes secure resume analysis against the user's actual job description, reliable results and per-account history, and clear privacy controls. The broader AI career assistant remains future scope.

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

### High-Level Flow

```mermaid
flowchart LR
    Browser --> Vercel["Next.js frontend (Vercel)"]
    Vercel --> Render["FastAPI API (Render)"]
    Render --> Database["Managed PostgreSQL"]
    Render --> Gemini["Google Gemini API"]
    Render --> Metrics["/metrics"]
    Metrics --> Prometheus["Prometheus (optional local / VM)"]
    Prometheus --> Grafana["Grafana dashboard"]

    Repo["GitHub repository"] --> Actions["GitHub Actions"]
    Actions --> Checks["Tests, dependency audit, Checkov, kind + k6"]
    Checks --> Images["Backend + frontend images (GHCR)"]
    Images --> Scan["Trivy image scan"]
    Scan --> Approval["Required GCP environment approval"]
    Approval --> VM["Optional GCP VM deploy over SSH"]
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

From the repository root, start the frontend, backend, and local PostgreSQL:

```sh
docker compose up --build -d
```

Prometheus and Grafana are opt-in so they do not consume laptop resources when
you are not inspecting metrics. Start them when needed:

```sh
docker compose --profile monitoring up -d prometheus grafana
```

Open the Grafana dashboard at <http://localhost:3001> (default local login:
`admin` / `admin`) and Prometheus at <http://localhost:9090>. Prometheus
scrapes the local backend and the live Render backend. The provisioned
**CareerOps API Overview** dashboard shows request rate, p95 latency (with a
500 ms threshold), 5xx error rate, status codes, and in-progress requests. The
backend exports metrics at `/metrics`. Set `GRAFANA_ADMIN_PASSWORD` and
`JWT_SECRET_KEY` before starting the stack if you want non-default local
credentials; Compose defaults are for local development only.

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
Create the backend Secret out of band (never commit credentials), then apply:

```sh
kubectl apply -f k8s/namespace.yaml
kubectl -n careerops create secret generic careerops-backend \
  --from-literal=DATABASE_URL='postgresql://USER:PASSWORD@HOST:5432/DB' \
  --from-literal=JWT_SECRET_KEY='REPLACE_WITH_A_RANDOM_SECRET' \
  --from-literal=GEMINI_API_KEY='YOUR_GEMINI_API_KEY'
kubectl apply -k k8s/
```

The CI workflow schema-lints these manifests, builds both images, deploys to a
kind cluster, checks both HTTP services, and runs the same k6 thresholds.
For a cluster that cannot access public GHCR packages, configure an image-pull
secret for the package credentials.

The GCP VM starts the same monitoring services using
`monitoring/docker-compose.yml`. Prometheus scrapes the GCP backend over its
private Docker network and the live Render backend; Grafana and Prometheus bind
to loopback on the VM. To open Grafana, use an SSH tunnel to the VM's port
3001. The VM generates the Grafana admin password in the ignored
`monitoring/.env` file.

--- 

### Roadmap

Career chat, interview preparation, and personalized learning plans remain future scope. The current AI provider implementation uses Gemini directly; alternative providers and self-hosted inference are not wired up yet.

### Privacy and Account Lifecycle

Resume text and analysis results are automatically removed from the active database after 90 days (`RESUME_RETENTION_DAYS`, swept daily). The History page also provides immediate account deletion for the account, saved analyses, and usage events. Managed database backups are outside the application; the release policy is a maximum 30-day backup retention, which must be configured and verified with the database provider.

Resume text is sent to Google's Gemini API for recommendations and rewriting. Generating a cover letter also sends resume text and the supplied job description to Gemini. These requests are subject to Google's current service terms and data-handling policies. The upload screen requests consent before analysis.

The browser uses a same-origin Next.js backend-for-frontend. It stores the bearer token in an HttpOnly, SameSite cookie (Secure in production), forwards it to FastAPI server-side, and checks Origin on mutating requests. JavaScript retains only a non-secret UI hint. The frontend server requires `BACKEND_API_URL` to reach FastAPI; for Render/Vercel deployments, configure it in Vercel to the HTTPS URL of the matching Render backend.


---

## Deployment

The always-on production deployment uses **Render for the FastAPI backend** and **Vercel for the Next.js frontend**. An optional GCP VM deployment is also supported; it can be stopped independently to control costs. Render's `RENDER_GIT_BRANCH` selects the profile when `APP_ENV` is not explicitly set (`dev` selects development and `main` selects production). Configure separate database URLs, JWT secrets, and provider keys in each Render service; never commit actual credentials. In Vercel, configure `BACKEND_API_URL` with the HTTPS Render backend URL assigned to the matching `dev` preview branch or `main` production branch. See [`infrastructure/DEPLOYMENT.md`](./infrastructure/DEPLOYMENT.md) for GCP setup and shutdown instructions.

### Deployment decisions and pipeline

The deployment path evolved from OCI to GCP and then Render: OCI was the
initial VM-based hosting option; GCP became the optional VM target for its fit
with the existing GCP/Terraform setup; Render is now the always-on backend
because a managed service reduces VM and deployment maintenance. The GCP VM
remains an optional self-managed target, and Vercel hosts the frontend.

Pull requests and branch pushes run backend tests, frontend lint/type-check
and tests, dependency audits, a Checkov Terraform scan, Kubernetes manifest
linting, and a kind deploy/smoke/load test. On `dev`, successful checks are
followed by Render and Vercel deployment checks. On `main`, GitHub Actions
plans Terraform, builds both images and pushes SHA-tagged images to GHCR, then
scans them with Trivy. The `gcp-terraform-apply` Environment requires an
authorized reviewer before Terraform apply; the VM SSH deployment is
downstream of that approval and pulls the prebuilt images. The approval
protects infrastructure changes and the live VM release from unattended
deployment. The existing VM must be imported into remote Terraform state
before the first normal `main` deployment. See
[`infrastructure/DEPLOYMENT.md`](./infrastructure/DEPLOYMENT.md) for the
one-time setup and required GitHub secrets/variables.

## Optional GCP deployment

An existing GCP VM can run as an optional deployment while Render remains the
always-on backend. Follow [`infrastructure/DEPLOYMENT.md`](./infrastructure/DEPLOYMENT.md)
to configure GitHub Actions, deploy, monitor, and stop the VM. Terraform
examples are for provisioning a separate VM, not for changing the existing one.


## Author ✨

**Nihar Sawant** – DevOps & Software Engineer, interested in **automation, cloud, and machine learning**.