# Security Guidelines for Claude Code UI

## Overview

This document outlines security considerations and best practices for deploying and using Claude Code UI.

## ⚠️ Important Security Considerations

### 1. Authentication & Authorization

- **Single User System**: This application is designed as a single-user system. The first user to register becomes the sole user.
- **JWT Tokens**: Tokens expire after 30 days. Store them securely and never share them.
- **Strong Passwords**: Use a strong, unique password for your account.
- **Login Rate Limiting**: Login attempts are limited to 5 attempts per 15 minutes per IP to prevent brute force attacks
- **Account Locking**: After 5 failed login attempts, the account is locked for 30 minutes

### 2. Environment Variables

**Critical**: Always set these environment variables in production:

```bash
# Generate a strong JWT secret
JWT_SECRET=$(openssl rand -hex 32)

# Optional: Add API key for additional protection
API_KEY=$(openssl rand -hex 16)
```

Never use the default JWT secret in production!

### 3. File System Access

The application restricts file access to project directories only. However:
- Be cautious when opening projects containing sensitive data
- Regularly review which projects are accessible through the UI
- Consider file system permissions at the OS level for additional protection

### 4. Network Security

- **HTTPS**: Always use HTTPS in production
- **Firewall**: Restrict access to the application port
- **CORS**: Configure CORS appropriately for your deployment

### 5. Claude CLI Integration

- Tool permissions are disabled by default
- Review and enable only necessary tools
- Be cautious with the `--dangerously-skip-permissions` flag
- Monitor Claude CLI activity through logs

## Deployment Recommendations

### For Local Use

1. Bind to localhost only:
   ```bash
   PORT=3002 npm start  # Binds to 0.0.0.0 by default
   ```

2. Use a firewall to block external access

### For Remote Access

1. Use a reverse proxy (nginx, Apache) with SSL
2. Implement rate limiting
3. Add IP whitelisting if possible
4. Enable access logs and monitor them

### Example nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Rate limiting
        limit_req zone=appzone burst=10 nodelay;
    }
}
```

## Security Checklist

Before deploying to production:

- [ ] Changed JWT_SECRET from default
- [ ] Set strong admin password
- [ ] Configured HTTPS/SSL
- [ ] Restricted network access appropriately
- [ ] Reviewed and limited Claude tool permissions
- [ ] Enabled appropriate logging
- [ ] Tested file access restrictions
- [ ] Configured regular backups

## Reporting Security Issues

If you discover a security vulnerability, please report it to the maintainers privately. Do not create public issues for security vulnerabilities.

## Updates

Keep the application updated to receive security patches:

```bash
git pull origin main
npm install
npm run build
```

Review the changelog for security-related updates.