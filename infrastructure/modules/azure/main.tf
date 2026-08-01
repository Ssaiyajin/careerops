resource "azurerm_resource_group" "this" {
  count = var.enabled ? 1 : 0
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_virtual_network" "this" {
  count = var.enabled ? 1 : 0
  name                = "careerops-vnet"
  address_space       = [var.vnet_cidr]
  location            = var.location
  resource_group_name = azurerm_resource_group.this[0].name
}

resource "azurerm_subnet" "public" {
  count = var.enabled ? 1 : 0
  name                 = "public"
  resource_group_name  = azurerm_resource_group.this[0].name
  virtual_network_name = azurerm_virtual_network.this[0].name
  address_prefixes     = [var.subnet_cidr]
}

resource "azurerm_network_security_group" "this" {
  count = var.enabled ? 1 : 0
  name                = "careerops-nsg"
  location            = var.location
  resource_group_name = azurerm_resource_group.this[0].name

  security_rule {
    name                       = "SSH"
    priority                   = 1001
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "22"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTP"
    priority                   = 1002
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "HTTPS"
    priority                   = 1003
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_public_ip" "this" {
  count = var.enabled ? 1 : 0
  name                = "careerops-pip"
  location            = var.location
  resource_group_name = azurerm_resource_group.this[0].name
  allocation_method   = "Dynamic"
}

resource "azurerm_network_interface" "this" {
  count = var.enabled ? 1 : 0
  name                = "careerops-nic"
  location            = var.location
  resource_group_name = azurerm_resource_group.this[0].name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.public[0].id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.this[0].id
  }
}

resource "azurerm_network_interface_security_group_association" "this" {
  count = var.enabled ? 1 : 0
  network_interface_id      = azurerm_network_interface.this[0].id
  network_security_group_id = azurerm_network_security_group.this[0].id
}

resource "azurerm_linux_virtual_machine" "this" {
  count = var.enabled ? 1 : 0

  name                = "careerops-azure-vm"
  resource_group_name = azurerm_resource_group.this[0].name
  location            = var.location
  size                = var.vm_size
  admin_username      = var.admin_username

  network_interface_ids = [azurerm_network_interface.this[0].id]

  admin_ssh_key {
    username   = var.admin_username
    public_key = var.admin_ssh_public_key
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "22_04-lts"
    version   = "latest"
  }
}

output "azure_vm_id" {
  value = azurerm_linux_virtual_machine.this.*.id
}

output "azure_public_ip" {
  value = azurerm_public_ip.this.*.ip_address
}

output "azure_resource_group" {
  value = azurerm_resource_group.this.*.name
}
