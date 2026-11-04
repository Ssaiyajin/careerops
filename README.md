# careerops

[![CareerOps Pipeline](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/Ssaiyajin/careerops/actions/workflows/pipeline.yml)

CareerOps is a resume analysis and career-support application built with a Next.js frontend, FastAPI backend, and Google Gemini API.

**Deployment target:** `main` deploys the frontend to Vercel and the API to
Render; `dev` deploys to their preview/development services. GCP VM deployment
is paused because the linked billing account is closed. Render and Vercel
plans and usage may still incur charges; confirm their pricing before use.

## CareerOps in action

![Animated illustrative walkthrough of the CareerOps home page, sign-in screen, and scrolling analysis results](./docs/assets/careerops-walkthrough.svg)

*Illustrative UI preview of the home page, login, and results flow; it is not a
recording of a live user session.*

### Grafana dashboard

![User-provided Grafana infrastructure dashboard screenshot](./docs/assets/careerops-grafana-infrastructure.png)

*User-provided Grafana dashboard screenshot. Dashboard data depends on the
monitoring stack and its configured data sources being available.*

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
deployment automation targets Render and Vercel. Self-hosted language models and
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
Vercel frontend, Render API/database flow, optional monitoring, and CI release
path.

![CareerOps dev and production deployment diagram](./docs/assets/careerops-deployment.svg)

### High-Level Flow

```mermaid
flowchart LR
    Browser --> Frontend["Next.js frontend<br/>Vercel"]
    Frontend -->|"server-side HTTPS API proxy"| API["FastAPI backend<br/>Render"]
    API --> Database["Neon PostgreSQL"]
    API --> Gemini["Google Gemini API"]
    API --> Metrics["Prometheus /metrics"]

    subgraph Monitoring["Implemented, opt-in Docker Compose monitoring"]
        Prometheus["Prometheus<br/>15s scrape interval"]
        Grafana["Grafana<br/>provisioned Prometheus datasource"]
        CAdvisor["cAdvisor<br/>container metrics"]
        NodeExporter["node-exporter<br/>Docker host metrics"]
        ApiDashboard["CareerOps API Overview"]
        InfraDashboard["CareerOps Infrastructure"]
        CAdvisor --> Prometheus
        NodeExporter --> Prometheus
        Prometheus --> Grafana
        Grafana --> ApiDashboard
        Grafana --> InfraDashboard
    end
    Metrics -. "IAP SSH tunnel (optional legacy GCP VM)" .-> Prometheus
    API -. "local Compose target" .-> Prometheus

    Repo["GitHub repository"] --> Actions["GitHub Actions"]
    Actions --> Checks["Tests, secret/dependency scans, Checkov, kind + k6"]
    Checks --> Approval["Protected production environment"]
    Approval --> Production["Render API + Vercel production"]
    Actions --> Dev["Render API + Vercel preview"]
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
The metrics endpoint on the legacy GCP VM is loopback-only. If that VM is
still running, authenticate `gcloud` for IAP and keep this SSH tunnel open:

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
docker compose --profile monitoring up -d prometheus grafana cadvisor node-exporter
```

The workstation Prometheus config can scrape legacy VM `/metrics` through the
SSH tunnel, the local backend when the app stack is running, cAdvisor container
metrics, and node-exporter host metrics. Check
[Prometheus targets](http://localhost:9090/targets) for all four scrape jobs.
Open [Grafana](http://localhost:3001) (login `admin`; password is the
`GRAFANA_ADMIN_PASSWORD` value in the root `.env`) and use the dashboards:

- [CareerOps API Overview](http://localhost:3001/d/careerops-overview/careerops-api-overview)
  covers request rate, route/status breakdowns, p50/p95/p99 latency, 5xx rate,
  active requests, and scrape health.
- [CareerOps Infrastructure](http://localhost:3001/d/careerops-infrastructure/careerops-infrastructure)
  covers Docker container CPU, memory, network and out-of-memory events, plus
  host CPU, memory, disk, network, and exporter health.

### Implemented monitoring and dashboard graphs

Prometheus and Grafana are implemented as opt-in Docker Compose services, not
just planned architecture. Prometheus scrapes configured targets every 15
seconds and retains its local time-series data in a Docker volume. Grafana is
provisioned with the Prometheus datasource and both dashboards from the
repository, so the dashboards appear automatically when the monitoring stack
starts. The dashboards contain these graphs and health panels:

| Dashboard | Graphs and panels |
| --- | --- |
| [CareerOps API Overview](http://localhost:3001/d/careerops-overview/careerops-api-overview) | **HTTP requests per second** (`http_requests_total`); **HTTP request latency p50, p95, and p99** (`http_request_duration_seconds_bucket`); **HTTP 5xx error rate** and **requests by status code** (`http_requests_total` labels); **requests in progress** (`http_requests_inprogress`); **requests by route and method** (`http_requests_total` labels); **Prometheus API scrape health** (`up`). |
| [CareerOps Infrastructure](http://localhost:3001/d/careerops-infrastructure/careerops-infrastructure) | **Docker host CPU, memory, filesystem, disk throughput, and network throughput** (`node_cpu_seconds_total`, `node_memory_*`, `node_filesystem_*`, `node_disk_*`, `node_network_*`); **container CPU, working-set memory, memory-limit utilization, and network throughput** (`container_cpu_*`, `container_memory_*`, `container_spec_memory_limit_bytes`, `container_network_*`); **container out-of-memory events** (`container_oom_events_total`); **CPU throttling** (`container_cpu_cfs_*`); **monitoring target health** (`up`). |

The local Prometheus configuration has five jobs: `careerops-production`
(legacy backend `/metrics` over the IAP tunnel), `careerops-local` (backend
`/metrics` on the Compose network), `cadvisor` (container metrics),
`node-exporter` (Docker host metrics), and `prometheus` (Prometheus itself).
The infrastructure dashboard uses cAdvisor and node-exporter metrics; the API
dashboard uses the backend's FastAPI instrumentation. Prometheus's Targets page
shows each job's live scrape status. A configured job can be `DOWN` when its
application, exporter, or required tunnel is not running; this does not mean
the Grafana dashboards or Prometheus integration are unimplemented.

The legacy VM also has an optional Compose monitoring configuration. It
scrapes the backend over the VM's private Compose network; it is separate from
the laptop configuration and is not started by Render/Vercel deployments.
See the [architecture and monitoring flow](./docs/architecture.md)
and [operations guide](./docs/operations.md) for deployment boundaries and
security notes.

The local backend job stays `DOWN` until the application stack is started with
`docker compose up --build -d`. The legacy VM job stays `DOWN` until the SSH
tunnel above is open and the VM is available. On Docker Desktop for Windows,
node-exporter reports the Linux VM used by Docker, not native Windows host
metrics. cAdvisor needs access
to the Docker socket and read-only host filesystem mounts to inspect containers;
keep this local monitoring stack on a trusted machine. The monitoring web ports
bind only to `127.0.0.1`. A separate VM-side Compose configuration exists as
an optional alternative; the normal deployment does not start it.

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

The `main` branch deploys the Next.js frontend to Vercel and the FastAPI
backend to a separate Render production service. The `dev` branch targets the
Render development service and Vercel preview. The frontend proxies API
requests server-side; configure Vercel's `BACKEND_API_URL` to the matching
Render service URL in both Production and Preview environments.

GCP VM image publishing and application deployment are paused in CI. The
separate Terraform import/apply operations are not used for application
releases and require an active GCP billing account. Pausing CI does not stop or
delete any existing GCP resources; inspect the Cloud Console and stop/delete
them separately if you don't want them running or accruing charges.

Render and Vercel may charge or have availability limits depending on their
plans and usage. Check provider pricing before use. The Render backend also
requires `DATABASE_URL`, `JWT_SECRET_KEY`, and `GEMINI_API_KEY`. See
[`infra/terraform/DEPLOYMENT.md`](./infra/terraform/DEPLOYMENT.md) for the
legacy GCP runbook and Terraform guardrails.

Prometheus and Grafana run locally on the developer laptop when needed.
Kubernetes manifests are validated in CI by schema linting and a temporary
kind deployment with health and load smoke tests. Kubernetes is a CI
validation target, not the production runtime.

### Deployment decisions and pipeline

GCP was the previous production target. Its application deployment is paused
because the linked billing account is closed. Render and Vercel are now the
production and development deployment targets.

Pull requests and branch pushes run backend tests, frontend lint/type-check
and tests, dependency and secret audits, a Trivy filesystem scan, a Checkov
Terraform scan, Kubernetes manifest linting, and a kind deploy/smoke/load test.
On `dev`, successful checks deploy to Render and Vercel preview. On `main`,
successful checks deploy the backend to Render and the frontend to Vercel
production, after approval in the protected `production` Environment. No GCP
images are built or deployed by these release jobs. Terraform import and
apply remain separate, explicitly-dispatched infrastructure operations; they
are not required for application deployment and cannot run while GCP billing
is disabled.

Configure `RENDER_API_KEY`, `RENDER_DEV_SERVICE_ID`, `RENDER_PROD_SERVICE_ID`,
`VERCEL_TOKEN`, and `VERCEL_PROJECT_ID` in GitHub Actions settings. Configure
Vercel `BACKEND_API_URL` separately for Production and Preview, pointing to
their matching Render services. Store app credentials in the Render service
environment, never in the repository. See the runbook for details.

### Current state and limitations

The Render/Vercel workflow is configured, but provider credentials, service
settings, plan limits, and live deployment state have not been verified from
this workspace. GCP image publishing and VM deployment are paused; pausing CI
does not stop existing cloud resources. Monitoring is an opt-in local laptop
stack. Kubernetes deployment is validated against kind in CI and is not
evidence of a production cluster deployment. The legacy VM is resource
constrained, and its 2 GB swap file is only an OOM safety margin. The Render
backend must have a Neon connection and Gemini key; app requests that need
rewriting or recommendations depend on Google's API availability and cost.
The ATS score is a heuristic, not a prediction of a specific ATS. Monitoring
and k6 load testing are opt-in and should not be treated as evidence of
production capacity until run against the live service.

### Documentation and delivery status

**Documentation status: complete for the current checked-in configuration.**
See the [`docs/` index](./docs/README.md) for development, architecture, and
operations guides covering the configured Render/Vercel targets, local opt-in
monitoring, and Kubernetes CI validation. This does not claim that a live
deployment, production monitoring session, or production Kubernetes cluster
has been verified.

For the API's interactive OpenAPI page, run the backend and open
`http://localhost:8000/docs`; health and Prometheus metrics are available at
`/health` and `/metrics`.


## Author ✨

**Nihar Sawant** – DevOps & Software Engineer, interested in **automation, cloud, and machine learning**.