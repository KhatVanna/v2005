#!/bin/sh
set -e

cd /var/www/html

mkdir -p \
  storage/framework/cache/data \
  storage/framework/sessions \
  storage/framework/views \
  storage/logs \
  bootstrap/cache

# Discover packages (composer --no-scripts at build time)
php artisan package:discover --ansi >/dev/null 2>&1 || true

# Cache config/routes/views when APP_KEY is present
if [ -n "${APP_KEY:-}" ]; then
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache || true
fi

# Run migrations against Neon (or whatever DB_* / DB_URL is set)
php artisan migrate --force

# Railway injects PORT — bind to all interfaces
exec php artisan serve --host=0.0.0.0 --port="${PORT:-8000}"
