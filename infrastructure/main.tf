// Root module: instantiate cloud modules

module "aws_placeholder" {
  source = "./modules/aws"

  enabled             = var.enable_aws
  ami                 = var.aws_ami
  instance_type       = var.aws_instance_type
  key_name             = var.aws_key_name
  vpc_cidr             = var.aws_vpc_cidr
  public_subnet_cidr   = var.aws_public_subnet_cidr
  aws_public_key_path = var.aws_public_key_path
}

module "azure_placeholder" {
  source = "./modules/azure"

  enabled             = var.enable_azure
  vm_size             = var.azure_vm_size
  admin_username      = var.azure_admin_username
  location            = var.azure_location
  resource_group_name = var.azure_resource_group_name
  vnet_cidr           = var.azure_vnet_cidr
  subnet_cidr         = var.azure_subnet_cidr
  admin_ssh_public_key = var.azure_admin_ssh_public_key
}

module "gcp" {
  source = "./modules/gcp"

  enabled         = var.enable_gcp
  project         = var.gcp_project
  region          = var.gcp_region
  zone            = var.gcp_zone
  name            = var.gcp_instance_name
  machine_type    = var.gcp_machine_type
  disk_size_gb    = var.gcp_disk_size_gb
  disk_type       = var.gcp_disk_type
  ssh_username    = var.gcp_ssh_username
  ssh_public_key  = var.gcp_ssh_public_key
  network_tags    = var.gcp_network_tags
  manage_firewall = var.gcp_manage_firewall
  startup_script  = var.gcp_startup_script
}
