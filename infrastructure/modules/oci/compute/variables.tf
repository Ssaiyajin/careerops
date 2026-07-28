variable "compartment_ocid" { type = string }
variable "instance_display_name" { type = string }
variable "image_id" { type = string }
variable "ssh_public_key" { type = string }
variable "subnet_id" { type = string }
variable "ocpus" { type = number }
variable "memory_in_gbs" { type = number }
variable "shape" { type = string }
variable "availability_domain" { type = string }
variable "cloud_init_file" { type = string }
variable "is_flex_shape" {
  type    = bool
  default = false
}
