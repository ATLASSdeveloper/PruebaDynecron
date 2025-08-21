import React, { useEffect, useState } from 'react';
import { RateLimitNotificationProps } from '../types/rateLimitNotificationProps';

const RateLimitNotification: React.FC<RateLimitNotificationProps> = ({
  isVisible,
  message,
  retryAfter,
  onClose
}) => {
  const [countdown, setCountdown] = useState<number>(retryAfter || 0);

  useEffect(() => {
    if (isVisible && retryAfter) {
      setCountdown(retryAfter);
      
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible, retryAfter, onClose]);

  if (!isVisible) return null;

  return (
    <div className="rate-limit-notification">
      <div className="rate-limit-content">
        <h3>⏰ Límite de Solicitudes</h3>
        <p>{message}</p>
        {retryAfter && (
          <p className="countdown">
            Puede intentar nuevamente en: {countdown}s
          </p>
        )}
        <button onClick={onClose} className="close-btn">
          Entendido
        </button>
      </div>
    </div>
  );
};

export default RateLimitNotification;