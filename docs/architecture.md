# CareerOps deployment architecture

Production is designed for the existing GCP VM. Render and Vercel are used
only by the `dev` deployment path. The current live state must be verified
before describing the VM as deployed.

```mermaid
flowchart LR
    Browser["Browser"]
    subgraph Production["GCP VM (ephemeral public IP)"]
        Frontend["Next.js frontend :80"]
        Backend["FastAPI backend :8000"]
        Prometheus["Prometheus (opt-in)"]
        Grafana["Grafana (opt-in)"]
        Frontend -->|"private Docker network"| Backend
        Backend -->|"/metrics"| Prometheus
        Prometheus --> Grafana
    end
    Neon["Neon PostgreSQL"]
    Gemini["Google Gemini API"]
    Browser --> Frontend
    Backend --> Neon
    Backend --> Gemini

    subgraph CI["GitHub Actions"]
        Checks["Backend/frontend tests, dependency and secret scans, Checkov, k8s kind smoke"]
        Build["Build backend + frontend images"]
        Trivy["Trivy image scans"]
        Approval["Required production approval"]
        Deploy["IAP SSH deploy of immutable SHA tags"]
        Checks --> Build --> Trivy --> Approval --> Deploy
    end
    GHCR["GitHub Container Registry"]
    Build --> GHCR
    GHCR --> Deploy
    Deploy --> Production

    Dev["Render API + Vercel preview"]
    Checks --> Dev
```

The deployment sequence reflects the hosting path: OCI was explored first
for a VM deployment, GCP is now selected because there is an existing VM and
Terraform setup, and Render remains the managed development backend. The
production approval separates image validation from the live release; the
separate Terraform approval protects infrastructure changes.
