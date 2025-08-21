import { useState, useCallback, useEffect } from 'react';
import { rateLimitInterceptor, RateLimitInfo } from '../utils/fetchInterceptor';

export const useRateLimit = () => {
  const [rateLimit, setRateLimit] = useState<RateLimitInfo>({
    isLimited: false,
    retryAfter: null,
    message: ''
  });

  useEffect(() => {
    const handleRateLimit = (info: RateLimitInfo) => {
      setRateLimit(info);

      if (info.retryAfter) {
        setTimeout(() => {
          setRateLimit({
            isLimited: false,
            retryAfter: null,
            message: ''
          });
        }, info.retryAfter * 1000);
      }
    };

    rateLimitInterceptor.onRateLimit(handleRateLimit);

    return () => {
    };
  }, []);

  const resetRateLimit = useCallback(() => {
    setRateLimit({
      isLimited: false,
      retryAfter: null,
      message: ''
    });
  }, []);

  return {
    rateLimit,
    resetRateLimit
  };
};