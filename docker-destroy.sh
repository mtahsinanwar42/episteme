#!/bin/sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-episteme}"

echo "[docker-destroy] Bringing down all project services..."
docker compose down --remove-orphans >/dev/null 2>&1 || true

echo "[docker-destroy] Removing project data volumes..."
docker volume rm \
  "${PROJECT_NAME}_kafka_data" \
  >/dev/null 2>&1 || true

echo "[docker-destroy] Done."
echo "[docker-destroy] All project services stopped/removed and data volumes wiped (if present)."
