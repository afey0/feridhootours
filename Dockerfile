FROM php:8.3-apache

# Install System Dependencies & PostgreSQL PHP Extension for Neon
RUN apt-get update && apt-get install -y \
    libpq-dev \
    git \
    unzip \
    zip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-install pdo pdo_pgsql pgsql bcmath gd

# Enable Apache mod_rewrite for Laravel
RUN a2enmod rewrite

# Configure Apache DocumentRoot to Laravel /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/conf-available/*.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

# Ensure storage and bootstrap/cache directories exist and set permissions
RUN mkdir -p /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache && \
    chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Install dependencies during build time
RUN composer update --no-dev --optimize-autoloader --no-interaction || true

RUN chmod +x /var/www/html/entrypoint.sh || true

EXPOSE 80

ENTRYPOINT ["/var/www/html/entrypoint.sh"]
