output "instance_ocid" {
  value       = module.oci_compute.instance_id
  description = "OCI instance OCID"
}

output "instance_public_ip" {
  value       = module.oci_compute.instance_public_ip
  description = "Public IP address of the OCI compute instance"
}

output "vcn_id" {
  value       = module.oci_network.vcn_id
  description = "OCI VCN OCID"
}

output "public_subnet_id" {
  value       = module.oci_network.public_subnet_id
  description = "OCI public subnet OCID"
}
