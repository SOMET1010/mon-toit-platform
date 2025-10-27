import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// Configuration Firebase
// IMPORTANT: Remplacez ces valeurs par vos propres clés Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firebase Cloud Messaging
let messaging: ReturnType<typeof getMessaging> | null = null;

try {
  // Vérifier si on est dans un environnement qui supporte les notifications
  if (typeof window !== 'undefined' && 'Notification' in window) {
    messaging = getMessaging(app);
  }
} catch (error) {
  console.warn('Firebase Messaging not available:', error);
}

/**
 * Demander la permission pour les notifications push
 * et obtenir le token FCM
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return null;
  }

  try {
    // Demander la permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Obtenir le token FCM
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || 'YOUR_VAPID_KEY'
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Écouter les messages en temps réel (foreground)
 */
export const onMessageListener = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Firebase Messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Message received in foreground:', payload);
    callback(payload);
  });
};

/**
 * Sauvegarder le token FCM dans Supabase
 */
export const saveFCMToken = async (userId: string, token: string) => {
  try {
    // TODO: Implémenter la sauvegarde dans Supabase
    // await supabase.from('user_fcm_tokens').upsert({
    //   user_id: userId,
    //   fcm_token: token,
    //   updated_at: new Date().toISOString()
    // });
    
    console.log('FCM token saved for user:', userId);
  } catch (error) {
    console.error('Error saving FCM token:', error);
  }
};

export { app, messaging };

