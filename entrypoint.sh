#!/bin/bash
set -e

# Ensure Laravel storage directories exist with correct permissions
mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Run Database Migrations on Startup against Neon PostgreSQL
if [ -n "$DATABASE_URL" ]; then
    echo "==> Running Database Migrations on Neon PostgreSQL..."
    php artisan migrate --force --seed || true
fi

# Cache Laravel Configuration for production performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Starting Apache..."
exec apache2-foreground
