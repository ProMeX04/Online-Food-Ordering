import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, storeTokens, clearTokens } from './auth';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

class AxiosClient {
    private static instance: AxiosClient;
    private axiosInstance: AxiosInstance;
    private isRefreshing = false;
    private failedQueue: Array<{ resolve: (token: string) => void; reject: (error: Error) => void }> = [];

    private constructor() {
        this.axiosInstance = axios.create({
            baseURL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        this.setupInterceptors();
    }

    public static getInstance(): AxiosClient {
        if (!AxiosClient.instance) {
            AxiosClient.instance = new AxiosClient();
        }
        return AxiosClient.instance;
    }

    public getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }

    private processQueue(error: Error | null, token: string | null): void {
        this.failedQueue.forEach(promise => {
            if (token) {
                promise.resolve(token);
            } else {
                promise.reject(error as Error);
            }
        });
        this.failedQueue = [];
    }

    private async refreshToken(): Promise<string | null> {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
            clearTokens();
            return null;
        }

        try {
            console.log('Đang thử làm mới token với refreshToken:', refreshToken);
            const refreshUrl = `${baseURL}/auth/refresh-token`;
            const response = await axios.post(refreshUrl, { refreshToken });

            // Lấy ra token mới từ nhiều dạng response có thể có
            const data = response.data;
            const newAccessToken = data.accessToken || data.token || data.data?.accessToken || data.data?.token;
            const newRefreshToken = data.refreshToken || data.data?.refreshToken || refreshToken;

            if (!newAccessToken) {
                console.error('Không nhận được access token mới');
                throw new Error('No access token received');
            }

            console.log('Nhận được token mới thành công:', { accessToken: newAccessToken });
            storeTokens(newAccessToken, newRefreshToken);
            return newAccessToken;
        } catch (error) {
            console.error('Làm mới token thất bại:', error);
            clearTokens();
            return null;
        }
    }

    private setupInterceptors(): void {
        // Request interceptor - thêm token vào header
        this.axiosInstance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const token = getAccessToken();
                if (token) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error: AxiosError) => Promise.reject(error)
        );

        // Response interceptor - xử lý refresh token khi 401
        this.axiosInstance.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                if (!error.config) {
                    return Promise.reject({
                        success: false,
                        message: 'Request configuration error',
                        statusCode: 500
                    });
                }

                const originalRequest = error.config as ExtendedAxiosRequestConfig;
                const status = error.response?.status;

                // Xử lý refresh token cho lỗi 401
                if (
                    status === 401 &&
                    !originalRequest._retry &&
                    !originalRequest.url?.includes('/auth/login') &&
                    !originalRequest.url?.includes('/auth/refresh-token')
                ) {
                    originalRequest._retry = true;

                    if (this.isRefreshing) {
                        return new Promise((resolve, reject) => {
                            this.failedQueue.push({ resolve, reject });
                        })
                            .then(token => {
                                originalRequest.headers = originalRequest.headers || {};
                                originalRequest.headers.Authorization = `Bearer ${token}`;
                                return this.axiosInstance(originalRequest);
                            })
                            .catch(err => Promise.reject(err));
                    }

                    this.isRefreshing = true;
                    try {
                        const newAccessToken = await this.refreshToken();
                        this.isRefreshing = false;

                        if (!newAccessToken) {
                            this.processQueue(new Error('Failed to refresh token'), null);
                            throw new Error('Failed to refresh token');
                        }

                        this.processQueue(null, newAccessToken);

                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return this.axiosInstance(originalRequest);
                    } catch (refreshError) {
                        this.isRefreshing = false;
                        clearTokens();
                        console.error('Xác thực thất bại, chuyển hướng đến trang đăng nhập');
                        window.location.href = '/login';
                        return Promise.reject({
                            success: false,
                            message: 'Authentication failed',
                            statusCode: 401
                        });
                    }
                }

                // Chuẩn hóa lỗi trả về
                const errorMessage =
                    error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data
                        ? (error.response.data as { message: string }).message
                        : error.message || 'An unexpected error occurred';

                return Promise.reject({
                    success: false,
                    message: errorMessage,
                    statusCode: error.response?.status || 500
                });
            }
        );
    }
}

const axiosClient = AxiosClient.getInstance().getAxiosInstance();

export const get = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.get<T>(url, config);
    return response.data;
};

export const post = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.post<T>(url, data, config);
    return response.data;
};

export const put = async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.put<T>(url, data, config);
    return response.data;
};

export const del = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await axiosClient.delete<T>(url, config);
    return response.data;
};

export const upload = async <T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig & { onUploadProgress?: (progressEvent: ProgressEvent) => void }
): Promise<T> => {
    const response = await axiosClient.post<T>(url, formData, {
        ...config,
        headers: {
            ...config?.headers,
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export default axiosClient; 