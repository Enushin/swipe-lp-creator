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
import { getAuthInstance } from "./config";

export type AuthUser = User;

export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<UserCredential> {
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
  const auth = getAuthInstance();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signOut(): Promise<void> {
  const auth = getAuthInstance();
  return firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getAuthInstance();
  return sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthState(
  callback: (user: User | null) => void
): () => void {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  const auth = getAuthInstance();
  return auth.currentUser;
}
