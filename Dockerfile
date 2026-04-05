FROM php:8.4-fpm

# Install system dependencies and PHP extensions in one layer
RUN apt-get update && apt-get install -y \
    git curl zip unzip \
    libpq-dev libpng-dev libonig-dev \
    libxml2-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring zip exif pcntl bcmath gd intl \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . .

# Install PHP dependencies
# Note: If you have npm dependencies, you might need to run 'npm ci' here too
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# Fix permissions for Laravel storage and cache
RUN chown -R www-data:www-data /var/www/storage /var/www/bootstrap/cache

EXPOSE 9000

CMD ["php-fpm"]
