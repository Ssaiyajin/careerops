# CareerOps architecture and release flow

This document distinguishes the earlier documented hosting design from the
current checked-in configuration. Diagrams describe repository configuration,
not proof that an external service is currently live.

## Earlier documented design: Render and Vercel

The earlier deployment documentation described Render as the always-on API
host and Vercel as the frontend host. GCP was an optional VM deployment.

```mermaid
flowchart LR
    Browser["Browser"]
    Vercel["Vercel<br/>Next.js frontend"]
    Render["Render<br/>FastAPI backend"]
    Neon["Neon PostgreSQL"]
    Gemini["Google Gemini API"]

    Browser --> Vercel
    Vercel -->|"HTTPS API requests"| Render
    Render --> Neon
    Render --> Gemini

    Repo["GitHub repository"] --> Actions["GitHub Actions tests"]
    Actions --> Dev["Dev: Render + Vercel"]
    Actions --> Main["Main: Render + Vercel"]
    Actions -. "optional deployment path" .-> GCP["GCP VM"]
```

This is the earlier documented target, not a claim that those deployments
were live or that the old workflow deployed every service on every branch.

## Current application architecture

The current configured production target is the existing GCP VM. The
Next.js frontend and FastAPI backend communicate over a private Docker
network. The backend uses Neon PostgreSQL and Google Gemini. Monitoring is
an opt-in local stack; Prometheus reaches the VM's loopback-only metrics
endpoint through an IAP SSH tunnel.

```mermaid
flowchart LR
    Browser["Browser"] --> Frontend["Next.js frontend<br/>GCP VM :80"]
    Frontend -->|"private Docker network"| Backend["FastAPI backend<br/>GCP VM :8000"]
    Backend --> Neon["Neon PostgreSQL"]
    Backend --> Gemini["Google Gemini API"]
    Backend --> Metrics["/metrics"]

    subgraph Laptop["Developer laptop (monitoring when needed)"]
        Prometheus["Prometheus"]
        Grafana["Grafana"]
        Prometheus --> Grafana
    end
    Metrics -->|"IAP SSH tunnel"| Prometheus
```

## Current release flow

GitHub Actions runs tests and security/configuration checks, validates
Kubernetes manifests in a temporary kind cluster, and builds the frontend
and backend images. Images are published to GHCR and scanned before the
protected production approval. The approved release is deployed to the GCP
VM over IAP SSH. Kubernetes is validated in CI; it is not the production
runtime.

```mermaid
flowchart LR
    Push["Push or pull request"] --> Checks["Backend + frontend tests<br/>dependency and secret scans<br/>Checkov + Kubernetes lint"]
    Checks --> Kind["Temporary kind deployment<br/>rollout + health/load smoke"]
    Checks --> Build["Build backend + frontend images"]
    Build --> GHCR["GHCR immutable images"]
    GHCR --> Trivy["Trivy image scan"]
    Trivy --> Approval["Protected production approval"]
    Approval --> Deploy["IAP SSH deployment<br/>docker compose pull + up"]
    Deploy --> VM["GCP VM production target"]
    Push --> Dev["Dev preview path<br/>Render API + Vercel"]
```

The GCP VM is the configured production runtime; its live state must be
verified independently. The Terraform AWS and Azure modules are disabled by
default. Terraform infrastructure changes have a separate approval path
from application releases.
