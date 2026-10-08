#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:=careerops-503307}"
: "${TF_STATE_BUCKET:?Set TF_STATE_BUCKET to a globally unique GCS bucket name}"

if ! [[ "$TF_STATE_BUCKET" =~ ^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$ ]]; then
  echo "TF_STATE_BUCKET must be a valid GCS bucket name." >&2
  exit 1
fi

if gcloud storage buckets describe "gs://$TF_STATE_BUCKET" >/dev/null 2>&1; then
  echo "Bucket gs://$TF_STATE_BUCKET already exists; verify that you own it before continuing." >&2
  exit 1
fi

gcloud storage buckets create "gs://$TF_STATE_BUCKET" \
  --project="$GCP_PROJECT_ID" \
  --location=us-central1 \
  --uniform-bucket-level-access \
  --public-access-prevention

gcloud storage buckets update "gs://$TF_STATE_BUCKET" --versioning
echo "Created private, versioned Terraform state bucket gs://$TF_STATE_BUCKET."
