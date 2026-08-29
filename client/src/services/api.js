import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// High-speed In-Memory Cache Storage
const memoryCache = new Map();

export const clearApiCache = (urlPattern) => {
  if (!urlPattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPattern)) {
      memoryCache.delete(key);
    }
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Mutating requests (POST/PUT/DELETE) automatically invalidate relevant cache
  const method = config.method?.toUpperCase();
  if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
    clearApiCache();
  }

  // In-Memory Fast Cache for GET requests
  if (method === 'GET' && config.useCache !== false) {
    const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
    const cached = memoryCache.get(cacheKey);
    const ttl = config.cacheTTL || 25000; // 25s default TTL

    if (cached && (Date.now() - cached.timestamp < ttl)) {
      config.adapter = () => Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (From Fast Cache)',
        headers: config.headers,
        config,
        request: {}
      });
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    const config = response.config;
    if (config.method?.toUpperCase() === 'GET' && config.useCache !== false && response.status === 200) {
      const cacheKey = `${config.url}_${JSON.stringify(config.params || {})}`;
      memoryCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
      // Only clear token and redirect if an authenticated session expired, NOT on a failed login attempt
      if (!isAuthEndpoint) {
        localStorage.removeItem('token');
        clearApiCache();
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
