// GCP Always Free tier target: a single e2-micro instance in a free
// region (us-west1 / us-central1 / us-east1), 30GB pd-standard disk,
// default VPC with explicit firewall rules for SSH + the app ports.
// Mirrors the shape of the (now-removed) OCI E2.1.Micro setup.

resource "google_compute_firewall" "ssh" {
  count = var.enabled ? 1 : 0

  name    = "careerops-allow-ssh"
  network = "default"
  project = var.project

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["careerops"]
}

resource "google_compute_firewall" "app" {
  count = var.enabled ? 1 : 0

  name    = "careerops-allow-app"
  network = "default"
  project = var.project

  allow {
    protocol = "tcp"
    ports    = ["3000", "8000"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["careerops"]
}

resource "google_compute_instance" "this" {
  count = var.enabled ? 1 : 0

  name         = var.name
  machine_type = var.machine_type
  zone         = var.zone
  project      = var.project

  tags = ["careerops"]

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
      size  = var.disk_size_gb
      type  = var.disk_type
    }
  }

  network_interface {
    network = "default"
    access_config {} // ephemeral public IP — Always Free covers this
  }

  metadata = {
    ssh-keys = "${var.ssh_username}:${var.ssh_public_key}"
  }

  metadata_startup_script = file(var.startup_script)

  depends_on = [
    google_compute_firewall.ssh,
    google_compute_firewall.app,
  ]
}
