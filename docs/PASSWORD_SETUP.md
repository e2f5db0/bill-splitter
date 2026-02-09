# Password Setup Guide

## Overview

The Bill Splitter application uses a secure password-based authentication system. The login password is hashed using bcrypt and stored as an environment variable, ensuring it's never exposed in the source code.

## Initial Setup

### Step 1: Install Dependencies

First, make sure you have the backend dependencies installed:

```bash
cd backend
npm install
```

### Step 2: Generate Password Hash

Run the password setup utility:

```bash
npm run setup-password
```

This interactive tool will:
1. Prompt you to enter a new password (minimum 8 characters recommended)
2. Ask you to confirm the password
3. Generate a bcrypt hash
4. Display the hash value to add to your `.env` file

### Step 3: Update Environment File

Copy the generated hash and add it to your `backend/.env` file:

```bash
LOGIN_PASSWORD_HASH=<generated-hash-here>
```

Or use the command provided by the utility to append it automatically:

```bash
echo "LOGIN_PASSWORD_HASH=<generated-hash>" >> backend/.env
```

**Note:** You may see a Docker Compose warning about undefined variables when starting the application. This is harmless and can be safely ignored - the bcrypt hash contains `$` characters that Docker Compose interprets as variable references, but since the variable is only used by the Node.js application (not Docker Compose), the authentication will work correctly.

### Step 4: Start the Application

Once the password hash is set, you can start the application:

```bash
# From the project root
./setup-dev.sh    # For development
# or
./setup-prod.sh   # For production
```

## Changing the Password

To change your login password at any time:

1. **Generate a new hash:**
   ```bash
   cd backend
   npm run setup-password
   ```

2. **Update the `.env` file:**
   Replace the existing `LOGIN_PASSWORD_HASH` value with the newly generated hash.

3. **Restart the backend service:**
   ```bash
   # If using Docker
   docker compose restart template-backend
   
   # If running manually
   # Stop the backend process (Ctrl+C) and restart it
   npm start
   ```

## Security Best Practices

### ✅ DO:
- Use a strong password (at least 8 characters, mix of letters, numbers, and symbols)
- Keep your `.env` file secure and never commit it to version control
- Change the password regularly
- Use different passwords for development and production environments
- Store production passwords in a secure password manager

### ❌ DON'T:
- Share your password or password hash with others
- Commit the `.env` file to Git (it's already in `.gitignore`)
- Use simple or common passwords
- Reuse passwords from other services
- Store passwords in plain text anywhere

## Troubleshooting

### "Server configuration error" when logging in

**Problem:** The backend cannot find the `LOGIN_PASSWORD_HASH` environment variable.

**Solution:**
1. Verify that `LOGIN_PASSWORD_HASH` is set in your `backend/.env` file
2. Make sure there are no typos in the variable name
3. Restart the backend service after adding the variable

### "Invalid credentials" when logging in

**Problem:** The password you entered doesn't match the stored hash.

**Possible causes:**
1. You're entering the wrong password
2. The hash in `.env` doesn't match the password you think you set
3. The `.env` file wasn't loaded properly

**Solution:**
1. Double-check your password
2. Generate a new password hash using `npm run setup-password`
3. Update the `.env` file with the new hash
4. Restart the backend service

### Password setup utility not working

**Problem:** The `npm run setup-password` command fails.

**Solution:**
1. Make sure you're in the `backend` directory
2. Verify that dependencies are installed: `npm install`
3. Check that `bcrypt` is installed: `npm list bcrypt`
4. Try running directly: `node util/setup-password.js`

### Docker Compose warning about unset variables

**Problem:** When running `docker compose up`, you see a warning like:
```
WARN[0000] The "HE4tLrwdMBwXa3DsKOPDOuIGTi6eRPNx7" variable is not set. Defaulting to a blank string.
```

**Cause:** Docker Compose interprets `$` characters in `.env` files as variable substitution markers. Bcrypt hashes contain `$` signs, which Docker Compose tries to interpret as variables.

**Solution:** This warning is **harmless and can be safely ignored**. The `LOGIN_PASSWORD_HASH` variable is only used by the Node.js application (via the `dotenv` package), not by Docker Compose itself. Your authentication will work correctly despite the warning.

**Why this happens:**
- Docker Compose scans the `.env` file and warns about any `$` characters it finds
- However, `LOGIN_PASSWORD_HASH` is not referenced in `docker-compose.yaml`
- The backend container reads the hash directly from the `.env` file using `dotenv`
- The hash is processed correctly by the application

**If you want to suppress the warning:**
You would need to escape the dollar signs (`$` → `$$`), but this will break authentication because `dotenv` doesn't unescape literal `$$` characters. Therefore, it's better to keep the hash with single `$` signs and ignore the Docker Compose warning.

## Technical Details

### How It Works

1. **Password Input:** User enters a password through the login form
2. **Hash Comparison:** The backend compares the entered password with the stored bcrypt hash
3. **Token Generation:** If the password matches, a JWT token is generated and returned
4. **Authentication:** The token is used for subsequent authenticated requests

### Bcrypt Configuration

- **Algorithm:** bcrypt
- **Salt Rounds:** 10 (provides a good balance between security and performance)
- **Hash Format:** Standard bcrypt hash format (`$2b$10$...`)

### Environment Variable

The password hash is stored in the `LOGIN_PASSWORD_HASH` environment variable, which is:
- Loaded from `backend/.env` using the `dotenv` package
- Never exposed in API responses
- Not logged or displayed anywhere in the application
- Excluded from version control via `.gitignore`

## Migration from Hardcoded Hash

If you're upgrading from a version that had a hardcoded password hash:

1. **Identify the old password:** If you know what the old password was, you can continue using it
2. **Generate a new hash:** Run `npm run setup-password` with your chosen password
3. **Update `.env`:** Add the `LOGIN_PASSWORD_HASH` variable to your `.env` file
4. **Remove old code:** The hardcoded hash has been removed from `backend/routes/index.js`
5. **Test:** Verify you can log in with the new password

## Support

If you encounter any issues with password setup or authentication:

1. Check this documentation for troubleshooting steps
2. Review the application logs for error messages
3. Verify your `.env` file configuration
4. Ensure all dependencies are properly installed

For additional help, please open an issue on the project repository.
