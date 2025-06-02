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


export type FunctionResponse = {
    name: string;
    response: any;
    responseType: string;
}

export type AIResponse = {
    text: string;
    functionResponse: FunctionResponse[];
}