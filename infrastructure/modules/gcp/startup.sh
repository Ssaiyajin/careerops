#!/bin/bash
set -e

# --- Swap: e2-micro is 1GB RAM. A swapfile is an OOM safety margin,
#     not a performance fix — real capacity is still 1GB. ---
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  sysctl vm.swappiness=10
fi

apt-get update -y
apt-get install -y docker.io docker-compose-plugin git
systemctl enable docker
systemctl start docker

# Firewall rules on the GCP side already allow these; this just makes
# sure Ubuntu's own iptables rules don't also block them.
iptables -I INPUT -p tcp --dport 3000 -j ACCEPT || true

# Clone the repo for its docker-compose.prod.yml — the VM only ever
# pulls prebuilt images (see .github/workflows/pipeline.yml), it never
# builds them itself. Building torch/spacy or a Next.js production
# bundle on a 1GB box risks an OOM kill mid-build.
if [ ! -d /home/ubuntu/careerops ]; then
  git clone -b main https://github.com/Ssaiyajin/careerops.git /home/ubuntu/careerops
  chown -R ubuntu:ubuntu /home/ubuntu/careerops
fi

cd /home/ubuntu/careerops
if [ ! -f monitoring/.env ]; then
  printf 'GRAFANA_ADMIN_PASSWORD=%s\n' "$(openssl rand -hex 32)" > monitoring/.env
  chmod 600 monitoring/.env
fi

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
fi
chown ubuntu:ubuntu backend/.env
chmod 600 backend/.env

echo "VM bootstrap complete. Configure backend/.env, then deploy from GitHub Actions."
