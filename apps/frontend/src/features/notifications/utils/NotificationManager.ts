import axios from 'axios';

const VAPID_PUBLIC_KEY = "BJMJXMej3g8-Z6dXiGd8yanDrdkuZg8e3HjioBiDCP3SJ9QS7nhqy9QomWAL5GkokoveBi2bxmCTmA8bDXIajhM";

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const registerPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied');
      return;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to backend
    const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')!) as any));
    const auth = btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')!) as any));

    await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/push/subscribe`, {
      endpoint: subscription.endpoint,
      p256dh,
      auth
    }, { withCredentials: true });

    console.log('Successfully subscribed to Push Notifications');
  } catch (error) {
    console.error('Error during push subscription:', error);
  }
};
