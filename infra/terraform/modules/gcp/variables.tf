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

  validation {
    condition     = contains(["us-west1", "us-central1", "us-east1"], var.region)
    error_message = "The GCP Free Tier VM region must be us-west1, us-central1, or us-east1."
  }
}

variable "zone" {
  type        = string
  description = "GCP zone within the region"
  default     = "us-central1-a"

  validation {
    condition     = can(regex("^(us-west1|us-central1|us-east1)-[a-z]$", var.zone))
    error_message = "The GCP Free Tier VM zone must be within us-west1, us-central1, or us-east1."
  }
}

variable "name" {
  type        = string
  description = "Instance name"
  default     = "careerops-vm"
}

variable "machine_type" {
  type        = string
  description = "GCE machine type. Free Tier e2-micro hours are pooled across eligible regions per billing account"
  default     = "e2-micro"

  validation {
    condition     = var.machine_type == "e2-micro"
    error_message = "The GCP Free Tier configuration only permits the e2-micro machine type."
  }
}

variable "disk_size_gb" {
  type        = number
  description = "Boot disk size; the Free Tier allowance is up to 30 GB-months of standard persistent disk per billing account"
  default     = 30

  validation {
    condition     = var.disk_size_gb > 0 && var.disk_size_gb <= 30 && var.disk_size_gb == floor(var.disk_size_gb)
    error_message = "The GCP Free Tier configuration permits a whole-number boot disk size from 1 to 30 GB."
  }
}

variable "disk_type" {
  type        = string
  description = "Boot disk type. pd-standard is the Always Free eligible type (pd-ssd/pd-balanced are not)"
  default     = "pd-standard"

  validation {
    condition     = var.disk_type == "pd-standard"
    error_message = "The GCP Free Tier configuration only permits pd-standard disks."
  }
}

variable "ssh_username" {
  type        = string
  description = "Username the SSH key metadata is registered under (must match the pipeline's deploy step)"
  default     = "deploy"
}

variable "ssh_public_key" {
  type        = string
  description = "SSH public key content granted access to the instance"
}

variable "network_tags" {
  type        = list(string)
  description = "Network tags to assign to the instance"
  default     = ["careerops"]
}

variable "manage_firewall" {
  type        = bool
  description = "Whether this module should create GCP firewall rules"
  default     = true
}

variable "startup_script" {
  type        = string
  description = "Path to the startup script run on first boot"
}
