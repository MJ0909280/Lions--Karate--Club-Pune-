import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDoc, runTransaction, collection, query, where, getDocs } from 'firebase/firestore';

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
  useFetchStreams: false,
  experimentalLongPollingOptions: {
    useFetchStreams: false
  }
} as any, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth();

export async function checkFirestoreConnection(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  try {
    // Attempting to read a public document path with getDoc (seamless offline fallback support)
    await getDoc(doc(db, 'settings', 'connection_ping_test'));
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

export async function triggerWhatsAppNotification(type: 'admission' | 'inquiry', data: {
  fullName: string;
  phone: string;
  batch?: string;
  branch?: string;
  parentName?: string;
}) {
  try {
    const { getDoc, doc } = await import('firebase/firestore');
    const snap = await getDoc(doc(db, 'settings', 'whatsapp'));
    if (!snap.exists()) {
      console.log("WhatsApp notifications: No configurations loaded from settings/whatsapp.");
      return;
    }
    const config = snap.data();
    if (!config.enabled || !config.phoneNumber || !config.apiKey) {
      console.log("WhatsApp notifications: Auto-alerts are disabled or configuration is incomplete.", config);
      return;
    }

    // Clean up phone number
    const cleanPhone = config.phoneNumber.replace(/[+\s-]/g, '');

    // Format professional WhatsApp message with emojis and bullet points
    let message = "";
    if (type === 'admission') {
      message = `🥋 LIONS KARATE CLUB PUNE 🥋\n\n` +
                `🔥 New Student Admission Form Filed! 🔥\n\n` +
                `👤 Name: ${data.fullName}\n` +
                `📞 Phone: ${data.phone}\n` +
                `📅 Batch: ${data.batch || 'Not Specified'}\n` +
                `🏢 Branch: ${data.branch || 'Not Specified'}\n` +
                `👪 Parent/Guardian: ${data.parentName || 'Not Specified'}\n\n` +
                `A new student registry has been added to some database lists! Please administrative login to manage and assign Shihan belts! 🏆`;
    } else {
      message = `🥋 LIONS KARATE CLUB PUNE 🥋\n\n` +
                `💡 New Quick Practice Inquiry Recieved! 💡\n\n` +
                `👤 name: ${data.fullName}\n` +
                `📞 Phone: ${data.phone}\n` +
                `📅 Age Batch: ${data.batch || 'Not Specified'}\n` +
                `🏢 Branch Dojo: ${data.branch || 'Not Specified'}\n\n` +
                `Coaches please connect immediately to organize trial sessions! 🐆`;
    }

    const encodedMessage = encodeURIComponent(message);
    const callmebotUrl = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMessage}&apikey=${config.apiKey}`;

    // Simple GET call to CallMeBot, mode 'no-cors' to avoid browser origins blocking background triggers
    await fetch(callmebotUrl, { mode: 'no-cors' });
    console.log(`WhatsApp background notification dispatched successfully via CallMeBot!`);
  } catch (error) {
    console.warn("Failed sending WhatsApp automatic alert:", error);
  }
}

/**
 * Generates a unique, strictly sequential student ID (e.g. LKCP-2026-142)
 * using a centralized atomic transaction in Firestore.
 * Prevents identical IDs from being generated even during parallel enrollments!
 */
export async function generateSequentialStudentId(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const counterDocRef = doc(db, 'settings', `counters_${currentYear}`);
  
  // 1. Dynamic scan across both admissions AND exams collections to find the absolute highest serial number in use
  let maxDbSerial = 99;
  try {
    const admissionsRef = collection(db, 'admissions');
    const admSnap = await getDocs(admissionsRef);
    admSnap.forEach((doc) => {
      const data = doc.data();
      if (data.studentId && typeof data.studentId === 'string') {
        const cleanId = data.studentId.toUpperCase().trim();
        const parts = cleanId.split('-');
        if (parts.length === 3 && parts[0] === 'LKCP' && parts[1] === String(currentYear)) {
          const serial = parseInt(parts[2], 10);
          if (!isNaN(serial) && serial > maxDbSerial) {
            maxDbSerial = serial;
          }
        }
      }
    });

    const examsRef = collection(db, 'exams');
    const examSnap = await getDocs(examsRef);
    examSnap.forEach((doc) => {
      const data = doc.data();
      if (data.studentId && typeof data.studentId === 'string') {
        const cleanId = data.studentId.toUpperCase().trim();
        const parts = cleanId.split('-');
        if (parts.length === 3 && parts[0] === 'LKCP' && parts[1] === String(currentYear)) {
          const serial = parseInt(parts[2], 10);
          if (!isNaN(serial) && serial > maxDbSerial) {
            maxDbSerial = serial;
          }
        }
      }
    });
  } catch (err) {
    console.warn("Dynamic database serial scan failed, using safe baseline 99:", err);
  }

  // 2. Run transaction to atomically fetch, compare and increment the counter
  try {
    const studentId = await runTransaction(db, async (transaction) => {
      const counterSnap = await transaction.get(counterDocRef);
      let counterSerial = 99;
      
      if (counterSnap.exists()) {
        counterSerial = counterSnap.data().lastSerial || 99;
      }
      
      // The new serial must be strictly greater than both the db maximum and the recorded counter
      const nextSerial = Math.max(maxDbSerial, counterSerial) + 1;
      
      transaction.set(counterDocRef, { lastSerial: nextSerial }, { merge: true });
      return `LKCP-${currentYear}-${String(nextSerial).padStart(3, '0')}`;
    });
    
    return studentId;
  } catch (error) {
    console.error("Transaction failed to generate unique ID, using safe fallback:", error);
    const randomId = Math.floor(100 + Math.random() * 900);
    const ts = Date.now().toString().slice(-4);
    return `LKCP-${currentYear}-${randomId}-${ts}`;
  }
}

