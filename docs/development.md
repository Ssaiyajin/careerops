# CareerOps development guide

## Components

- `frontend/`: Next.js, TypeScript, and Jest.
- `backend/`: FastAPI, SQLAlchemy/Alembic, and pytest.
- `infra/terraform/`: optional cloud modules. AWS and Azure are disabled by
  default; GCP is the selected infrastructure target. Terraform operations
  are separate from routine app deployments.
- `k8s/`: manifests used for CI validation in a temporary kind cluster, not
  the production runtime.
- `monitoring/`: opt-in Prometheus and Grafana configuration.

## Local prerequisites

Use Python 3.12 for the backend and Node.js 20 for the frontend, matching
the CI workflow. Docker Compose is optional for containerized local
development and monitoring.

Create a local backend environment and install its dependencies:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

In another terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Copy `backend/.env.example` to the ignored `backend/.env`, replace the
development database URL and development-only secret, and leave the
production values out of your local environment. `APP_ENV=dev` selects the
`DEV_` values; set `APP_ENV=main` only when intentionally testing the
production profile. The root [`.env.example`](../.env.example) is for root
Docker Compose and the VM/monitoring setup, not the backend's profile file.
Never commit either populated `.env`. See the
[deployment runbook](../infra/terraform/DEPLOYMENT.md) for production
credential handling. Local backend docs are available at
`http://localhost:8000/docs` when the service is running.

## Tests and checks

Backend, from the repository root:

```powershell
cd backend
pytest -v -p no:cacheprovider
```

Frontend, from the repository root:

```powershell
cd frontend
npm ci
npm run lint
npm run typecheck
npm test -- --runInBand
```

The GitHub Actions workflow additionally runs dependency and secret audits,
Checkov, Kubernetes schema validation and a kind smoke/load test. Checkov
scans the active GCP Terraform target; the opt-in AWS and Azure modules are
excluded while disabled. The Python dependency audit excludes the spaCy model
wheel because it is hosted on GitHub rather than PyPI; other requirements
remain audited. JWTs use PyJWT with HS256. Patched versions of the audited
backend dependencies are mirrored in the root requirements file. Run the
`deploy` operation in CI for the app workflow; Terraform import/apply are
separate explicitly dispatched operations with their own review gate.

## Pull request expectations

Keep changes scoped, add or update tests for behavior changes, and update the
relevant docs when configuration or deployment behavior changes. Do not
commit `.env` files, API keys, Terraform state, generated exports, or personal
resume data.
