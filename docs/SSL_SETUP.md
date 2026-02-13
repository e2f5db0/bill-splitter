# SSL Certificate Setup with Certbot

This project is configured to automatically obtain and renew SSL certificates from Let's Encrypt using Certbot.

## Configuration Details

- **Certificate Authority:** Let's Encrypt
- **Auto-renewal:** Every 12 hours (certificates renew automatically when 30 days from expiration)

## Prerequisites

Before running the setup, ensure:

1. **Ports 80 and 443 are open** on your server and accessible from the internet
2. **DNS is configured** - domain must point to your server's public IP address
3. **Docker and docker compose are installed**

## Initial Setup

### Step 1: Make the initialization script executable

```bash
chmod +x init-letsencrypt.sh
```

### Step 2: Test with staging certificates (recommended)

Edit `init-letsencrypt.sh` and set `staging=1` to avoid hitting Let's Encrypt rate limits during testing:

```bash
staging=1  # Set to 1 for testing
```

Then run:

```bash
./init-letsencrypt.sh
```

This will:
- Download recommended TLS parameters
- Create a dummy certificate
- Start nginx
- Request a staging certificate from Let's Encrypt
- Reload nginx with the new certificate

### Step 3: Switch to production certificates

Once you've verified everything works with staging certificates:

1. Edit `init-letsencrypt.sh` and set `staging=0`:
   ```bash
   staging=0  # Set to 0 for production
   ```

2. Run the script again:
   ```bash
   ./init-letsencrypt.sh
   ```

### Step 4: Start all services

```bash
docker compose up -d
```

Your application will now be available at:
- **HTTPS:** https://domain.me (port 443)
- **HTTP:** http://domain.me (port 80, redirects to HTTPS)

## How Auto-Renewal Works

The certbot container runs continuously and:
1. Checks for certificate renewal every 12 hours
2. Renews certificates automatically when they're within 30 days of expiration
3. Let's Encrypt certificates are valid for 90 days

The nginx container:
1. Reloads its configuration every 6 hours to pick up renewed certificates
2. This ensures zero-downtime certificate updates

## Manual Certificate Renewal

If you need to manually renew certificates:

```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

## Troubleshooting

### Certificate request fails

1. **Check DNS:** Ensure `domain.me` resolves to your server's IP:
   ```bash
   nslookup domain.me
   ```

2. **Check ports:** Ensure ports 80 and 443 are accessible:
   ```bash
   curl -I http://domain.me/.well-known/acme-challenge/test
   ```

3. **Check logs:**
   ```bash
   docker compose logs certbot
   docker compose logs nginx
   ```

### Rate limit errors

If you hit Let's Encrypt rate limits:
- Use staging mode (`staging=1`) for testing
- Wait for the rate limit to reset (usually 1 week)
- See: https://letsencrypt.org/docs/rate-limits/

### Certificate not updating

Force a renewal:
```bash
docker compose run --rm certbot renew --force-renewal
docker compose exec nginx nginx -s reload
```

## File Structure

```
bill-splitter/
├── certbot/                    # Created by init script (gitignored)
│   ├── conf/                   # Certificate storage
│   │   ├── live/
│   │   │   └── <DOMAIN>.me/
│   │   │       ├── fullchain.pem
│   │   │       └── privkey.pem
│   │   ├── options-ssl-nginx.conf
│   │   └── ssl-dhparams.pem
│   ├── www/                    # ACME challenge directory
│   └── logs/                   # Certbot logs
├── init-letsencrypt.sh         # Initial setup script
├── nginx.conf                  # Nginx config with SSL
└── docker compose.yaml         # Includes certbot service
```

## Security Notes

- Private keys are stored in `certbot/conf/` and are **gitignored**
- Never commit the `certbot/` directory to version control
- Certificates are automatically renewed before expiration
- Modern SSL/TLS configuration is used (TLS 1.2+)

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
