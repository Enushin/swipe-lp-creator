// Cloudflare Pages Functions Middleware
// Handles authentication, CORS, and error handling

interface Env {
  OPENAI_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
  GEMINI_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  AUTH_REQUIRED?: string;
}

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

// Handle CORS preflight
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Add CORS headers to response
function addCorsHeaders(response: Response): Response {
  const newHeaders = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newHeaders.set(key, value);
  });
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}

// Error response helper
function errorResponse(message: string, status: number = 500): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

type FirebaseTokenPayload = {
  aud: string;
  iss: string;
  sub: string;
  user_id?: string;
  email?: string;
  exp: number;
  iat: number;
};

type JwksCache = {
  keys: Record<string, JsonWebKey>;
  expiresAt: number;
};

let jwksCache: JwksCache | null = null;

function decodeBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const base64 = pad ? padded + "=".repeat(4 - pad) : padded;
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeBase64UrlJson<T>(input: string): T {
  const bytes = decodeBase64Url(input);
  const text = new TextDecoder().decode(bytes);
  return JSON.parse(text) as T;
}

async function getFirebaseJwks(): Promise<JwksCache> {
  if (jwksCache && Date.now() < jwksCache.expiresAt) {
    return jwksCache;
  }

  const response = await fetch(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Firebase JWKS");
  }
  const data = (await response.json()) as { keys: JsonWebKey[] };
  const keys: Record<string, JsonWebKey> = {};
  data.keys.forEach((key) => {
    if (key.kid) {
      keys[key.kid] = key;
    }
  });

  const cacheControl = response.headers.get("cache-control") || "";
  const match = cacheControl.match(/max-age=(\d+)/);
  const maxAge = match ? Number(match[1]) * 1000 : 60 * 60 * 1000;
  jwksCache = {
    keys,
    expiresAt: Date.now() + maxAge,
  };

  return jwksCache;
}

async function verifyFirebaseIdToken(
  token: string,
  projectId: string
): Promise<FirebaseTokenPayload> {
  const [headerB64, payloadB64, signatureB64] = token.split(".");
  if (!headerB64 || !payloadB64 || !signatureB64) {
    throw new Error("Invalid auth token");
  }

  const header = decodeBase64UrlJson<{ kid?: string; alg?: string }>(
    headerB64
  );
  if (!header.kid || header.alg !== "RS256") {
    throw new Error("Invalid auth token");
  }

  const payload = decodeBase64UrlJson<FirebaseTokenPayload>(payloadB64);
  if (payload.aud !== projectId) {
    throw new Error("Invalid auth token");
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Invalid auth token");
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now || payload.iat > now + 60) {
    throw new Error("Auth token expired");
  }

  const jwks = await getFirebaseJwks();
  const jwk = jwks.keys[header.kid];
  if (!jwk) {
    throw new Error("Auth token key not found");
  }

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["verify"]
  );

  const signature = decodeBase64Url(signatureB64);
  const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    signature,
    data
  );

  if (!verified) {
    throw new Error("Invalid auth token");
  }

  return payload;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env, next } = context;

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return handleOptions();
  }

  // Check for API keys
  if (!env.OPENAI_API_KEY && !env.GOOGLE_AI_API_KEY) {
    console.warn("Warning: No AI API keys configured");
  }

  try {
    const authRequired =
      env.AUTH_REQUIRED === "true" || env.AUTH_REQUIRED === "1";
    const authHeader = request.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";

    if (authRequired || token) {
      if (!token) {
        return errorResponse("Unauthorized", 401);
      }
      if (!env.FIREBASE_PROJECT_ID) {
        return errorResponse("Firebase project not configured", 500);
      }
      const payload = await verifyFirebaseIdToken(
        token,
        env.FIREBASE_PROJECT_ID
      );
      const uid = payload.user_id || payload.sub;
      (context as { data: Record<string, unknown> }).data = {
        user: {
          uid,
          email: payload.email,
          token,
        },
      };
    }

    // Pass environment to the handler
    const response = await next();
    return addCorsHeaders(response);
  } catch (error) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
};
