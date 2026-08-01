#!/bin/bash
set -e

cd /var/www/html

# Create .env if missing
if [ ! -f ".env" ]; then
    echo "==> Creating .env from environment defaults..."
    cp .env.example .env || true
fi

# Ensure vendor/autoload.php exists (recovers from host bind-mount overrides)
if [ ! -f "vendor/autoload.php" ]; then
    echo "==> vendor/autoload.php not found. Installing PHP dependencies..."
    export COMPOSER_ALLOW_SUPERUSER=1
    export COMPOSER_NO_AUDIT=1
    composer config policy.advisories.block false || true
    composer update --no-dev --optimize-autoloader --no-interaction --no-scripts --no-audit 2>&1 || true
fi

# Ensure storage directories exist with proper permissions
mkdir -p storage/framework/views storage/framework/sessions storage/framework/cache storage/logs bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache || true
chmod -R 775 storage bootstrap/cache || true

echo "==> Waiting for PostgreSQL database connection..."
until php -r "try { new PDO('pgsql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (\Exception \$e) { exit(1); }" > /dev/null 2>&1; do
    echo "    PostgreSQL is unavailable - waiting..."
    sleep 2
done
echo "==> PostgreSQL is up and connected!"

echo "==> Running package:discover..."
php artisan package:discover --ansi || true

echo "==> Running Database Migrations & Seeding..."
php artisan migrate:fresh --seed --force || php artisan migrate --force || true

echo "==> Caching Configuration, Routes & Views..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "==> Starting PHP-FPM..."
exec php-fpm
