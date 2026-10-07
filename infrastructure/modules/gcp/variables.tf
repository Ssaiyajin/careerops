variable "enabled" {
  type        = bool
  description = "Whether to create the GCP resources"
}

variable "project" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  description = "GCP region. Must be one of the Always Free regions: us-west1, us-central1, us-east1"
  default     = "us-central1"
}

variable "zone" {
  type        = string
  description = "GCP zone within the region"
  default     = "us-central1-a"
}

variable "name" {
  type        = string
  description = "Instance name"
  default     = "careerops-vm"
}

variable "machine_type" {
  type        = string
  description = "GCE machine type. e2-micro is the Always Free eligible shape (1 instance/month, in a free region)"
  default     = "e2-micro"
}

variable "disk_size_gb" {
  type        = number
  description = "Boot disk size. Always Free covers up to 30GB standard persistent disk"
  default     = 30
}

variable "disk_type" {
  type        = string
  description = "Boot disk type. pd-standard is the Always Free eligible type (pd-ssd/pd-balanced are not)"
  default     = "pd-standard"
}

variable "ssh_username" {
  type        = string
  description = "Username the SSH key metadata is registered under (must match the pipeline's deploy step)"
  default     = "ubuntu"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content granted access to the instance"
}

variable "startup_script" {
  type        = string
  description = "Path to the startup script run on first boot"
}
