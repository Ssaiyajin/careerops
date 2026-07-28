variable "enabled" { type = bool }
variable "project" { type = string }
variable "region" { type = string }
variable "zone" { type = string }
variable "name" { type = string }
variable "machine_type" { type = string }
variable "startup_script" { type = string }

provider "google" {
  project = var.project
  region  = var.region
  zone    = var.zone
}

resource "google_compute_instance" "this" {
  count = var.enabled ? 1 : 0

  name         = var.name
  machine_type = var.machine_type

  boot_disk {
    initialize_params {
      image = "ubuntu-os-cloud/ubuntu-2204-lts"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  metadata_startup_script = file(var.startup_script)
}

output "gcp_instance_id" {
  value = google_compute_instance.this.*.id
}

output "gcp_instance_name" {
  value = google_compute_instance.this.*.name
}
