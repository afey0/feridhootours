#!/bin/bash
set -e

# Run Composer Install if vendor does not exist
if [ ! -d "vendor" ]; then
    composer install --no-dev --optimize-autoloader
fi

# Run Database Migrations on Startup
if [ -n "$DATABASE_URL" ]; then
    echo "Running Database Migrations on Neon PostgreSQL..."
    php artisan migrate --force || true
fi

# Cache Laravel Configuration
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# Start Apache in foreground
exec apache2-foreground
