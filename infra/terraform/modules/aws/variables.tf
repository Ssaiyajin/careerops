variable "enabled" { type = bool }
variable "ami" { type = string }
variable "instance_type" { type = string }
variable "key_name" { type = string }

variable "vpc_cidr" { type = string }
variable "public_subnet_cidr" { type = string }
variable "aws_public_key_path" { type = string }
