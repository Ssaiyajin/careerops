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
  default = "ubuntu-24.04-ami"
}

variable "aws_instance_type" {
  type    = string
  default = "t3.medium"
}

variable "aws_key_name" {
  type    = string
  default = "careerops-key"
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

variable "enable_gcp" {
  description = "GCP is the active deploy target (Always Free e2-micro)"
  type        = bool
  default     = true
}

variable "gcp_project" {
  type = string
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
  type = string
}

variable "gcp_startup_script" {
  type    = string
  default = "./modules/gcp/startup.sh"
}
