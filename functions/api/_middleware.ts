// Cloudflare Pages Functions Middleware
// Handles authentication, CORS, and error handling

interface Env {
  OPENAI_API_KEY: string;
  GOOGLE_AI_API_KEY: string;
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
