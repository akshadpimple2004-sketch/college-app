#!/bin/bash

# Exit immediately if any command returns a non-zero exit code
set -e

echo "========================================="
echo "  Preparing AWS EC2 Host for Academix"
echo "========================================="

# 1. Update system package index
echo "[1/4] Updating package index..."
sudo apt-get update -y

# 2. Install pre-requisites
echo "[2/4] Installing transport packages..."
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git \
    ufw

# 3. Download and install Docker official script
echo "[3/4] Fetching Docker installation script..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 4. Enable Docker service on system boot & start it
sudo systemctl enable docker
sudo systemctl start docker

# 5. Add user 'ubuntu' to the docker group (avoids typing 'sudo' for docker commands)
echo "[4/4] Configuring user permissions..."
sudo usermod -aG docker ubuntu

# 6. Verify Docker CLI and Compose Plugin are available
echo "========================================="
echo "  Verification Results:"
echo "========================================="
docker --version
docker compose version

echo "========================================="
echo "  Setup Complete! Please log out and log back"
echo "  in for group permissions to take effect."
echo "========================================="
