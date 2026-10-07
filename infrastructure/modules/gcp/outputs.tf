output "gcp_instance_id" {
  value = google_compute_instance.this.*.id
}

output "gcp_instance_name" {
  value = google_compute_instance.this.*.name
}

output "gcp_instance_public_ip" {
  value = [for i in google_compute_instance.this : i.network_interface[0].access_config[0].nat_ip]
}
