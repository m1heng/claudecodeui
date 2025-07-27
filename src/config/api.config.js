// API Configuration
// This file centralizes all API-related configuration

// Get API base URL from environment variable or use default
const getApiBaseUrl = () => {
  // In production, Vite replaces import.meta.env values at build time
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  
  if (envApiUrl) {
    // Remove trailing slash if present
    return envApiUrl.replace(/\/$/, '');
  }
  
  // Default to relative URLs (same domain)
  return '';
};

// Get WebSocket URL based on API URL
const getWebSocketUrl = () => {
  const apiUrl = getApiBaseUrl();
  
  if (!apiUrl) {
    // Same domain - use relative WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
  
  // Convert HTTP URL to WebSocket URL
  try {
    const url = new URL(apiUrl);
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return url.origin;
  } catch (error) {
    console.error('Invalid API URL:', apiUrl);
    // Fallback to same domain
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}`;
  }
};

export const API_BASE_URL = getApiBaseUrl();
export const WS_BASE_URL = getWebSocketUrl();

// Helper function to construct full API URLs
export const apiUrl = (path) => {
  if (!API_BASE_URL) {
    return path;
  }
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

// Helper function to construct full WebSocket URLs
export const wsUrl = (path) => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${WS_BASE_URL}${normalizedPath}`;
};

// Debug logging in development
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    API_BASE_URL,
    WS_BASE_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
  });
}