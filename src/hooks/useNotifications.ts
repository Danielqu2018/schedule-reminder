import { useCallback, useEffect, useState } from 'react';

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(
    (typeof window !== 'undefined' && 'Notification' in window) ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(setPermission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied' as NotificationPermission;
  }, []);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (typeof window !== 'undefined' && 'Notification' in window && permission === 'granted') {
      new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>',
        ...options,
      });
    }
    // 同时在 console 记录，方便调试
    console.log(`[Notification] ${title}: ${options?.body || ''}`);
  }, [permission]);

  return { permission, requestPermission, showNotification };
}
