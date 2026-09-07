import axios from 'axios';
import { API_BASE_URL } from './config';

/**
 * Centralized API Client
 * 
 * Uses the configured API_BASE_URL.
 * Can be extended to handle auth tokens automatically in the future.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
export { API_BASE_URL };
