const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const storeTokens = (accessToken: string, refreshToken: string) => {
    try {
        localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
        console.error("Lỗi khi lưu token:", error);
        throw new Error("Không thể lưu phiên đăng nhập.");
    }
};

export const getAccessToken = (): string | null => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
        console.error("Lỗi khi lấy access token:", error);
        return null;
    }
};

export const getRefreshToken = (): string | null => {
    try {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
        console.error("Lỗi khi lấy refresh token:", error);
        return null;
    }
};

export const clearTokens = () => {
    try {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);

        window.dispatchEvent(new Event("auth-logout"));
    } catch (error) {
        console.error("Lỗi khi xóa token:", error);
    }
};

export const isAuthenticated = (): boolean => {
    return !!getAccessToken();
}; 