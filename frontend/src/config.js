/**
 * Application Configuration
 * 
 * Defines the backend API URL based on the environment.
 * VITE_API_URL can be set in a .env file for production.
 * Defaults to localhost:8000 for development.
 */
// Detect if we are running on localhost
const hostname = window.location.hostname;
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

// If VITE_API_URL is set, use it.
// Otherwise, if on localhost, use localhost:8000.
// If on production (VPS), use relative path (proxied by Nginx).
export const API_BASE_URL = import.meta.env.VITE_API_URL || (isLocalhost ? 'http://localhost:8000' : '');
