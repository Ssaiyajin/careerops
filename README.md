# careerops
Cloud-native AI career intelligence platform built with modern frontend, backend, DevOps, and self-hosted LLM infrastructure.

# CareerOps AI Platform

## 🚀 Overview

CareerOps is a **cloud-native AI career intelligence platform** designed to analyze resumes, match job descriptions, identify skill gaps, and provide AI-powered career guidance.

It is built as a **real-world engineering system**, not a tutorial project, combining:

- AI Engineering
- Backend Development
- Frontend Development
- DevOps
- Cloud Infrastructure
- MLOps
- Self-hosted AI systems

---

## 🎯 Vision

To build a production-grade AI platform that demonstrates:

- End-to-end system design
- Scalable cloud architecture
- Self-hosted LLM infrastructure
- Modern DevOps practices
- Real AI/ML pipelines

---

## ✨ Core Features (Planned)

### 📄 Resume Intelligence
- Resume upload (PDF)
- Text extraction
- Skill detection
- Resume quality scoring
- ATS optimization insights

### 💼 Job Matching Engine
- Job description analysis
- Semantic matching
- Skill gap detection
- Ranking system

### 🤖 AI Career Assistant
- Resume improvement suggestions
- Interview question generation
- Learning roadmap generation
- Career guidance chatbot

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

- Ollama
- Mistral
- Phi-3 Mini

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

## V1

- Resume Upload
- ATS Analysis
- Skill Extraction
- Job Matching
- AI Recommandation

## V2

- Gemini Integration
- OpenRouter Support
- PostgreSQL Database
- User Authentication
- Resume History
- Resume Rewrite
- Cover Letter Generation

## V3

- AI Career Assistant
- Cloud Deployment


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