// Cloudflare Pages Function: Regenerate a single slide image
import { enforceAIGenerationLimit, logAIGeneration } from "./_firebase";

interface Env {
  GOOGLE_AI_API_KEY: string;
  GEMINI_API_KEY?: string;
  FIREBASE_PROJECT_ID?: string;
  AUTH_REQUIRED?: string;
}

interface RegenerateRequest {
  prompt: string;
  style?: string;
  lpId?: string;
}

interface RegenerateResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authRequired = env.AUTH_REQUIRED === "true" || env.AUTH_REQUIRED === "1";
  const user = (context as { data?: { user?: { uid: string; token: string } } })
    .data?.user;
  let input: RegenerateRequest | null = null;

  try {
    input = await request.json();

    if (!input.prompt) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required field: prompt",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const geminiKey = env.GOOGLE_AI_API_KEY || env.GEMINI_API_KEY;
    if (!geminiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Google AI API key not configured",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (authRequired && (!user || !env.FIREBASE_PROJECT_ID)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    if (user && env.FIREBASE_PROJECT_ID) {
      const limitResult = await enforceAIGenerationLimit({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
      });
      if (!limitResult.allowed) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "AI generation limit reached",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Enhanced prompt
    const enhancedPrompt = `
Create a high-quality, modern, professional image for a mobile landing page slide.
Style: ${input.style || "Clean, minimalist, Japanese aesthetic"}
Aspect ratio: 9:16 (vertical mobile format)
No text or words in the image.

${input.prompt}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: enhancedPrompt }],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE", "TEXT"],
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }

    const data = await response.json();

    // Extract image data
    const parts = data.candidates?.[0]?.content?.parts;
    let imageUrl: string | undefined;

    if (parts) {
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No image generated",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result: RegenerateResponse = {
      success: true,
      imageUrl,
    };

    if (user && env.FIREBASE_PROJECT_ID) {
      await logAIGeneration({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
        lpId: input.lpId,
        type: "regenerate",
        success: true,
        model: "gemini-2.0-flash-exp",
      });
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Regenerate slide error:", error);
    if (user && env.FIREBASE_PROJECT_ID) {
      await logAIGeneration({
        projectId: env.FIREBASE_PROJECT_ID,
        idToken: user.token,
        uid: user.uid,
        lpId: input?.lpId,
        type: "regenerate",
        success: false,
        model: "gemini-2.0-flash-exp",
      });
    }
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to regenerate slide",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
