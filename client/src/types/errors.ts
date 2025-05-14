/**
 * Type definitions for Error handling
 */

// Basic API error structure - used for standard error responses
export interface ApiError extends Error {
  statusCode?: number;
  data?: null | Record<string, unknown>;
  success?: boolean;
}

// Network error specific fields
export interface NetworkError extends ApiError {
  isNetworkError: boolean;
}

// Validation error with field-specific errors
export interface ValidationError extends ApiError {
  validationErrors?: Record<string, string[]>;
}

// Helper function to check if an error is of ApiError type
export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && 
         ('statusCode' in error || 'success' in error);
}

// Helper function to check if error is a network connection error
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof Error && 
         (error.message.includes('Network Error') || 
          error.message.includes('Failed to fetch') || 
          error.message.includes('network request failed'));
}

// Helper function to check if the error is a validation error
export function isValidationError(error: unknown): error is ValidationError {
  return isApiError(error) && 'validationErrors' in error;
}

// Create a standard error message from different error types
export function getErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
  }
  
  if (isValidationError(error) && error.validationErrors) {
    // Return the first validation error message
    const firstField = Object.keys(error.validationErrors)[0];
    return error.validationErrors[firstField][0];
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Đã xảy ra lỗi không xác định';
} 