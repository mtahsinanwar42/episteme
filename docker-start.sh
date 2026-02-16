#!/bin/sh
set -eu

usage() {
  echo "Usage:"
  echo "  sh docker-start.sh [--service=all|svc1,svc2,...]"
  echo
  echo "Examples:"
  echo "  sh docker-start.sh"
  echo "  sh docker-start.sh --service=all"
  echo "  sh docker-start.sh --service=backend,kafka"
}

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"

SERVICE_ARG="all"

for arg in "$@"; do
  case "$arg" in
    --service=*)
      SERVICE_ARG="${arg#*=}"
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "[docker-start] Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ -z "$SERVICE_ARG" ]; then
  SERVICE_ARG="all"
fi

if [ "$SERVICE_ARG" = "all" ]; then
  echo "[docker-start] Starting all services..."
  docker compose up -d
  echo "[docker-start] Done."
  exit 0
fi

REQUESTED_SERVICES="$(printf "%s" "$SERVICE_ARG" | tr ',' ' ')"
AVAILABLE_SERVICES="$(docker compose config --services)"

for service in $REQUESTED_SERVICES; do
  if ! printf "%s\n" "$AVAILABLE_SERVICES" | grep -qx "$service"; then
    echo "[docker-start] Unknown service: $service" >&2
    echo "[docker-start] Available services:" >&2
    printf "%s\n" "$AVAILABLE_SERVICES" >&2
    exit 1
  fi
done

echo "[docker-start] Starting services: $REQUESTED_SERVICES"
docker compose up -d --build $REQUESTED_SERVICES
echo "[docker-start] Done."
