// GCP Free Tier eligible target: a single e2-micro instance in a free
// region (us-west1 / us-central1 / us-east1), 30GB pd-standard disk,
// default VPC with explicit firewall rules for SSH + the app ports.
// Mirrors the shape of the (now-removed) OCI E2.1.Micro setup.

resource "google_compute_firewall" "ssh_iap" {
  count = var.enabled && var.manage_firewall ? 1 : 0

  name    = "careerops-allow-ssh-iap"
  network = "default"
  project = var.project

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["35.235.240.0/20"]
  target_tags   = var.network_tags
}

resource "google_compute_firewall" "app" {
  #checkov:skip=CKV_GCP_106: This module keeps the existing public TCP/80 ingress; TLS termination is not configured here.
  count = var.enabled && var.manage_firewall ? 1 : 0

  name    = "careerops-allow-app"
  network = "default"
  project = var.project

  allow {
    protocol = "tcp"
    ports    = ["80"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = var.network_tags
}

resource "google_compute_instance" "this" {
  #checkov:skip=CKV_GCP_38: Persistent disks use Google-managed encryption by default; customer-managed key lifecycle is not configured for this VM.
  #checkov:skip=CKV_GCP_40: This VM uses a public IP for direct application ingress; replacing it requires an unconfigured load balancer or ingress.
  count = var.enabled ? 1 : 0

  lifecycle {
    precondition {
      condition     = trimspace(var.project) != ""
      error_message = "Set gcp_project before enabling GCP."
    }

    precondition {
      condition     = trimspace(var.ssh_public_key) != "" && var.ssh_public_key != "REPLACE_WITH_SSH_PUBLIC_KEY"
      error_message = "Set gcp_ssh_public_key to a real SSH public key before enabling GCP."
    }

    precondition {
      condition     = startswith(var.zone, "${var.region}-")
      error_message = "gcp_zone must be a zone within the selected Free Tier region."
    }

    prevent_destroy = true

    ignore_changes = [
      machine_type,
      tags,
      boot_disk[0].initialize_params[0].image,
      metadata["ssh-keys"],
      metadata_startup_script,
      network_interface,
      service_account,
    ]
  }

  name         = var.name
  machine_type = var.machine_type
  zone         = var.zone
  project      = var.project

  tags = var.network_tags

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size_gb
      type  = var.disk_type
    }
  }

  network_interface {
    network = "default"
    access_config {} // ephemeral public IP
  }

  shielded_instance_config {
    enable_secure_boot          = true
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  metadata = {
    block-project-ssh-keys = "TRUE"
    ssh-keys                = "${var.ssh_username}:${var.ssh_public_key}"
  }

  metadata_startup_script = file(var.startup_script)

  depends_on = [
    google_compute_firewall.ssh_iap,
    google_compute_firewall.app,
  ]
}
