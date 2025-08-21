// src/utils/fetchInterceptor.ts
export interface RateLimitInfo {
  isLimited: boolean;
  retryAfter: number | null;
  message: string;
}

class RateLimitInterceptor {
  private static instance: RateLimitInterceptor;
  private rateLimitCallbacks: ((info: RateLimitInfo) => void)[] = [];

  private constructor() {}

  static getInstance(): RateLimitInterceptor {
    if (!RateLimitInterceptor.instance) {
      RateLimitInterceptor.instance = new RateLimitInterceptor();
    }
    return RateLimitInterceptor.instance;
  }

  async intercept<T>(fetchCall: Promise<Response>): Promise<T> {
    try {
      const response = await fetchCall;
      
      if (response.status === 429) {
        const retryAfter = response.headers.get('retry-after');
        this.notifyRateLimit(
          retryAfter ? parseInt(retryAfter) : null
        );
        throw new Error('RATE_LIMIT_EXCEEDED');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  onRateLimit(callback: (info: RateLimitInfo) => void): void {
    this.rateLimitCallbacks.push(callback);
  }

  private notifyRateLimit(retryAfter: number | null): void {
    const message = retryAfter 
      ? `Límite de solicitudes excedido. Espere ${retryAfter} segundos`
      : 'Límite de solicitudes excedido. Por favor espere.';

    this.rateLimitCallbacks.forEach(callback => 
      callback({ isLimited: true, retryAfter, message })
    );
  }
}

export const rateLimitInterceptor = RateLimitInterceptor.getInstance();