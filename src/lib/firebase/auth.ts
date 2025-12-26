import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  User,
  UserCredential,
} from "firebase/auth";
import { getAuthInstance, isFirebaseConfigured } from "./config";

export type AuthUser = User;

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase is not configured. Please set the required environment variables."
    );
    this.name = "FirebaseNotConfiguredError";
  }
}

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }

  return userCredential;
}

export async function signIn(
  email: string,
  password: string
): Promise<UserCredential> {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  const auth = getAuthInstance();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  const auth = getAuthInstance();
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  if (!isFirebaseConfigured()) {
    throw new FirebaseNotConfiguredError();
  }
  const auth = getAuthInstance();
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  if (!isFirebaseConfigured()) {
    // Return a no-op unsubscribe function when Firebase is not configured
    callback(null);
    return () => {};
  }
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured()) {
    return null;
  }
  const auth = getAuthInstance();
  return auth.currentUser;
}

export { isFirebaseConfigured };
