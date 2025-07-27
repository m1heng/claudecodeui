# Cross-Domain Deployment Guide

This guide explains how to deploy the Claude Code UI with frontend and backend on different domains.

## Overview

The application supports flexible deployment configurations:
- **Same Domain**: Frontend and backend on the same domain (default)
- **Different Ports**: Frontend and backend on same domain but different ports
- **Different Domains**: Frontend and backend on completely different domains

## Configuration

### Frontend Configuration

1. **Create environment file**:
   ```bash
   cp .env.frontend.example .env
   ```

2. **Set the backend API URL** in `.env`:
   ```env
   # For different port on same domain
   VITE_API_BASE_URL=http://localhost:3002

   # For different domain
   VITE_API_BASE_URL=https://api.example.com

   # For same domain (leave empty)
   VITE_API_BASE_URL=
   ```

3. **Build the frontend**:
   ```bash
   npm run build
   ```

### Backend Configuration

1. **Update `.env` file** with CORS settings:
   ```env
   # Allow specific origins
   CORS_ORIGINS=https://app.example.com,https://www.example.com

   # Or allow all origins (not recommended for production)
   CORS_ORIGINS=*
   ```

2. **Start the backend**:
   ```bash
   npm run server
   ```

## Deployment Scenarios

### Scenario 1: Different Ports (Development)

**Frontend**: `http://localhost:3001`  
**Backend**: `http://localhost:3002`

```env
# Frontend .env
VITE_API_BASE_URL=http://localhost:3002

# Backend .env
CORS_ORIGINS=http://localhost:3001
```

### Scenario 2: Subdomain Setup

**Frontend**: `https://app.example.com`  
**Backend**: `https://api.example.com`

```env
# Frontend .env
VITE_API_BASE_URL=https://api.example.com

# Backend .env
CORS_ORIGINS=https://app.example.com
```

### Scenario 3: Completely Different Domains

**Frontend**: `https://myapp.com`  
**Backend**: `https://api-service.net`

```env
# Frontend .env
VITE_API_BASE_URL=https://api-service.net

# Backend .env
CORS_ORIGINS=https://myapp.com
```

## Security Considerations

1. **CORS Origins**:
   - Always specify exact origins in production
   - Avoid using `*` (wildcard) in production
   - Include protocol (http/https) in origin URLs

2. **HTTPS**:
   - Use HTTPS for both frontend and backend in production
   - WebSocket will automatically use WSS when HTTPS is detected

3. **Authentication**:
   - JWT tokens are sent in Authorization headers
   - Cookies are not used for cross-domain compatibility

## Nginx Configuration Examples

### Frontend Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name app.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/claudecodeui/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Backend Nginx Config
```nginx
server {
    listen 443 ssl http2;
    server_name api.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Headers for proper proxying
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. **Check backend logs** for CORS rejection messages
2. **Verify CORS_ORIGINS** includes your frontend URL
3. **Ensure protocol matches** (http vs https)
4. **Check for trailing slashes** in URLs

### WebSocket Connection Issues

1. **Verify WebSocket URL** in browser DevTools
2. **Check authentication token** is being sent
3. **Ensure CORS allows WebSocket origin**
4. **Verify nginx/proxy WebSocket headers**

### API Connection Issues

1. **Test API directly** using curl or Postman
2. **Check network tab** in browser DevTools
3. **Verify API base URL** in frontend config
4. **Check for mixed content** (HTTP/HTTPS)

## Environment Variables Reference

### Frontend Variables
- `VITE_API_BASE_URL`: Backend API base URL (optional)
- `VITE_PORT`: Development server port

### Backend Variables
- `PORT`: Backend server port
- `CORS_ORIGINS`: Comma-separated list of allowed origins
- `JWT_SECRET`: Secret for JWT signing
- `API_KEY`: Optional API key for additional security

## Best Practices

1. **Use environment-specific configs**: Different `.env` files for dev/staging/prod
2. **Secure sensitive data**: Never commit `.env` files
3. **Monitor CORS logs**: Watch for rejected origins in production
4. **Use HTTPS everywhere**: Especially for authentication
5. **Set proper headers**: Security headers in nginx/proxy configuration