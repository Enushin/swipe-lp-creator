import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  DocumentData,
  QueryConstraint,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getDbInstance } from "./config";
import type { LP, User as AppUser, UserLimits } from "@/types";

// Collection names
export const COLLECTIONS = {
  LPS: "lps",
  USERS: "users",
  AI_GENERATIONS: "ai_generations",
} as const;

// Helper to convert Firestore Timestamp to Date
export function timestampToDate(timestamp: Timestamp | Date): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return timestamp;
}

// LP Operations
export async function getLP(id: string): Promise<LP | null> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.LPS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  } as LP;
}

export async function getLPsByUser(userId: string): Promise<LP[]> {
  const db = getDbInstance();
  const lpsRef = collection(db, COLLECTIONS.LPS);
  const q = query(
    lpsRef,
    where("userId", "==", userId),
    orderBy("updatedAt", "desc")
  );
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: timestampToDate(data.createdAt),
      updatedAt: timestampToDate(data.updatedAt),
    } as LP;
  });
}

export async function createLP(
  lpData: Omit<LP, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const db = getDbInstance();
  const lpsRef = collection(db, COLLECTIONS.LPS);
  const docRef = await addDoc(lpsRef, {
    ...lpData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateLP(
  id: string,
  updates: Partial<Omit<LP, "id" | "createdAt">>
): Promise<void> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.LPS, id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLP(id: string): Promise<void> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.LPS, id);
  await deleteDoc(docRef);
}

// User Operations
export async function getUser(id: string): Promise<AppUser | null> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.USERS, id);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
  } as AppUser;
}

export async function createUser(
  id: string,
  userData: Omit<AppUser, "id" | "createdAt">
): Promise<void> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.USERS, id);
  await updateDoc(docRef, {
    ...userData,
    createdAt: serverTimestamp(),
  }).catch(async () => {
    // If document doesn't exist, create it
    const { setDoc } = await import("firebase/firestore");
    await setDoc(docRef, {
      ...userData,
      createdAt: serverTimestamp(),
    });
  });
}

export async function updateUser(
  id: string,
  updates: Partial<Omit<AppUser, "id" | "createdAt">>
): Promise<void> {
  const db = getDbInstance();
  const docRef = doc(db, COLLECTIONS.USERS, id);
  await updateDoc(docRef, updates);
}

// AI Usage tracking
export async function getUserLimits(
  userId: string
): Promise<UserLimits | null> {
  const user = await getUser(userId);
  if (!user) return null;

  // Check if limits need reset (monthly)
  if (user.limits) {
    const resetDate =
      user.limits.resetAt instanceof Date
        ? user.limits.resetAt
        : new Date(user.limits.resetAt);

    if (new Date() > resetDate) {
      // Reset limits for new month
      const newLimits = getDefaultLimits(user.plan);
      await updateUser(userId, { limits: newLimits });
      return newLimits;
    }
    return user.limits;
  }

  // Initialize limits if not set
  const defaultLimits = getDefaultLimits(user.plan);
  await updateUser(userId, { limits: defaultLimits });
  return defaultLimits;
}

export async function incrementAIUsage(userId: string): Promise<boolean> {
  const limits = await getUserLimits(userId);
  if (!limits) return false;

  if (limits.aiGenerationsUsed >= limits.aiGenerationsPerMonth) {
    return false; // Limit reached
  }

  await updateUser(userId, {
    limits: {
      ...limits,
      aiGenerationsUsed: limits.aiGenerationsUsed + 1,
    },
  });

  return true;
}

function getDefaultLimits(plan: AppUser["plan"]): UserLimits {
  const planLimits = {
    free: { maxLPs: 3, maxSlidesPerLP: 10, aiGenerationsPerMonth: 10 },
    pro: { maxLPs: 20, maxSlidesPerLP: 20, aiGenerationsPerMonth: 100 },
    enterprise: {
      maxLPs: 1000,
      maxSlidesPerLP: 50,
      aiGenerationsPerMonth: 10000,
    },
  };

  const limits = planLimits[plan] || planLimits.free;

  // Set reset date to first of next month
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);

  return {
    ...limits,
    aiGenerationsUsed: 0,
    resetAt: nextMonth,
  };
}

// Generic query helper
export async function queryCollection<T extends DocumentData>(
  collectionName: string,
  constraints: QueryConstraint[]
): Promise<T[]> {
  const db = getDbInstance();
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  })) as unknown as T[];
}
