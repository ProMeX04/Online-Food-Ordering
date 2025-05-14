// Re-export từ auth.ts
export {
    storeTokens,
    getAccessToken,
    getRefreshToken,
    clearTokens,
    isAuthenticated
} from './auth';

export {
    get,
    post,
    put,
    del,
    upload,
    default as httpClient
} from './http-client';

export {
    api,
    default as apiService
} from './api';

export {
    formatCurrency,
    formatDate,
    truncateText,
    generateRandomCode,
    generateSlug,
    SHIPPING,
    STATUS_CODES,
    VALIDATION_MESSAGES,
    cn
} from './utils';

// Reexport ProtectedRoute component
export { ProtectedRoute } from './protected-route';

// Re-export từ env.ts
export {
    MAPBOX_ACCESS_TOKEN,
    API_URL,
    CONTACT_EMAIL,
    CONTACT_PHONE,
    CONTACT_ADDRESS,
    APP_NAME,
    APP_DESCRIPTION
} from './env';

// File index.ts như là file gốc, cho phép import tất cả từ một chỗ:
// import { api, formatCurrency, ProtectedRoute } from '@/lib'; 