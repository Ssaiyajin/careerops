#!/bin/bash

apt update

apt install -y docker.io

systemctl enable docker

systemctl start docker

docker run -d \
-p 8000:8000 \
ghcr.io/yourname/careerops-backend:latest
