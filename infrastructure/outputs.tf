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

output "aws_instance_id" {
  value       = module.aws_placeholder.aws_instance_id
  description = "EC2 instance ID, empty when AWS is disabled"
}

output "aws_instance_public_ip" {
  value       = module.aws_placeholder.aws_instance_public_ip
  description = "EC2 public IP, empty when AWS is disabled"
}

output "aws_vpc_id" {
  value       = module.aws_placeholder.aws_vpc_id
  description = "AWS VPC ID, empty when AWS is disabled"
}

output "aws_public_subnet_id" {
  value       = module.aws_placeholder.aws_public_subnet_id
  description = "AWS public subnet ID, empty when AWS is disabled"
}

output "azure_vm_id" {
  value       = module.azure_placeholder.azure_vm_id
  description = "Azure VM ID, empty when Azure is disabled"
}

output "azure_public_ip" {
  value       = module.azure_placeholder.azure_public_ip
  description = "Azure VM public IP, empty when Azure is disabled"
}

output "azure_resource_group" {
  value       = module.azure_placeholder.azure_resource_group
  description = "Azure resource group, empty when Azure is disabled"
}
