#!/bin/sh
set -e

cd /app

mkdir -p \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

php artisan package:discover --ansi >/dev/null 2>&1 || true

if [ -n "${APP_KEY:-}" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache || true
fi

# Railway injects PORT; FrankenPHP/Caddy reads SERVER_NAME / {$PORT}.
export PORT="${PORT:-8080}"
export SERVER_NAME=":${PORT}"

# Start FrankenPHP first so /up healthchecks pass while Neon migrate runs.
frankenphp run --config /etc/caddy/Caddyfile &
SERVER_PID=$!

sleep 2

# Neon free/cold starts are slow; keep serving even if migrate needs a retry.
if ! php artisan migrate --force --no-interaction; then
  echo "WARNING: migrate failed on first attempt; retrying once..."
  sleep 3
  php artisan migrate --force --no-interaction || echo "WARNING: migrate failed — check Neon DB_* / DB_URL"
fi

# Drop stale file-cache entries (corrupt catalog payloads from older deploys).
php artisan cache:clear >/dev/null 2>&1 || true

wait "${SERVER_PID}"
