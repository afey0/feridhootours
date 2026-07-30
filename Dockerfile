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

# Ensure storage and bootstrap/cache directories exist
RUN mkdir -p /var/www/html/storage/framework/views \
             /var/www/html/storage/framework/sessions \
             /var/www/html/storage/framework/cache \
             /var/www/html/storage/logs \
             /var/www/html/bootstrap/cache

# Disable Composer security advisory blocking BEFORE resolving packages
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN COMPOSER_NO_AUDIT=1 composer update --no-dev --optimize-autoloader --no-interaction --no-security-blocking --no-blocking 2>&1


# Set correct permissions
RUN chown -R www-data:www-data /var/www/html && \
    chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

RUN chmod +x /var/www/html/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/var/www/html/entrypoint.sh"]
