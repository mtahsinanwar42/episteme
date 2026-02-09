#!/bin/sh
set -eu

usage() {
  echo "Usage:"
  echo "  sh docker-stop.sh [--service=all|svc1,svc2,...]"
  echo
  echo "Examples:"
  echo "  sh docker-stop.sh"
  echo "  sh docker-stop.sh --service=all"
  echo "  sh docker-stop.sh --service=backend,frontend"
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
      echo "[docker-stop] Unknown argument: $arg" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [ -z "$SERVICE_ARG" ]; then
  SERVICE_ARG="all"
fi

if [ "$SERVICE_ARG" = "all" ]; then
  echo "[docker-stop] Stopping all services..."
  docker compose down --remove-orphans
  echo "[docker-stop] Done."
  exit 0
fi

REQUESTED_SERVICES="$(printf "%s" "$SERVICE_ARG" | tr ',' ' ')"
AVAILABLE_SERVICES="$(docker compose config --services)"

for service in $REQUESTED_SERVICES; do
  if ! printf "%s\n" "$AVAILABLE_SERVICES" | grep -qx "$service"; then
    echo "[docker-stop] Unknown service: $service" >&2
    echo "[docker-stop] Available services:" >&2
    printf "%s\n" "$AVAILABLE_SERVICES" >&2
    exit 1
  fi
done

echo "[docker-stop] Stopping services: $REQUESTED_SERVICES"
docker compose stop $REQUESTED_SERVICES
docker compose rm -f $REQUESTED_SERVICES
echo "[docker-stop] Done."
