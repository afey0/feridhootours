FROM php:8.3-fpm-alpine

# Install System Dependencies & PostgreSQL + Redis PHP Extensions
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    bash \
    oniguruma-dev \
    icu-dev \
    $PHPIZE_DEPS \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath gd zip opcache \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy application files
COPY . .

# Ensure storage & bootstrap/cache directories exist with proper permissions
RUN mkdir -p storage/framework/views \
             storage/framework/sessions \
             storage/framework/cache \
             storage/logs \
             bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache

# Install PHP dependencies
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN COMPOSER_NO_AUDIT=1 composer install --no-dev --optimize-autoloader --no-interaction --no-scripts 2>&1

RUN chmod +x docker/entrypoint.sh entrypoint.sh || true

EXPOSE 9000

CMD ["php-fpm"]
