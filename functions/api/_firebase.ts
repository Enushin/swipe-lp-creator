interface FirestoreValue {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  timestampValue?: string;
  mapValue?: { fields: Record<string, FirestoreValue> };
}

interface FirestoreDocument {
  fields?: Record<string, FirestoreValue>;
}

export interface UserLimits {
  maxLPs: number;
  maxSlidesPerLP: number;
  aiGenerationsPerMonth: number;
  aiGenerationsUsed: number;
  resetAt: string;
}

export interface UserDoc {
  plan: "free" | "pro" | "enterprise";
  limits: UserLimits;
}

const PLAN_LIMITS: Record<UserDoc["plan"], Omit<UserLimits, "aiGenerationsUsed" | "resetAt">> = {
  free: { maxLPs: 3, maxSlidesPerLP: 10, aiGenerationsPerMonth: 10 },
  pro: { maxLPs: 20, maxSlidesPerLP: 20, aiGenerationsPerMonth: 100 },
  enterprise: {
    maxLPs: 1000,
    maxSlidesPerLP: 50,
    aiGenerationsPerMonth: 10000,
  },
};

function parseNumber(value?: FirestoreValue): number | undefined {
  if (!value) return undefined;
  if (value.integerValue) return Number(value.integerValue);
  if (typeof value.doubleValue === "number") return value.doubleValue;
  return undefined;
}

function parseString(value?: FirestoreValue): string | undefined {
  return value?.stringValue;
}

function parseTimestamp(value?: FirestoreValue): string | undefined {
  return value?.timestampValue || value?.stringValue;
}

function parseLimits(fields?: Record<string, FirestoreValue>): UserLimits | null {
  const limitsMap = fields?.limits?.mapValue?.fields;
  if (!limitsMap) return null;

  const maxLPs = parseNumber(limitsMap.maxLPs) ?? 0;
  const maxSlidesPerLP = parseNumber(limitsMap.maxSlidesPerLP) ?? 0;
  const aiGenerationsPerMonth =
    parseNumber(limitsMap.aiGenerationsPerMonth) ?? 0;
  const aiGenerationsUsed = parseNumber(limitsMap.aiGenerationsUsed) ?? 0;
  const resetAt =
    parseTimestamp(limitsMap.resetAt) || new Date().toISOString();

  return {
    maxLPs,
    maxSlidesPerLP,
    aiGenerationsPerMonth,
    aiGenerationsUsed,
    resetAt,
  };
}

function getDefaultLimits(plan: UserDoc["plan"]): UserLimits {
  const base = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const resetAt = new Date();
  resetAt.setUTCMonth(resetAt.getUTCMonth() + 1);
  resetAt.setUTCDate(1);
  resetAt.setUTCHours(0, 0, 0, 0);
  return {
    ...base,
    aiGenerationsUsed: 0,
    resetAt: resetAt.toISOString(),
  };
}

function limitsToFirestore(limits: UserLimits): FirestoreValue {
  return {
    mapValue: {
      fields: {
        maxLPs: { integerValue: String(limits.maxLPs) },
        maxSlidesPerLP: { integerValue: String(limits.maxSlidesPerLP) },
        aiGenerationsPerMonth: {
          integerValue: String(limits.aiGenerationsPerMonth),
        },
        aiGenerationsUsed: { integerValue: String(limits.aiGenerationsUsed) },
        resetAt: { timestampValue: limits.resetAt },
      },
    },
  };
}

async function firestoreGetDoc(
  projectId: string,
  idToken: string,
  path: string
): Promise<FirestoreDocument | null> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    }
  );

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore read error: ${error}`);
  }
  return (await response.json()) as FirestoreDocument;
}

async function firestoreCreateDoc(
  projectId: string,
  idToken: string,
  collectionPath: string,
  docId: string,
  fields: Record<string, FirestoreValue>
): Promise<void> {
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionPath}?documentId=${docId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore create error: ${error}`);
  }
}

async function firestorePatchDoc(
  projectId: string,
  idToken: string,
  path: string,
  fields: Record<string, FirestoreValue>,
  updateMask: string[]
): Promise<void> {
  const params = updateMask
    .map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`)
    .join("&");
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${path}?${params}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fields }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Firestore update error: ${error}`);
  }
}

export async function enforceAIGenerationLimit(options: {
  projectId: string;
  idToken: string;
  uid: string;
}): Promise<{ allowed: boolean; limits: UserLimits }> {
  const { projectId, idToken, uid } = options;
  const userDoc = await firestoreGetDoc(projectId, idToken, `users/${uid}`);
  const fields = userDoc?.fields || {};
  const planValue = parseString(fields.plan) as UserDoc["plan"] | undefined;
  const plan: UserDoc["plan"] = planValue || "free";

  let limits = parseLimits(fields) || getDefaultLimits(plan);

  const resetAt = new Date(limits.resetAt);
  if (Number.isNaN(resetAt.getTime()) || new Date() > resetAt) {
    limits = getDefaultLimits(plan);
  }

  if (limits.aiGenerationsUsed >= limits.aiGenerationsPerMonth) {
    await upsertUserLimits({ projectId, idToken, uid, plan, limits });
    return { allowed: false, limits };
  }

  limits = {
    ...limits,
    aiGenerationsUsed: limits.aiGenerationsUsed + 1,
  };
  await upsertUserLimits({ projectId, idToken, uid, plan, limits });
  return { allowed: true, limits };
}

async function upsertUserLimits(options: {
  projectId: string;
  idToken: string;
  uid: string;
  plan: UserDoc["plan"];
  limits: UserLimits;
}): Promise<void> {
  const { projectId, idToken, uid, plan, limits } = options;
  const path = `users/${uid}`;
  const now = new Date().toISOString();
  const fields = {
    plan: { stringValue: plan },
    limits: limitsToFirestore(limits),
    updatedAt: { timestampValue: now },
  };

  const existing = await firestoreGetDoc(projectId, idToken, path);
  if (!existing) {
    await firestoreCreateDoc(projectId, idToken, "users", uid, {
      ...fields,
      createdAt: { timestampValue: now },
    });
    return;
  }

  await firestorePatchDoc(projectId, idToken, path, fields, [
    "plan",
    "limits",
    "updatedAt",
  ]);
}

export async function logAIGeneration(options: {
  projectId: string;
  idToken: string;
  uid: string;
  lpId?: string;
  type: "generate" | "regenerate";
  success: boolean;
  model: string;
  slideCount?: number;
}): Promise<void> {
  const { projectId, idToken, uid, lpId, type, success, model, slideCount } =
    options;
  const now = new Date().toISOString();
  const fields: Record<string, FirestoreValue> = {
    userId: { stringValue: uid },
    type: { stringValue: type },
    success: { booleanValue: success },
    model: { stringValue: model },
    createdAt: { timestampValue: now },
  };

  if (lpId) {
    fields.lpId = { stringValue: lpId };
  }
  if (typeof slideCount === "number") {
    fields.slideCount = { integerValue: String(slideCount) };
  }

  try {
    await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/ai_generations`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      }
    );
  } catch (error) {
    console.error("Failed to log AI generation:", error);
  }
}
