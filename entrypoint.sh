#!/bin/bash
set -e

cd /var/www/html

# Create .env from environment variables if it doesn't exist
if [ ! -f ".env" ]; then
    echo "==> Creating .env file from environment variables..."
    cat > .env << EOF
APP_NAME=FeridhooTours
APP_ENV=${APP_ENV:-production}
APP_KEY=${APP_KEY}
APP_DEBUG=${APP_DEBUG:-false}
APP_URL=${APP_URL:-http://localhost}

LOG_CHANNEL=stderr
LOG_LEVEL=debug

DB_CONNECTION=pgsql
DATABASE_URL=${DATABASE_URL}

CACHE_STORE=file
SESSION_DRIVER=file
SESSION_LIFETIME=120
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=local
EOF

fi

# Ensure Laravel storage directories exist with correct permissions
mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

# Run Composer post-install scripts now that artisan is available
echo "==> Running package:discover..."
php artisan package:discover --ansi || true

# Run Database Migrations on Startup against Neon PostgreSQL
if [ -n "$DATABASE_URL" ]; then
    echo "==> Running Database Migrations on Neon PostgreSQL..."
    php artisan migrate:fresh --force || php artisan migrate --force || true
fi


# Cache Laravel Configuration for production performance
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Starting Apache..."
exec apache2-foreground
