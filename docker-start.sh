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

is_windows_shell() {
  case "$(uname -s 2>/dev/null || printf '%s' "${OS:-}")" in
    *MINGW*|*MSYS*|*CYGWIN*|*Windows_NT*)
      return 0
      ;;
  esac

  return 1
}

should_start_redis_container() {
  if is_windows_shell; then
    return 0
  fi

  if command -v redis-server >/dev/null 2>&1; then
    return 1
  fi

  return 0
}

filter_requested_services() {
  requested="$1"

  if should_start_redis_container; then
    printf "%s\n" "$requested"
    return 0
  fi

  filtered=""
  for service in $requested; do
    if [ "$service" = "redis" ]; then
      continue
    fi
    filtered="${filtered} ${service}"
  done

  printf "%s\n" "$(printf "%s" "$filtered" | xargs)"
}

if [ "$SERVICE_ARG" = "all" ]; then
  AVAILABLE_SERVICES="$(docker compose config --services)"
  REQUESTED_SERVICES="$(printf "%s\n" "$AVAILABLE_SERVICES" | tr '\n' ' ')"
  REQUESTED_SERVICES="$(filter_requested_services "$REQUESTED_SERVICES")"

  echo "[docker-start] Starting services: $REQUESTED_SERVICES"
  docker compose up -d $REQUESTED_SERVICES
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

REQUESTED_SERVICES="$(filter_requested_services "$REQUESTED_SERVICES")"
if [ -z "$REQUESTED_SERVICES" ]; then
  echo "[docker-start] No services to start after applying redis rule."
  exit 0
fi

echo "[docker-start] Starting services: $REQUESTED_SERVICES"
docker compose up -d $REQUESTED_SERVICES
echo "[docker-start] Done."
