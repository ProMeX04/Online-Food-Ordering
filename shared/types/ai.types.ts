import { Dish } from '@/types/schema';

export interface FunctionResponse {
    name: string;
    response: Dish[];
    responseType: string;
}

export interface AIResponse {
    text: string | null;
    functionResponses: FunctionResponse[];
} 