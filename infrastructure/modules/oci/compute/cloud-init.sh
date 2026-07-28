#!/bin/bash
set -e

# --- Swap: this targets VM.Standard.E2.1.Micro (1GB RAM). A swapfile
#     is a safety margin against OOM-kills, not a performance fix —
#     real capacity is still 1GB. ---
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

# Open app ports — the OCI security list already allows these, this
# just makes sure Ubuntu's own iptables rules don't also block them.
iptables -I INPUT -p tcp --dport 3000 -j ACCEPT || true
iptables -I INPUT -p tcp --dport 8000 -j ACCEPT || true

# Clone the repo for its docker-compose.prod.yml — the VM only ever
# pulls prebuilt images (see .github/workflows/build.yml), it never
# builds them itself. Building torch/spacy or a Next.js production
# bundle on a 1GB box risks an OOM kill mid-build.
if [ ! -d /home/ubuntu/careerops ]; then
  git clone -b main https://github.com/Ssaiyajin/careerops.git /home/ubuntu/careerops
  chown -R ubuntu:ubuntu /home/ubuntu/careerops
  cp /home/ubuntu/careerops/backend/.env.prod.example /home/ubuntu/careerops/backend/.env
  # IMPORTANT: SSH in afterwards and fill in backend/.env for real —
  # DATABASE_URL, JWT_SECRET_KEY, GEMINI_API_KEY can't be safely
  # baked into cloud-init.
fi

cd /home/ubuntu/careerops
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
