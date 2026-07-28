variable "tenancy_ocid" {
  type = string
}

variable "user_ocid" {
  type = string
}

variable "fingerprint" {
  type = string
}

variable "private_key_path" {
  type = string
}

variable "region" {
  type    = string
  default = "us-phoenix-1"
}

variable "compartment_ocid" {
  type = string
}

variable "image_id" {
  type = string
}

variable "ssh_public_key" {
  type = string
}

variable "instance_display_name" {
  type = string
  default = "careerops-vm"
}

variable "vcn_display_name" {
  type = string
  default = "careerops-vcn"
}

variable "internet_gateway_display_name" {
  type = string
  default = "careerops-igw"
}

variable "route_table_display_name" {
  type = string
  default = "careerops-rt"
}

variable "subnet_display_name" {
  type = string
  default = "careerops-public-subnet"
}

variable "security_list_display_name" {
  type = string
  default = "careerops-security-list"
}

variable "vcn_cidr" {
  type = string
  default = "10.0.0.0/16"
}

variable "subnet_cidr" {
  type = string
  default = "10.0.1.0/24"
}

variable "ocpus" {
  type    = number
  default = 2
}

variable "memory_in_gbs" {
  type    = number
  default = 12
}

variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "enable_aws" {
  type    = bool
  default = false
}

variable "aws_ami" {
  type = string
  default = "ubuntu-24.04-ami"
}

variable "aws_instance_type" {
  type = string
  default = "t3.medium"
}

variable "aws_key_name" {
  type = string
  default = "careerops-key"
}

variable "enable_azure" {
  type    = bool
  default = false
}

variable "azure_vm_size" {
  type = string
  default = "Standard_B2s"
}

variable "azure_admin_username" {
  type = string
  default = "ubuntu"
}

variable "oci_shape" {
  type    = string
  default = "VM.Standard.E2.1.Micro" # 1GB RAM x86 Always Free shape — the actual deploy target
}

variable "oci_is_flex_shape" {
  description = "Set true only if oci_shape is switched to a *.Flex shape (e.g. A1.Flex)"
  type        = bool
  default     = false
}

variable "oci_availability_domain" {
  type    = string
  default = ""
}

variable "enable_gcp" {
  type    = bool
  default = false
}

variable "gcp_project" { type = string }
variable "gcp_region" { type = string }
variable "gcp_zone" { type = string }
variable "gcp_instance_name" { type = string }
variable "gcp_machine_type" { type = string }
variable "gcp_startup_script" { type = string }
