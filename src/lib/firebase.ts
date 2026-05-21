import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyA7MctYf3RK7eAqZ9cXMW3sc0bn-yrIPFE",
  authDomain: "acadex-a0f5b.firebaseapp.com",
  projectId: "acadex-a0f5b",
  storageBucket: "acadex-a0f5b.firebasestorage.app",
  messagingSenderId: "55379558760",
  appId: "1:55379558760:web:702ca7ff3e40fcb92956dd",
  measurementId: "G-DXKWS7MSJF",
  databaseURL: "https://acadex-a0f5b-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);

// FCM messaging — only works in browsers that support it (not Safari < 16, not Node)
// Use getMessagingInstance() helper rather than calling getMessaging() directly at module load,
// because getMessaging() throws in unsupported environments.
let _messaging: ReturnType<typeof getMessaging> | null = null;

export async function getMessagingInstance() {
  if (_messaging) return _messaging;
  const supported = await isSupported();
  if (!supported) return null;
  _messaging = getMessaging(app);
  return _messaging;
}

export default app;