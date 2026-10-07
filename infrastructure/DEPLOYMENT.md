# Deployment and Future Infrastructure

## Current deployment

Development and production use Render for the FastAPI backend and Vercel for
the Next.js frontend. Configure the backend URL as the Vercel server-side
`BACKEND_API_URL` using the HTTPS URL of the matching Render service. Keep
environment secrets in the platform settings, not in the repository.

GitHub Actions runs tests and frontend quality checks only. Render and Vercel
deployments are managed by those platforms; this repository's workflow does
not publish images, provision cloud resources, or deploy to a VM.

## Future cloud infrastructure

Terraform modules for GCP, AWS, and Azure, along with
[`../docker-compose.prod.yml`](../docker-compose.prod.yml), are retained as
possible future deployment options. They are not used by current production.
The previous GCP VM deployment procedure has been retired; review network
exposure, HTTPS termination, secrets management, database backups, and
deployment automation before enabling any self-hosted/cloud VM target.
