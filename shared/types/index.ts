export interface IApiResponse<T> {
    success: boolean;
    message?: string;
    data: T;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    total: number;
    page: number;
    limit: number;
}
