# careerops
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

--- 

### Roadmap

Career chat, interview preparation, and personalized learning plans remain future scope. The current AI provider implementation uses Gemini directly; alternative providers and self-hosted inference are not wired up yet.

### Privacy and Account Lifecycle

Resume text and analysis results are retained in the active database while the account exists; there is no automatic expiry for saved analyses. The History page provides account deletion, which removes the account, saved resume analyses, and usage events. Deletion applies to the active database; managed database backups may retain copies according to the database provider's backup-retention policy.

Resume text is sent to Google's Gemini API for recommendations and rewriting. Generating a cover letter also sends resume text and the supplied job description to Gemini. These requests are subject to Google's current service terms and data-handling policies. The upload screen requests consent before analysis.

The browser currently keeps the bearer token in `localStorage` and a JavaScript-readable cookie used only by Next.js middleware for page routing. Logout clears both and the cached resume result; the UI also clears expired JWTs. The backend still validates bearer tokens and expires them after one hour. This is not equivalent to an HttpOnly session: an XSS flaw could read either token copy. Because the deployed frontend and API use separate origins, switching directly to cross-site cookies risks browser cookie restrictions and CSRF. The safer target is a same-origin Next.js backend-for-frontend that sets an HttpOnly, Secure, SameSite cookie, enforces CSRF protection, and proxies API calls; that migration is not implemented yet.


---

## **Infrastructure**

- **Terraform modules**: Infrastructure is defined under `infrastructure/` and split into modules for GCP, AWS, and Azure. GCP is the active deploy target (Always Free `e2-micro`, see `infrastructure/DEPLOYMENT.md`); AWS and Azure are implemented and can be enabled when ready.

- **Quick start (local)**:

```powershell
cd infrastructure
# configure credentials in environment: GOOGLE_APPLICATION_CREDENTIALS for GCP; AWS credentials or `az login` for Azure
# optionally create a `terraform.tfvars` with values for gcp_project, gcp_ssh_public_key, etc.
terraform init
terraform fmt -recursive
terraform validate
terraform plan -var='enable_aws=false' -var='enable_azure=false'
# To enable AWS or Azure set the flags to true and provide provider credentials/keys
```

- **Enabling AWS/Azure**:
	- Set `enable_aws = true` and provide `aws_public_key_path`, `vpc_cidr`, and `public_subnet_cidr` in `terraform.tfvars` to deploy the AWS stack.
	- Set `enable_azure = true` and provide `resource_group_name`, `location`, `admin_ssh_public_key`, `vnet_cidr`, and `subnet_cidr` to deploy the Azure stack.

- **Notes**:
	- GCP credentials are picked up via Application Default Credentials (`GOOGLE_APPLICATION_CREDENTIALS` pointing at a service account key), or `gcloud auth application-default login` locally.
	- AWS credentials are picked up from the environment/profile; ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set, or configure an AWS profile.
	- Azure uses the AzureRM provider; authenticate with `az login` or environment variables.


## Author ✨

**Nihar Sawant** – DevOps & Software Engineer, interested in **automation, cloud, and machine learning**.