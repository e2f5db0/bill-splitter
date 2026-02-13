#!/bin/bash

# Initialize Let's Encrypt certificates for custom domain
# This script should be run once before starting the docker compose services

if ! docker compose version > /dev/null 2>&1; then
  echo 'Error: docker compose is not installed.' >&2
  exit 1
fi

domains=(DOMAIN_HERE) # change the domain
rsa_key_size=4096
data_path="./certbot"
email="EMAIL_HERE" # change the email address
staging=0 # Set to 1 if you're testing your setup to avoid hitting request limits

if [ -d "$data_path" ]; then
  read -p "Existing data found for $domains. Continue and replace existing certificate? (y/N) " decision
  if [ "$decision" != "Y" ] && [ "$decision" != "y" ]; then
    exit
  fi
fi

if [ ! -e "$data_path/conf/options-ssl-nginx.conf" ] || [ ! -e "$data_path/conf/ssl-dhparams.pem" ]; then
  echo "### Downloading recommended TLS parameters ..."
  mkdir -p "$data_path/conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot-nginx/certbot_nginx/_internal/tls_configs/options-ssl-nginx.conf > "$data_path/conf/options-ssl-nginx.conf"
  curl -s https://raw.githubusercontent.com/certbot/certbot/master/certbot/certbot/ssl-dhparams.pem > "$data_path/conf/ssl-dhparams.pem"
  echo
fi

echo "### Creating dummy certificate for $domains ..."
path="/etc/letsencrypt/live/$domains"
mkdir -p "$data_path/conf/live/$domains"
docker compose --env-file backend/.env run --rm --entrypoint "\
  openssl req -x509 -nodes -newkey rsa:$rsa_key_size -days 1\
    -keyout '$path/privkey.pem' \
    -out '$path/fullchain.pem' \
    -subj '/CN=localhost'" certbot
echo

echo "### Starting nginx ..."
docker compose --env-file backend/.env up --force-recreate -d nginx
echo

echo "### Deleting dummy certificate for $domains ..."
docker compose --env-file backend/.env run --rm --entrypoint "\
  rm -Rf /etc/letsencrypt/live/$domains && \
  rm -Rf /etc/letsencrypt/archive/$domains && \
  rm -Rf /etc/letsencrypt/renewal/$domains.conf" certbot
echo

echo "### Requesting Let's Encrypt certificate for $domains ..."
# Join $domains to -d args
domain_args=""
for domain in "${domains[@]}"; do
  domain_args="$domain_args -d $domain"
done

# Select appropriate email arg
case "$email" in
  "") email_arg="--register-unsafely-without-email" ;;
  *) email_arg="--email $email" ;;
esac

# Enable staging mode if needed
if [ $staging != "0" ]; then staging_arg="--staging"; fi

docker compose --env-file backend/.env run --rm --entrypoint "\
  certbot certonly --webroot -w /var/www/certbot \
    $staging_arg \
    $email_arg \
    $domain_args \
    --rsa-key-size $rsa_key_size \
    --agree-tos \
    --force-renewal" certbot
echo

echo "### Regenerating nginx.conf with HTTPS configuration ..."
# Load DOMAIN_NAME from .env if available
if [ -f "./backend/.env" ]; then
  source ./backend/.env
fi

# Use the domain from the script if DOMAIN_NAME is not set
if [ -z "$DOMAIN_NAME" ]; then
  DOMAIN_NAME="${domains[0]}"
fi

# Generate HTTPS-enabled nginx.conf
if [ -f "./nginx.conf.template" ]; then
  export DOMAIN_NAME
  envsubst '${DOMAIN_NAME}' < nginx.conf.template > nginx.conf
  echo "✓ nginx.conf regenerated with HTTPS support"
else
  echo "Warning: nginx.conf.template not found, skipping nginx.conf regeneration"
fi
echo

echo "### Reloading nginx ..."
docker compose --env-file backend/.env exec nginx nginx -s reload
