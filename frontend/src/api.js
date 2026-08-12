// api.js - Central API URL configuration
// Uses VITE_API_URL from .env file
// For local: http://localhost:3001
// For production: set VITE_API_URL in .env to your deployed server URL

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export default API_URL;
