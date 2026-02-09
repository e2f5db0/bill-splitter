# Domain Configuration Guide

## Overview

The Bill Splitter application uses a parameterized domain configuration system that eliminates the need to manually edit configuration files. The domain name is set once in the `.env` file, and the setup script automatically generates the necessary configuration files.

## How It Works

### 1. Domain Name Storage
The domain name is stored in `backend/.env` as the `DOMAIN_NAME` variable:

```bash
DOMAIN_NAME=your-domain.com
```

### 2. Nginx Configuration Template
The `nginx.conf.template` file contains placeholders for the domain name:

```nginx
server_name ${DOMAIN_NAME};
ssl_certificate /etc/letsencrypt/live/${DOMAIN_NAME}/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/${DOMAIN_NAME}/privkey.pem;
```

### 3. Automatic Generation
When you run `./setup-prod.sh`, the script:
1. Reads `DOMAIN_NAME` from `backend/.env`
2. Uses `envsubst` to replace `${DOMAIN_NAME}` placeholders in `nginx.conf.template`
3. Generates `nginx.conf` with your actual domain name
4. The generated `nginx.conf` is used by the Docker nginx container

## Setup Instructions

### For New Projects

1. **Copy the example environment file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit `backend/.env` and set your domain:**
   ```bash
   DOMAIN_NAME=example.com
   ```
   
   Replace `example.com` with your actual domain name.

3. **Configure other environment variables** (database credentials, secrets, etc.)

4. **Run the setup script:**
   ```bash
   ./setup-prod.sh
   ```
   
   The script will automatically generate `nginx.conf` with your domain name.

### For Existing Projects

If you're updating an existing project:

1. **Add the domain name to your `backend/.env` file:**
   ```bash
   echo "DOMAIN_NAME=your-domain.com" >> backend/.env
   ```

2. **Run the setup script:**
   ```bash
   ./setup-prod.sh
   ```
   
   The script will generate a new `nginx.conf` from the template.

## Changing Your Domain Name

To change your domain name:

1. **Update `backend/.env`:**
   ```bash
   DOMAIN_NAME=new-domain.com
   ```

2. **Regenerate the configuration:**
   ```bash
   ./setup-prod.sh
   ```

3. **If you already have SSL certificates**, you'll need to obtain new ones for the new domain:
   ```bash
   ./init-letsencrypt.sh
   ```

## File Structure

```
bill-splitter/
├── nginx.conf.template    # Template with ${DOMAIN_NAME} placeholders
├── nginx.conf             # Generated file (not in git)
├── setup-prod.sh          # Generates nginx.conf from template
└── backend/
    └── .env               # Contains DOMAIN_NAME variable
```

## Important Notes

### Git Tracking
- `nginx.conf.template` is tracked in git (contains placeholders)
- `nginx.conf` is **NOT** tracked in git (generated file, contains actual domain)
- This prevents accidentally committing your domain name to the repository

### Environment Variables
The `DOMAIN_NAME` variable is only used during setup to generate configuration files. It is not used at runtime by the application.

### Multiple Domains
If you need to support multiple domains or subdomains:

1. Edit `nginx.conf.template` to add additional `server_name` entries
2. Update the SSL certificate generation in `init-letsencrypt.sh` to include all domains

Example for multiple domains:
```nginx
server_name ${DOMAIN_NAME} www.${DOMAIN_NAME};
```

## Troubleshooting

### Error: "DOMAIN_NAME is not set in backend/.env"
**Solution:** Add `DOMAIN_NAME=your-domain.com` to your `backend/.env` file.

### Error: "nginx.conf.template not found"
**Solution:** Ensure you're running the setup script from the project root directory and that `nginx.conf.template` exists.

### Nginx fails to start after changing domain
**Solution:** 
1. Check that `nginx.conf` was regenerated correctly
2. Verify the domain name doesn't have typos
3. If using SSL, ensure certificates exist for the new domain

### envsubst command not found
**Solution:** Install `gettext` package:
- Ubuntu/Debian: `sudo apt-get install gettext`
- macOS: `brew install gettext`
- Alpine Linux: `apk add gettext`

## Advanced Configuration

### Custom Template Modifications
If you need to customize the nginx configuration:

1. Edit `nginx.conf.template` (not `nginx.conf`)
2. Use `${DOMAIN_NAME}` placeholder where needed
3. Run `./setup-prod.sh` to regenerate `nginx.conf`

### Manual Generation
If you need to manually regenerate `nginx.conf`:

```bash
# Load environment variables
source backend/.env

# Generate nginx.conf
export DOMAIN_NAME
envsubst '${DOMAIN_NAME}' < nginx.conf.template > nginx.conf
```

## See Also

- [SSL Setup Guide](SSL_SETUP.md) - Setting up HTTPS with Let's Encrypt
- [Password Setup Guide](PASSWORD_SETUP.md) - Configuring login authentication
- [README.md](../README.md) - General project documentation
