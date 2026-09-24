#!/bin/sh
set -e

cd /var/www/html

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

# Bind HTTP first so Railway /up healthchecks succeed while Neon migrations run.
php artisan serve --host=0.0.0.0 --port="${PORT:-8000}" &
SERVER_PID=$!

# Give the built-in server a moment to listen before health checks hit.
sleep 2

# Neon free/cold starts are slow; keep serving even if migrate needs a retry.
if ! php artisan migrate --force --no-interaction; then
  echo "WARNING: migrate failed on first attempt; retrying once..."
  sleep 3
  php artisan migrate --force --no-interaction || echo "WARNING: migrate failed — check Neon DB_* / DB_URL"
fi

wait "${SERVER_PID}"
