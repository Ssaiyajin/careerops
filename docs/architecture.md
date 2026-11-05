# CareerOps architecture and release flow

Diagrams describe repository configuration, not proof that an external service
is currently live.

## Current application architecture

The `main` branch deploys the Next.js frontend to Vercel and the FastAPI
backend to Render. The `dev` branch targets development/preview services.
Vercel's server-side API route proxies requests to the matching Render backend
over HTTPS. The backend uses Neon PostgreSQL and Google Gemini. GCP VM
application deployment is paused because the linked billing account is closed;
pausing CI does not stop or delete existing GCP resources.

```mermaid
flowchart LR
    Browser["Browser"]
    Vercel["Vercel<br/>Next.js frontend"]
    Render["Render<br/>FastAPI backend"]
    Neon["Neon PostgreSQL"]
    Gemini["Google Gemini API"]

    Browser --> Vercel
    Vercel -->|"server-side HTTPS API proxy"| Render
    Render --> Neon
    Render --> Gemini

    Repo["GitHub repository"] --> Actions["GitHub Actions tests"]
    Actions --> Dev["dev: Render + Vercel preview"]
    Actions --> Main["main: Render + Vercel production"]
```

## Optional legacy VM monitoring

Monitoring is implemented as opt-in Docker Compose stacks. The laptop
Prometheus can monitor a legacy VM through an IAP SSH tunnel only if that VM
remains available; this is not part of the Render/Vercel release path.
Grafana is provisioned with Prometheus and the two checked-in CareerOps
dashboards.

```mermaid
flowchart LR
    Browser["Browser"] --> Frontend["Legacy Next.js frontend<br/>GCP VM :80"]
    Frontend -->|"private Docker network"| Backend["Legacy FastAPI backend<br/>GCP VM :8000"]
    Backend --> Neon["Neon PostgreSQL"]
    Backend --> Gemini["Google Gemini API"]
    Backend --> Metrics["FastAPI /metrics"]

    subgraph Laptop["Opt-in laptop monitoring Compose profile"]
        LocalPrometheus["Prometheus<br/>15s scrape interval"]
        Grafana["Grafana<br/>provisioned Prometheus datasource"]
        CAdvisor["cAdvisor<br/>Docker container metrics"]
        NodeExporter["node-exporter<br/>Docker host metrics"]
        ApiDashboard["CareerOps API Overview<br/>rate, latency, errors, routes, health"]
        InfraDashboard["CareerOps Infrastructure<br/>host/container resource graphs"]
        CAdvisor --> LocalPrometheus
        NodeExporter --> LocalPrometheus
        LocalPrometheus --> Grafana
        Grafana --> ApiDashboard
        Grafana --> InfraDashboard
    end
    Backend -. "local Compose /metrics target" .-> LocalPrometheus
    Metrics -->|"IAP SSH tunnel to VM loopback"| LocalPrometheus

    subgraph VMMonitoring["Optional VM monitoring Compose stack"]
        VmPrometheus["Prometheus"]
        VmGrafana["Grafana"]
        VmPrometheus --> VmGrafana
    end
    Backend -. "private Compose network /metrics" .-> VmPrometheus
```

### Implemented observability components

The monitoring services and dashboard definitions are checked into the
repository and provisioned at startup:

- Root `docker-compose.yml` provides the opt-in `monitoring` profile with
  Prometheus, Grafana, cAdvisor, and node-exporter. Prometheus and Grafana web
  ports are bound to `127.0.0.1`.
- `monitoring/prometheus/prometheus.yml` configures the local scrape jobs for
  the local API, production API tunnel, cAdvisor, node-exporter, and
  Prometheus itself, with a 15-second scrape interval.
- `docker/grafana/provisioning/` provisions the Prometheus datasource and
  dashboard provider. The provisioned dashboards are
  [CareerOps API Overview](../docker/grafana/dashboards/careerops-overview.json)
  (**HTTP requests per second**, **p50/p95/p99 request latency**, **5xx error
  rate**, **requests by status**, **requests by route and method**,
  **in-progress requests**, and **API target health**) and
  [CareerOps Infrastructure](../docker/grafana/dashboards/careerops-infrastructure.json)
  (**host CPU, memory, filesystem, disk and network**; **per-container CPU,
  working-set memory, memory-limit utilization and network**; **out-of-memory
  events**, **CPU throttling**, and **target health**). The graphs use
  FastAPI instrumentation metrics (`http_requests_total`,
  `http_request_duration_seconds_bucket`, `http_requests_inprogress`),
  node-exporter metrics (`node_*`), cAdvisor metrics (`container_*`), and
  Prometheus's `up` series for scrape status.
- `monitoring/docker-compose.yml` and
  `monitoring/prometheus/prometheus.production.yml` provide a separate
  optional VM-side stack that scrapes the backend over the private Compose
  network. The standard application deployment does not start this stack.

The laptop dashboards are available at [Grafana](http://localhost:3001) and
Prometheus targets at [localhost:9090/targets](http://localhost:9090/targets)
when the local monitoring profile is running. A dashboard being provisioned
does not imply that every target is online: the local API requires the local
application stack, and the legacy VM API requires the IAP tunnel. On Windows
with Docker Desktop, node-exporter reports the Docker Linux VM, not native
Windows host performance counters. See the root [README](../README.md) for
startup instructions and dashboard links.

## Current release flow

GitHub Actions runs tests and security/configuration checks, validates
Kubernetes manifests in a temporary kind cluster, and then pauses `main`
deployments at the protected production environment before triggering Render
and Vercel. The GCP image publishing and VM deployment jobs are paused.
Kubernetes is validated in CI; it is not the production runtime.

```mermaid
flowchart LR
    Push["Push or pull request"] --> Checks["Backend + frontend tests<br/>dependency and secret scans<br/>Checkov + Kubernetes lint"]
    Checks --> Kind["Temporary kind deployment<br/>rollout + health/load smoke"]
    Checks --> Approval["Protected production approval (main)"]
    Approval --> Prod["Render API + Vercel production"]
    Push --> Dev["dev: Render API + Vercel preview"]
```

The Render/Vercel service configuration and live status must be verified
independently. Terraform AWS and Azure modules remain disabled by default.
GCP Terraform import/apply are separate manual operations, not part of
application releases, and require an active billing account for their remote
state backend.
