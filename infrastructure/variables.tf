variable "aws_region" {
  type    = string
  default = "eu-central-1"
}

variable "enable_aws" {
  type    = bool
  default = false
}

variable "aws_ami" {
  type    = string
  default = ""
}

variable "aws_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "aws_key_name" {
  type    = string
  default = "careerops-key"
}

variable "aws_vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "aws_public_subnet_cidr" {
  type    = string
  default = "10.0.1.0/24"
}

variable "aws_public_key_path" {
  type    = string
  default = "REPLACE_WITH_PATH_TO_SSH_PUBLIC_KEY_FILE"
}

variable "enable_azure" {
  type    = bool
  default = false
}

variable "azure_vm_size" {
  type    = string
  default = "Standard_B2s"
}

variable "azure_admin_username" {
  type    = string
  default = "ubuntu"
}

variable "azure_location" {
  type    = string
  default = "East US"
}

variable "azure_resource_group_name" {
  type    = string
  default = "careerops-rg"
}

variable "azure_vnet_cidr" {
  type    = string
  default = "10.1.0.0/16"
}

variable "azure_subnet_cidr" {
  type    = string
  default = "10.1.1.0/24"
}

variable "azure_admin_ssh_public_key" {
  type    = string
  default = "REPLACE_WITH_SSH_PUBLIC_KEY"
}

variable "enable_gcp" {
  description = "Create GCP resources when true"
  type        = bool
  default     = false
}

variable "gcp_project" {
  type    = string
  default = ""
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

variable "gcp_zone" {
  type    = string
  default = "us-central1-a"
}

variable "gcp_instance_name" {
  type    = string
  default = "careerops-vm"
}

variable "gcp_machine_type" {
  type    = string
  default = "e2-micro"
}

variable "gcp_disk_size_gb" {
  type    = number
  default = 30
}

variable "gcp_disk_type" {
  type    = string
  default = "pd-standard"
}

variable "gcp_ssh_username" {
  type    = string
  default = "ubuntu"
}

variable "gcp_ssh_public_key" {
  type    = string
  default = "REPLACE_WITH_SSH_PUBLIC_KEY"
}

variable "gcp_startup_script" {
  type    = string
  default = "./startup.sh"
}
