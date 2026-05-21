import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Subject, Assignment, OfflineAction } from '../types';

interface AcadexDB extends DBSchema {
  subjects: {
    key: string;
    value: Subject;
    indexes: { 'by-user': string };
  };
  assignments: {
    key: string;
    value: Assignment;
    indexes: { 'by-user': string; 'by-subject': string };
  };
  offlineActions: {
    key: string;
    value: OfflineAction;
    indexes: { 'by-timestamp': number };
  };
  pendingUploads: {
    key: string;
    value: {
      id: string;
      file: Blob;
      fileName: string;
      fileType: string;
      assignmentId?: string;
      timestamp: number;
    };
  };
}

let dbInstance: IDBPDatabase<AcadexDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<AcadexDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<AcadexDB>('acadex-db', 2, {
    upgrade(db, oldVersion) {
      // Subjects store
      if (!db.objectStoreNames.contains('subjects')) {
        const subjectStore = db.createObjectStore('subjects', { keyPath: 'subjectId' });
        subjectStore.createIndex('by-user', 'userId');
      }

      // Assignments store
      if (!db.objectStoreNames.contains('assignments')) {
        const assignmentStore = db.createObjectStore('assignments', { keyPath: 'assignmentId' });
        assignmentStore.createIndex('by-user', 'userId');
        assignmentStore.createIndex('by-subject', 'subjectId');
      }

      // Offline actions queue
      if (!db.objectStoreNames.contains('offlineActions')) {
        const actionStore = db.createObjectStore('offlineActions', { keyPath: 'id' });
        actionStore.createIndex('by-timestamp', 'timestamp');
      }

      // Pending file uploads
      if (!db.objectStoreNames.contains('pendingUploads')) {
        db.createObjectStore('pendingUploads', { keyPath: 'id' });
      }
    },
  });

  return dbInstance;
}

// Subjects
export async function cacheSubjects(subjects: Subject[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('subjects', 'readwrite');
  await Promise.all(subjects.map(s => tx.store.put(s)));
  await tx.done;
}

export async function getCachedSubjects(userId: string): Promise<Subject[]> {
  const db = await getDB();
  return db.getAllFromIndex('subjects', 'by-user', userId);
}

export async function cacheSubject(subject: Subject): Promise<void> {
  const db = await getDB();
  await db.put('subjects', subject);
}

export async function deleteCachedSubject(subjectId: string): Promise<void> {
  const db = await getDB();
  await db.delete('subjects', subjectId);
}

// Assignments
export async function cacheAssignments(assignments: Assignment[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('assignments', 'readwrite');
  await Promise.all(assignments.map(a => tx.store.put(a)));
  await tx.done;
}

export async function getCachedAssignments(userId: string): Promise<Assignment[]> {
  const db = await getDB();
  return db.getAllFromIndex('assignments', 'by-user', userId);
}

export async function cacheAssignment(assignment: Assignment): Promise<void> {
  const db = await getDB();
  await db.put('assignments', assignment);
}

export async function deleteCachedAssignment(assignmentId: string): Promise<void> {
  const db = await getDB();
  await db.delete('assignments', assignmentId);
}

// Offline Actions Queue
export async function queueOfflineAction(action: OfflineAction): Promise<void> {
  const db = await getDB();
  await db.put('offlineActions', action);
}

export async function getPendingActions(): Promise<OfflineAction[]> {
  const db = await getDB();
  return db.getAllFromIndex('offlineActions', 'by-timestamp');
}

export async function clearOfflineAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('offlineActions', id);
}

export async function clearAllOfflineActions(): Promise<void> {
  const db = await getDB();
  await db.clear('offlineActions');
}

// Pending Uploads
export async function queuePendingUpload(upload: {
  id: string;
  file: Blob;
  fileName: string;
  fileType: string;
  assignmentId?: string;
  timestamp: number;
}): Promise<void> {
  const db = await getDB();
  await db.put('pendingUploads', upload);
}

export async function getPendingUploads() {
  const db = await getDB();
  return db.getAll('pendingUploads');
}

export async function clearPendingUpload(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pendingUploads', id);
}
