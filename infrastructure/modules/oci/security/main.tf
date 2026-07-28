resource "oci_core_security_list" "this" {
  compartment_id = var.compartment_ocid
  vcn_id         = var.vcn_id
  display_name   = var.security_list_display_name

  ingress_security_rules {
    protocol = "6"

    source = "0.0.0.0/0"

    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol = "6"

    source = "0.0.0.0/0"

    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6"

    source = "0.0.0.0/0"

    tcp_options {
      min = 443
      max = 443
    }
  }

  # Frontend (Next.js) and backend (FastAPI) — exposed directly for
  # now since there's no reverse proxy in front yet. Once one's added
  # (Caddy/nginx on 80/443), drop these two.
  ingress_security_rules {
    protocol = "6"

    source = "0.0.0.0/0"

    tcp_options {
      min = 3000
      max = 3000
    }
  }

  ingress_security_rules {
    protocol = "6"

    source = "0.0.0.0/0"

    tcp_options {
      min = 8000
      max = 8000
    }
  }

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }
}
