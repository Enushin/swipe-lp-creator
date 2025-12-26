// Firebase exports
export {
  auth,
  db,
  storage,
  getAuthInstance,
  getDbInstance,
  getStorageInstance,
} from "./config";
export { default as firebase } from "./config";

// Re-export common Firebase types
export type { User as FirebaseUser } from "firebase/auth";
export type {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QuerySnapshot,
  QueryDocumentSnapshot,
} from "firebase/firestore";
