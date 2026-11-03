#!/bin/bash
set -e

apt-get update -y
apt-get install -y docker.io git
systemctl enable --now docker
if ! docker compose version >/dev/null 2>&1; then
  apt-get install -y docker-compose-plugin || apt-get install -y docker-compose-v2
fi
docker compose version

# The 2 GB swap file is an OOM safety margin, not additional RAM.
if ! swapon --noheadings --show=NAME | grep -Fxq /swapfile; then
  if [ ! -f /swapfile ] || [ "$(stat -c '%s' /swapfile)" -ne 2147483648 ]; then
    rm -f /swapfile
    fallocate -l 2G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
    chmod 600 /swapfile
    mkswap /swapfile
  fi
  swapon /swapfile
fi
grep -q '^/swapfile none swap' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
sysctl vm.swappiness=10

# Keep deployment configuration available locally; GitHub Actions checks
# out the exact release commit and the VM only pulls its prebuilt images.
DEPLOY_USER="deploy"
DEPLOY_HOME="/home/${DEPLOY_USER}"
if id "$DEPLOY_USER" >/dev/null 2>&1 && [ ! -d "${DEPLOY_HOME}/careerops/.git" ]; then
  git clone --branch main --single-branch https://github.com/Ssaiyajin/careerops.git "${DEPLOY_HOME}/careerops"
  chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "${DEPLOY_HOME}/careerops"
fi

echo "VM bootstrap complete. Configure /home/deploy/careerops/.env, then deploy from GitHub Actions."
