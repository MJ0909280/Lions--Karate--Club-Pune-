import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Embedded Firebase credentials so the ZIP download & Vercel deployment work instantly
const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || "AIzaSyAnmwufw2XWibN1-kXA0ipm8gOH2UxsUtQ",
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0852121768.firebaseapp.com",
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0852121768",
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0852121768.firebasestorage.app",
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "427557354151",
  appId: metaEnv.VITE_FIREBASE_APP_ID || "1:427557354151:web:c4ecd823051003f6943982",
  measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "",
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || "ai-studio-baab1072-c05e-471a-891d-ef9f81c21754"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with Database ID from configuration, long polling and disabled fetch streams for iframe compatibility
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
} as any, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth();

export async function checkFirestoreConnection(): Promise<boolean> {
  try {
    // Attempting to read a public document path. 
    await getDocFromServer(doc(db, 'settings', 'connection_ping_test'));
    return true;
  } catch (error: any) {
    // If we get permission-denied or similar, the client successfully reached Firestore!
    const errStr = error instanceof Error ? error.message : String(error);
    if (
      errStr.includes('permission-denied') || 
      errStr.includes('PERMISSION_DENIED') || 
      (error && error.code === 'permission-denied')
    ) {
      return true;
    }
    return false;
  }
}

async function testConnection() {
  try {
    await checkFirestoreConnection();
  } catch (error) {
    console.warn("Firestore initialization status check warning:", error);
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
