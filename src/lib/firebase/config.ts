import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

function getEnvVar(key: string): string {
  const value = process.env[key];
  if (!value) {
    // In development/build time, we allow missing env vars
    // They will be required at runtime
    if (typeof window === "undefined") {
      return "";
    }
    console.warn(`Missing environment variable: ${key}`);
    return "";
  }
  return value;
}

const firebaseConfig = {
  apiKey: getEnvVar("NEXT_PUBLIC_FIREBASE_API_KEY"),
  authDomain: getEnvVar("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnvVar("NEXT_PUBLIC_FIREBASE_PROJECT_ID"),
  storageBucket: getEnvVar("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnvVar("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnvVar("NEXT_PUBLIC_FIREBASE_APP_ID"),
  measurementId: getEnvVar("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"),
};

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (app) return app;

  if (getApps().length > 0) {
    app = getApp();
    return app;
  }

  // Only initialize if we have the required config
  if (firebaseConfig.apiKey && firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
    return app;
  }

  throw new Error(
    "Firebase configuration is missing. Please set the required environment variables."
  );
}

export function getAuthInstance(): Auth {
  if (authInstance) return authInstance;
  authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getDbInstance(): Firestore {
  if (dbInstance) return dbInstance;
  dbInstance = getFirestore(getFirebaseApp());
  return dbInstance;
}

export function getStorageInstance(): FirebaseStorage {
  if (storageInstance) return storageInstance;
  storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}

// Lazy-loaded exports for tree-shaking
export const auth = {
  get instance(): Auth {
    return getAuthInstance();
  },
};

export const db = {
  get instance(): Firestore {
    return getDbInstance();
  },
};

export const storage = {
  get instance(): FirebaseStorage {
    return getStorageInstance();
  },
};

export default {
  getApp: getFirebaseApp,
  getAuth: getAuthInstance,
  getDb: getDbInstance,
  getStorage: getStorageInstance,
};
