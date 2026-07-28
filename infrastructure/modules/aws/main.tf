
variable "enabled" { type = bool }
variable "ami" { type = string }
variable "instance_type" { type = string }
variable "key_name" { type = string }
variable "vpc_cidr" { type = string }
variable "public_subnet_cidr" { type = string }
variable "aws_public_key_path" { type = string }

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
}

resource "aws_vpc" "this" {
  count = var.enabled ? 1 : 0
  cidr_block = var.vpc_cidr
  tags = { Name = "careerops-vpc" }
}

resource "aws_subnet" "public" {
  count = var.enabled ? 1 : 0
  vpc_id     = aws_vpc.this[0].id
  cidr_block = var.public_subnet_cidr
  map_public_ip_on_launch = true
  tags = { Name = "careerops-public-subnet" }
}

resource "aws_internet_gateway" "this" {
  count = var.enabled ? 1 : 0
  vpc_id = aws_vpc.this[0].id
}

resource "aws_route_table" "public" {
  count = var.enabled ? 1 : 0
  vpc_id = aws_vpc.this[0].id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this[0].id
  }
}

resource "aws_route_table_association" "public" {
  count = var.enabled ? 1 : 0
  subnet_id      = aws_subnet.public[0].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_key_pair" "this" {
  count = var.enabled ? 1 : 0
  key_name   = var.key_name
  public_key = file(var.aws_public_key_path)
}

resource "aws_security_group" "this" {
  count = var.enabled ? 1 : 0
  name   = "careerops-sg"
  vpc_id = aws_vpc.this[0].id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "this" {
  count = var.enabled ? 1 : 0

  ami           = (var.ami != "" ? var.ami : data.aws_ami.ubuntu.id)
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public[0].id
  vpc_security_group_ids = [aws_security_group.this[0].id]
  key_name = aws_key_pair.this[0].key_name

  tags = {
    Name = "careerops-aws"
  }
}

output "aws_instance_id" {
  value = aws_instance.this.*.id
}

output "aws_instance_public_ip" {
  value = aws_instance.this.*.public_ip
}

output "aws_vpc_id" {
  value = aws_vpc.this.*.id
}

output "aws_public_subnet_id" {
  value = aws_subnet.public.*.id
}

output "aws_security_group_id" {
  value = aws_security_group.this.*.id
}
