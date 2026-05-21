import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ref, set, remove, get } from 'firebase/database';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  getPendingActions, clearOfflineAction, getPendingUploads,
  clearPendingUpload, clearAllOfflineActions
} from '../lib/indexeddb';
import { uploadToCloudinary } from '../lib/cloudinary';
import { SyncStatus } from '../types';

interface SyncContextType {
  syncStatus: SyncStatus;
  isOnline: boolean;
  pendingCount: number;
  triggerSync: () => Promise<void>;
}

const SyncContext = createContext<SyncContextType | null>(null);

export function useSync() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be within SyncProvider');
  return ctx;
}

export function SyncProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(navigator.onLine ? 'synced' : 'offline');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('pending');
      triggerSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const actions = await getPendingActions();
      const uploads = await getPendingUploads();
      setPendingCount(actions.length + uploads.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const triggerSync = useCallback(async () => {
    if (!currentUser || !navigator.onLine) return;
    setSyncStatus('syncing');

    try {
      // Sync offline actions
      const actions = await getPendingActions();
      for (const action of actions) {
        try {
          const path = `${action.collection}/${currentUser.uid}/${action.data.id || action.data.subjectId || action.data.assignmentId}`;
          const refNode = ref(db, path);

          if (action.type === 'delete') {
            await remove(refNode);
          } else {
            await set(refNode, action.data);
          }
          await clearOfflineAction(action.id);
        } catch (e) {
          console.error('Sync action failed:', e);
        }
      }

      // Sync pending uploads
      const pendingUploads = await getPendingUploads();
      for (const upload of pendingUploads) {
        try {
          const result = await uploadToCloudinary(upload.file, upload.fileName);
          // Update assignment with the uploaded URL if needed
          if (upload.assignmentId) {
            const uploadRef = ref(db, `uploads/${currentUser.uid}/${upload.id}`);
            await set(uploadRef, {
              uploadId: upload.id,
              fileName: upload.fileName,
              url: result.secure_url,
              publicId: result.public_id,
              createdAt: upload.timestamp,
              userId: currentUser.uid,
            });
          }
          await clearPendingUpload(upload.id);
        } catch (e) {
          console.error('Upload sync failed:', e);
        }
      }

      setPendingCount(0);
      setSyncStatus('synced');
    } catch (e) {
      console.error('Sync failed:', e);
      setSyncStatus('failed');
    }
  }, [currentUser]);

  return (
    <SyncContext.Provider value={{ syncStatus, isOnline, pendingCount, triggerSync }}>
      {children}
    </SyncContext.Provider>
  );
}
