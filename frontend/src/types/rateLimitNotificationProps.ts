export interface RateLimitNotificationProps {
  isVisible: boolean;
  message: string;
  retryAfter?: number | null;
  onClose: () => void;
}