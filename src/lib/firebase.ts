import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, enableLogging } from 'firebase/database';

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

export default app;
