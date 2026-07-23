// Root module: instantiate cloud modules

module "oci_network" {
  source = "./modules/oci/network"

  compartment_ocid = var.compartment_ocid
  vcn_cidr          = var.vcn_cidr
  vcn_display_name  = var.vcn_display_name
  internet_gateway_display_name = var.internet_gateway_display_name
  route_table_display_name      = var.route_table_display_name
  subnet_cidr        = var.subnet_cidr
  subnet_display_name = var.subnet_display_name
}

module "oci_security" {
  source = "./modules/oci/security"

  compartment_ocid = var.compartment_ocid
  vcn_id           = module.oci_network.vcn_id
  security_list_display_name = var.security_list_display_name
}

module "oci_compute" {
  source = "./modules/oci/compute"

  compartment_ocid     = var.compartment_ocid
  instance_display_name = var.instance_display_name
  image_id              = var.image_id
  ssh_public_key        = var.ssh_public_key
  subnet_id             = module.oci_network.public_subnet_id
  ocpus                 = var.ocpus
  memory_in_gbs         = var.memory_in_gbs
  shape                 = var.oci_shape
  availability_domain   = var.oci_availability_domain
  cloud_init_file       = "./modules/oci/compute/cloud-init.sh"
}

module "aws_placeholder" {
  source  = "./modules/aws"
  enabled = var.enable_aws
  ami     = var.aws_ami
  instance_type = var.aws_instance_type
  key_name = var.aws_key_name
}

module "azure_placeholder" {
  source = "./modules/azure"
  enabled = var.enable_azure
  vm_size = var.azure_vm_size
  admin_username = var.azure_admin_username
}

module "gcp_placeholder" {
  source = "./modules/gcp"

  enabled = var.enable_gcp
  project = var.gcp_project
  region  = var.gcp_region
  zone    = var.gcp_zone
  name    = var.gcp_instance_name
  machine_type = var.gcp_machine_type
  startup_script = var.gcp_startup_script
}
