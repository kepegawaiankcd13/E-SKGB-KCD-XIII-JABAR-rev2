import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  addDoc 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Pegawai, SystemSettings, ActivityLog, StaffUser } from "./types";

const firebaseConfig = {
  projectId: "silken-poetry-28gvj",
  appId: "1:182771938346:web:820077e02af5315308ff53",
  apiKey: "AIzaSyBjYysKPRArslLBm7kPe1csv6jZUO3-jK0",
  authDomain: "silken-poetry-28gvj.firebaseapp.com",
  storageBucket: "silken-poetry-28gvj.firebasestorage.app",
  messagingSenderId: "182771938346"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Use the assigned databaseId for Firestore
export const db = getFirestore(app, "ai-studio-0f674929-9ff2-4175-a1ac-aff948e7cfb7");
export const auth = getAuth(app);

// -------------------------------------------------------------
// FIRESTORE ERROR HANDLING UTILITIES
// -------------------------------------------------------------
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
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// -------------------------------------------------------------
// FIRESTORE SYNC HELPERS (with local fallbacks and proper error intercepts)
// -------------------------------------------------------------

// Helper to remove any undefined properties recursively to prevent Firestore write crashes
function cleanUndefined<T>(obj: T): T {
  if (Array.isArray(obj)) {
    return obj.map(v => cleanUndefined(v)) as unknown as T;
  } else if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => [k, cleanUndefined(v)])
    ) as unknown as T;
  }
  return obj;
}

// 1. Pegawai (Employees) Data Sync
export async function getPegawaiFromFirestore(): Promise<Pegawai[] | null> {
  const path = "pegawai";
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const list: Pegawai[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...docSnap.data(), id: docSnap.id } as Pegawai);
    });
    return list;
  } catch (error) {
    console.error("Error reading pegawai from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function savePegawaiToFirestore(pegawai: Pegawai): Promise<boolean> {
  const path = `pegawai/${pegawai.id}`;
  try {
    const docRef = doc(db, "pegawai", pegawai.id);
    const sanitized = cleanUndefined(pegawai);
    await setDoc(docRef, sanitized);
    return true;
  } catch (error) {
    console.error("Error saving pegawai to Firestore:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePegawaiFromFirestore(id: string): Promise<boolean> {
  const path = `pegawai/${id}`;
  try {
    const docRef = doc(db, "pegawai", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting pegawai from Firestore:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllPegawaiFromFirestore(): Promise<boolean> {
  const path = "pegawai";
  try {
    const colRef = collection(db, "pegawai");
    const snapshot = await getDocs(colRef);
    const deletePromises = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error("Error clearing all pegawai from Firestore:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// 2. Settings Sync
export async function getSettingsFromFirestore(): Promise<SystemSettings | null> {
  const path = "settings";
  try {
    const docRef = doc(db, "settings", "global");
    const snapshot = await getDocs(collection(db, "settings"));
    const globalDoc = snapshot.docs.find(d => d.id === "global");
    if (globalDoc) {
      return globalDoc.data() as SystemSettings;
    }
    return null;
  } catch (error) {
    console.error("Error loading settings from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveSettingsToFirestore(settings: SystemSettings): Promise<boolean> {
  const path = "settings/global";
  try {
    const docRef = doc(db, "settings", "global");
    await setDoc(docRef, settings);
    return true;
  } catch (error) {
    console.error("Error saving settings to Firestore:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 3. Activity Logs Sync
export async function getLogsFromFirestore(): Promise<ActivityLog[] | null> {
  const path = "activity_logs";
  try {
    const colRef = collection(db, path);
    const qSnapshot = await getDocs(colRef);
    const list: ActivityLog[] = [];
    qSnapshot.forEach((docSnap) => {
      list.push(docSnap.data() as ActivityLog);
    });
    // Sort descending by timestamp
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error("Error loading activity logs from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveLogToFirestore(log: ActivityLog): Promise<boolean> {
  const path = `activity_logs/${log.id}`;
  try {
    const docRef = doc(db, "activity_logs", log.id);
    await setDoc(docRef, log);
    return true;
  } catch (error) {
    console.error("Error saving log to Firestore:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 4. Staff Accounts Sync
export async function getStaffFromFirestore(): Promise<StaffUser[] | null> {
  const path = "staff_users";
  try {
    const colRef = collection(db, path);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return null;
    const list: StaffUser[] = [];
    snapshot.forEach((docSnap) => {
      list.push({ ...docSnap.data(), id: docSnap.id } as StaffUser);
    });
    return list;
  } catch (error) {
    console.error("Error loading staff from Firestore:", error);
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveStaffToFirestore(staff: StaffUser): Promise<boolean> {
  const path = `staff_users/${staff.id}`;
  try {
    const docRef = doc(db, "staff_users", staff.id);
    await setDoc(docRef, staff);
    return true;
  } catch (error) {
    console.error("Error saving staff to Firestore:", error);
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStaffFromFirestore(id: string): Promise<boolean> {
  const path = `staff_users/${id}`;
  try {
    const docRef = doc(db, "staff_users", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting staff from Firestore:", error);
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

