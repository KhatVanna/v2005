# V2005 Laravel API — Railway / production image
# Context: backend/ (set Railway Root Directory to `backend`)
# FrankenPHP serves concurrent requests (php artisan serve is single-threaded).

FROM php:8.4-cli-bookworm AS vendor

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libzip-dev \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-interaction


FROM dunglas/frankenphp:1-php8.4-bookworm

RUN install-php-extensions \
        pdo_pgsql \
        pgsql \
        bcmath \
        intl \
        zip \
        gd \
        opcache \
        pcntl

WORKDIR /app

COPY --from=vendor /app /app
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R ug+rwx storage bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PORT=8080 \
    SERVER_NAME=:8080

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
