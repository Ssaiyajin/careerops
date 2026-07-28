output "gcp_instance_id" {
  value = google_compute_instance.this.*.id
}

output "gcp_instance_name" {
  value = google_compute_instance.this.*.name
}
