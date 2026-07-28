data "oci_identity_availability_domains" "ads" {
  compartment_id = var.compartment_ocid
}

resource "oci_core_instance" "this" {
  availability_domain = var.availability_domain != "" ? var.availability_domain : data.oci_identity_availability_domains.ads.availability_domains[0].name
  compartment_id      = var.compartment_ocid
  display_name        = var.instance_display_name
  shape               = var.shape != "" ? var.shape : "VM.Standard.E2.1.Micro"

  # VM.Standard.E2.1.Micro (the 1GB Always Free x86 shape this repo
  # targets) is a FIXED shape and does not accept shape_config —
  # only *.Flex shapes (e.g. A1.Flex) do. Only emit the block when
  # is_flex_shape is explicitly set.
  dynamic "shape_config" {
    for_each = var.is_flex_shape ? [1] : []
    content {
      ocpus         = var.ocpus
      memory_in_gbs = var.memory_in_gbs
    }
  }

  create_vnic_details {
    subnet_id        = var.subnet_id
    assign_public_ip = true
  }

  metadata = var.cloud_init_file != "" ? {
    ssh_authorized_keys = var.ssh_public_key
    user_data           = base64encode(file(var.cloud_init_file))
  } : {
    ssh_authorized_keys = var.ssh_public_key
  }

  source_details {
    source_type = "image"
    source_id   = var.image_id
  }
}
