output "vcn_id" {
  value = oci_core_vcn.this.id
}

output "public_subnet_id" {
  value = oci_core_subnet.public_subnet.id
}

output "internet_gateway_id" {
  value = oci_core_internet_gateway.this.id
}

output "route_table_id" {
  value = oci_core_route_table.this.id
}
