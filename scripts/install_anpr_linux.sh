#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/example/anpr-variklis.git"
REPO_DIR="/opt/anpr-variklis"

log() {
  echo "[install-linux] $1"
}

require_root() {
  if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root." >&2
    exit 1
  fi
}

install_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    log "Installing Docker..."
    apt-get update -y
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/$(. /etc/os-release && echo "$ID")/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$(. /etc/os-release && echo "$ID") $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
  else
    log "Docker already installed."
  fi
}

clone_repo() {
  if [[ ! -d "$REPO_DIR/.git" ]]; then
    log "Cloning repository to $REPO_DIR"
    rm -rf "$REPO_DIR"
    git clone "$REPO_URL" "$REPO_DIR"
  else
    log "Repository already present, pulling latest changes."
    git -C "$REPO_DIR" pull
  fi
}

prepare_env() {
  cd "$REPO_DIR"
  if [[ ! -f .env ]]; then
    log "Creating .env from example."
    cp .env.example .env
  else
    log ".env already exists; leaving in place."
  fi
}

compose_up() {
  cd "$REPO_DIR"
  log "Building containers..."
  docker compose build
  log "Starting stack..."
  docker compose up -d
}

main() {
  require_root
  log "Updating system packages..."
  apt-get update -y && apt-get upgrade -y
  install_docker
  clone_repo
  prepare_env
  compose_up
  log "Installation complete. Access frontend at http://localhost:3000 and backend health at http://localhost:8000/healthz"
}

main "$@"
