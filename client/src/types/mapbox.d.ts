declare module '@mapbox/mapbox-sdk/lib/classes/mapi-client';
declare module '@mapbox/mapbox-sdk/services/geocoding' {
  interface GeocodingService {
    forwardGeocode(options: {
      query: string;
      limit?: number;
      countries?: string[];
      language?: string[];
      [key: string]: unknown;
    }): { send: () => Promise<GeocodingResponse> };
    
    reverseGeocode(options: {
      query: [number, number];
      limit?: number;
      [key: string]: unknown;
    }): { send: () => Promise<GeocodingResponse> };
  }
  
  interface GeocodingResponse {
    body: {
      features: Array<{
        place_name: string;
        center: [number, number];
        [key: string]: unknown;
      }>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }
  
  export default function geocoding(client: unknown): GeocodingService;
}