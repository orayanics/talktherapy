FROM php:8.4-cli-bookworm

RUN apt-get update \
    && apt-get install -y --no-install-recommends git unzip libicu-dev libonig-dev libpq-dev libzip-dev \
    && docker-php-ext-install bcmath intl mbstring pcntl pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY composer.json composer.lock ./
RUN composer install --no-interaction --prefer-dist --no-progress --no-scripts
RUN mkdir -p storage/app/private storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/testing storage/framework/views storage/logs

COPY docker-entrypoint.sh /usr/local/bin/talktherapy-server
RUN chmod +x /usr/local/bin/talktherapy-server

EXPOSE 8080 8081
ENTRYPOINT ["talktherapy-server"]
