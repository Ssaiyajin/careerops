output "gcp_instance_id" {
  value       = module.gcp.gcp_instance_id
  description = "GCE instance ID"
}

output "gcp_instance_name" {
  value       = module.gcp.gcp_instance_name
  description = "GCE instance name"
}

output "gcp_instance_public_ip" {
  value       = module.gcp.gcp_instance_public_ip
  description = "Public (ephemeral) IP address of the GCE instance"
}
