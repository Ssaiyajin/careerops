# Deployment and Future Infrastructure

## Current deployment

Development and production use Render for the FastAPI backend and Vercel for
the Next.js frontend. Render's `RENDER_GIT_BRANCH` selects the dev or main
profile unless `APP_ENV` is explicitly set. Configure separate database URLs,
JWT secrets, and provider keys in each service's environment settings.
Configure Vercel's server-side `BACKEND_API_URL` to the matching HTTPS Render
backend URL for the `dev` branch (Preview) and `main` branch (Production).
Keep production secrets in platform settings, not in the repository.

For local backend work, fill in both profiles in the ignored
`backend/.env`. The current local `dev` or `main` Git branch selects the
matching profile; set `APP_ENV=dev` or `APP_ENV=main` to override it.

GitHub Actions runs tests and frontend quality checks only. Render and Vercel
deployments are managed by those platforms; this repository's workflow does
not publish images, provision cloud resources, or deploy to a VM.

## Future cloud infrastructure

Terraform modules for GCP, AWS, and Azure, along with
[`../docker-compose.prod.yml`](../docker-compose.prod.yml), are retained as
possible future deployment options. They are not used by current production.
The optional Compose configuration enforces 300 MB for the backend and
200 MB for the frontend (500 MB combined, with swap disabled for those
containers); the backend port is internal to the Compose network. GitHub
Actions runs each backend/frontend validation job inside a container capped
at 500 MB. Render and Vercel are separate hosting services;
their memory quotas are controlled independently in each provider's settings,
so there is no shared 500 MB cap across the current hosted deployment.
The previous GCP VM deployment procedure has been retired; review network
exposure, HTTPS termination, secrets management, database backups, and
deployment automation before enabling any self-hosted/cloud VM target.
